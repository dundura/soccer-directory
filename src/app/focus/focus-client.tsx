"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FocusTracker } from "@/components/focus-tracker";
import { TodoList } from "@/components/todo-list";

type RightTab = "todo" | "project";

export default function FocusClient() {
  const { status } = useSession();
  const router = useRouter();
  const [rightTab, setRightTab] = useState<RightTab>("todo");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/dashboard?redirect=/focus");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", fontFamily: "var(--font-body, 'DM Sans', sans-serif)", color: "#6B7D8E" }}>
        Loading...
      </div>
    );
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "7px 18px",
    borderRadius: 20,
    border: "none",
    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    background: active ? "#0F3154" : "transparent",
    color: active ? "#fff" : "#6B7D8E",
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 80px", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 500 }}>Workspace</div>
        <h1 style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 30, fontWeight: 700, color: "#0F3154", margin: 0 }}>
          Focus &amp; Planning
        </h1>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 24,
        alignItems: "start",
      }}>
        {/* Left: Focus Tracker */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF", padding: "28px 24px", boxShadow: "0 2px 8px rgba(15,49,84,0.06)" }}>
          <FocusTracker />
        </div>

        {/* Right: Todo / Project */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF", padding: "28px 24px", boxShadow: "0 2px 8px rgba(15,49,84,0.06)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "#F1F5F9", borderRadius: 24, padding: 4, width: "fit-content" }}>
            <button style={tabStyle(rightTab === "todo")} onClick={() => setRightTab("todo")}>Todo List</button>
            <button style={tabStyle(rightTab === "project")} onClick={() => setRightTab("project")}>Project</button>
          </div>
          {rightTab === "todo" && <TodoList storageKey="todo" />}
          {rightTab === "project" && <TodoList storageKey="project" projectMode />}
        </div>
      </div>
    </div>
  );
}
