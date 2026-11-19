import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string; seriesSlug: string }> };

// Books in a series are now listed on the listing itself, so old series links land there.
export default async function BookSeriesPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/books-and-authors/${slug}`);
}
