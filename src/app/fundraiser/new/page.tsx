import { redirect } from "next/navigation";

export default function NewFundraiserPage() {
  redirect("/dashboard?type=fundraiser");
}
