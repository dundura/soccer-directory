import FocusClient from "./focus-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Focus Tracker | Soccer Near Me",
  description: "Track your focused work sessions.",
};

export default function FocusPage() {
  return <FocusClient />;
}
