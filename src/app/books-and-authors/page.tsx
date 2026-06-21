import { Suspense } from "react";
import { getSoccerBooks } from "@/lib/db";
import { SoccerBookFilters } from "./filters";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Books & Authors | Soccer Near Me",
  description: "Discover soccer books from coaches, parents, and players. Strategy, development, coaching guides, and more.",
};

export default async function BooksPage() {
  const books = await getSoccerBooks();
  return <Suspense><SoccerBookFilters soccerbooks={books} /></Suspense>;
}
