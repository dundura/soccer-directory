import { Suspense } from "react";
import { searchAllListings } from "@/lib/db";
import { SearchResults } from "./results";
import type { Metadata } from "next";

export const revalidate = 0;

type Props = { searchParams: Promise<{ q?: string; search?: string; type?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, search } = await searchParams;
  const query = (q || search || "").trim();
  return {
    title: query ? `Search: ${query} | Soccer Near Me` : "Search | Soccer Near Me",
    description: query
      ? `Listings matching "${query}" across clubs, teams, trainers, camps, tournaments and more.`
      : "Search every listing on Soccer Near Me — clubs, teams, trainers, camps, tournaments and more.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, search, type } = await searchParams;
  // `search` is accepted too so links built for the category pages keep working
  const query = (q || search || "").trim();
  const results = query ? await searchAllListings(query) : [];

  return (
    <Suspense>
      <SearchResults query={query} results={results} initialType={type || ""} />
    </Suspense>
  );
}
