import { Suspense } from "react";
import { getApprovedClubReviews } from "@/lib/db";
import { ClubReviewFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Soccer Club Reviews | Soccer Near Me",
  description: "Read honest reviews of youth soccer clubs from parents, players, and coaches. Rate clubs on price, quality, and coaching.",
};

export default async function ClubReviewsPage() {
  const reviews = await getApprovedClubReviews();
  return <Suspense><ClubReviewFilters reviews={reviews} /></Suspense>;
}
