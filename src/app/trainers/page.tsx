import { Suspense } from "react";
import { getTrainers } from "@/lib/db";
import { TrainerFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Soccer Trainers & Coaches | Soccer Near Me",
  description: "Find verified private soccer trainers and coaches near you. Technical skills, goalkeeper training, speed & agility, and more.",
};

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return <Suspense><TrainerFilters trainers={trainers} /></Suspense>;
}
