import { Suspense } from "react";
import { getRecruiters } from "@/lib/db";
import { RecruiterFilters } from "./filters";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "College Recruiting Advisors | Soccer Near Me",
  description: "Find college soccer recruiting advisors to help navigate the recruiting process. NCAA D1, D2, D3, NAIA, and JUCO placement specialists.",
};

export default async function RecruitersPage() {
  const recruiters = await getRecruiters();
  return <Suspense><RecruiterFilters recruiters={recruiters} /></Suspense>;
}
