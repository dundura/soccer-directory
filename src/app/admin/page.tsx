import AdminClient from "./admin-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | Soccer Near Me",
};

export default function AdminPage() {
  return <AdminClient />;
}
