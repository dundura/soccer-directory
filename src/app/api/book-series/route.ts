import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  getBookSeriesForBook,
  createBookSeries,
  updateBookSeries,
  deleteBookSeries,
  toggleBookSeriesPin,
  reorderBookSeries,
  reorderBooksInSeries,
  removeBookFromSeries,
  addBookToSeries,
  getListingOwnerIdById,
  getUserByEmail,
} from "@/lib/db";

async function isOwnerOrAdmin(userId: string, email: string | undefined, bookId: string): Promise<boolean> {
  const ownerId = await getListingOwnerIdById("soccerbook", bookId);
  if (ownerId === userId) return true;
  if (email) {
    const user = await getUserByEmail(email);
    if (user?.role === "admin") return true;
  }
  return false;
}

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim().slice(0, max) : "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });
  const series = await getBookSeriesForBook(bookId);
  return NextResponse.json({ series });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { action, bookId, seriesId } = body;
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

  const allowed = await isOwnerOrAdmin(session.user.id, session.user.email ?? undefined, bookId);
  if (!allowed) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  try {
    const title = clean(body.title, 200);
    const details = {
      title,
      description: clean(body.description, 2000),
      previewImage: clean(body.previewImage, 1000),
    };

    if (action === "createSeries") {
      if (!title) return NextResponse.json({ error: "Series name required" }, { status: 400 });
      const id = await createBookSeries(bookId, details);
      return NextResponse.json({ id });
    }

    // Everything below acts on a series, which must belong to this book's author.
    const owned = await getBookSeriesForBook(bookId);

    if (action === "reorderSeries") {
      const ownedIds = new Set(owned.map((series) => series.id));
      const order = Array.isArray(body.order) ? body.order.filter((id: string) => ownedIds.has(id)) : [];
      await reorderBookSeries(order);
      return NextResponse.json({ success: true });
    }

    const series = owned.find((item) => item.id === seriesId);
    if (!series) return NextResponse.json({ error: "Series not found" }, { status: 404 });

    if (action === "updateSeries") {
      if (!title) return NextResponse.json({ error: "Series name required" }, { status: 400 });
      await updateBookSeries(series.id, details);
    } else if (action === "deleteSeries") {
      await deleteBookSeries(series.id);
    } else if (action === "togglePin") {
      await toggleBookSeriesPin(series.id);
    } else if (action === "reorderBooks") {
      await reorderBooksInSeries(series.id, Array.isArray(body.order) ? body.order : []);
    } else if (action === "removeBook") {
      if (!body.targetBookId) return NextResponse.json({ error: "Missing book" }, { status: 400 });
      await removeBookFromSeries(series.id, body.targetBookId);
    } else if (action === "addBook") {
      if (!title) return NextResponse.json({ error: "Book title required" }, { status: 400 });
      const slug = await addBookToSeries(bookId, series.id, {
        name: title,
        imageUrl: clean(body.imageUrl, 1000),
        description: clean(body.description, 5000),
        website: clean(body.website, 1000),
        price: clean(body.price, 50),
      });
      revalidatePath("/books-and-authors");
      return NextResponse.json({ slug });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "BOOK_TITLE_TAKEN") {
      return NextResponse.json({ error: "A book with this title is already listed." }, { status: 409 });
    }
    console.error("Book series API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
