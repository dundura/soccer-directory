import type { Metadata } from "next";
import { StoreClient } from "./store-client";

export const metadata: Metadata = {
  title: "Soccer Gear We Recommend | Soccer Near Me",
  description: "Trusted soccer equipment and resources to help your player train, recover, and perform at their best.",
};

export default function StorePage() {
  return <StoreClient />;
}
