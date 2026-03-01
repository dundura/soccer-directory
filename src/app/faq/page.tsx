import { FAQPage } from "./faq-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Anytime Soccer Training Help Center | Soccer Near Me",
  description: "Find answers to common questions about Anytime Soccer Training — getting started, team setup, homework, account management, and training tips.",
};

export default function Page() {
  return <FAQPage />;
}
