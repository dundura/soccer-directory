"use client";

import { useState, useEffect, useRef } from "react";
import { TodoList } from "@/components/todo-list";

interface Comment { id: number; text: string; created_at: string; }
interface Task {
  id: number;
  project_id: number;
  name: string;
  total_secs: number;
  done: boolean;
  comments?: Comment[];
  commentsLoaded?: boolean;
}
interface Project { id: number; name: string; color: string; done: boolean; tasks: Task[]; }

const COLORS = ["#0F3154", "#DC373E", "#16a34a", "#0891b2", "#7c3aed", "#d97706", "#0f766e", "#9333ea"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
function fmtShort(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #E1E8EF",
  boxShadow: "0 2px 8px rgba(15,49,84,0.05)",
};

export function ProjectFocus() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const [showNewProject, setShowNewProject] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newStandaloneTask, setNewStandaloneTask] = useState("");
  const [standaloneTasks, setStandaloneTasks] = useState<Task[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(COLORS[0]);
  const [addingTaskTo, setAddingTaskTo] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const standaloneInputRef = useRef<HTMLInputElement>(null);

  // Multiple timers: taskId → startTime (ms), persisted to localStorage
  const [activeTimers, setActiveTimers] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem("focus_active_timers");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [elapsedMap, setElapsedMap] = useState<Record<number, number>>({});
  const activeTimersRef = useRef<Record<number, number>>({});
  activeTimersRef.current = activeTimers;

  // Persist active timers to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem("focus_active_timers", JSON.stringify(activeTimers)); } catch { /* ignore */ }
  }, [activeTimers]);

  const newProjectInputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/focus/projects").then(r => r.json()),
      fetch("/api/focus/projects/tasks?standalone=1").then(r => r.json()),
    ]).then(([projs, standalone]) => {
      if (Array.isArray(projs)) setProjects(projs);
      if (Array.isArray(standalone)) setStandaloneTasks(standalone);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const timers = activeTimersRef.current;
      if (!Object.keys(timers).length) return;
      const now = Date.now();
      const up: Record<number, number> = {};
      for (const [k, v] of Object.entries(timers)) up[Number(k)] = Math.floor((now - v) / 1000);
      setElapsedMap(up);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const startTimer = (task: Task) => {
    if (task.done) return;
    setActiveTimers(p => ({ ...p, [task.id]: Date.now() }));
    setElapsedMap(p => ({ ...p, [task.id]: 0 }));
  };

  const stopTimer = (task: Task) => {
    const startMs = activeTimersRef.current[task.id];
    if (startMs === undefined) return;
    const secs = Math.floor((Date.now() - startMs) / 1000);
    setActiveTimers(p => { const n = { ...p }; delete n[task.id]; return n; });
    setElapsedMap(p => { const n = { ...p }; delete n[task.id]; return n; });
    if (task.project_id) {
      setProjects(p => p.map(pr => pr.id === task.project_id
        ? { ...pr, tasks: pr.tasks.map(t => t.id === task.id ? { ...t, total_secs: t.total_secs + secs } : t) }
        : pr));
    } else {
      setStandaloneTasks(p => p.map(t => t.id === task.id ? { ...t, total_secs: t.total_secs + secs } : t));
    }
    fetch("/api/focus/projects/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, add_secs: secs }) }).catch(() => {});
  };

  const addStandaloneTask = async () => {
    const name = newStandaloneTask.trim(); if (!name) return;
    const res = await fetch("/api/focus/projects/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: null, name }) }).then(r => r.json());
    if (res.id) setStandaloneTasks(p => [...p, { ...res, comments: [], commentsLoaded: true }]);
    setNewStandaloneTask(""); setShowNewTask(false);
  };

  const stopAll = () => {
    const all = [...projects.flatMap(p => p.tasks), ...standaloneTasks];
    Object.keys(activeTimers).forEach(id => { const t = all.find(x => x.id === Number(id)); if (t) stopTimer(t); });
  };

  const createProject = async () => {
    const name = newProjectName.trim(); if (!name) return;
    const res = await fetch("/api/focus/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, color: newProjectColor }) }).then(r => r.json());
    if (res.id) { setProjects(p => [res, ...p]); setCollapsed(p => { const n = new Set(p); n.delete(res.id); return n; }); }
    setNewProjectName(""); setNewProjectColor(COLORS[0]); setShowNewProject(false);
  };

  const toggleProjectDone = (id: number) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const done = !proj.done;
    if (done) proj.tasks.forEach(t => { if (activeTimers[t.id] !== undefined) stopTimer(t); });
    setProjects(p => p.map(pr => pr.id === id ? { ...pr, done } : pr));
    fetch("/api/focus/projects", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done }) }).catch(() => {});
  };

  const deleteProject = (id: number) => {
    projects.find(p => p.id === id)?.tasks.forEach(t => { if (activeTimers[t.id] !== undefined) stopTimer(t); });
    setProjects(p => p.filter(x => x.id !== id));
    fetch(`/api/focus/projects?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const addTask = async (projectId: number) => {
    const name = newTaskName.trim(); if (!name) return;
    const res = await fetch("/api/focus/projects/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project_id: projectId, name }) }).then(r => r.json());
    if (res.id) setProjects(p => p.map(pr => pr.id === projectId ? { ...pr, tasks: [...pr.tasks, { ...res, comments: [], commentsLoaded: true }] } : pr));
    setNewTaskName(""); setAddingTaskTo(null);
  };

  const toggleTaskDone = (task: Task) => {
    if (activeTimers[task.id] !== undefined) stopTimer(task);
    const done = !task.done;
    if (task.project_id) {
      setProjects(p => p.map(pr => pr.id === task.project_id ? { ...pr, tasks: pr.tasks.map(t => t.id === task.id ? { ...t, done } : t) } : pr));
    } else {
      setStandaloneTasks(p => p.map(t => t.id === task.id ? { ...t, done } : t));
    }
    fetch("/api/focus/projects/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, done }) }).catch(() => {});
  };

  const deleteTask = (task: Task) => {
    if (activeTimers[task.id] !== undefined) stopTimer(task);
    if (task.project_id) {
      setProjects(p => p.map(pr => pr.id === task.project_id ? { ...pr, tasks: pr.tasks.filter(t => t.id !== task.id) } : pr));
    } else {
      setStandaloneTasks(p => p.filter(t => t.id !== task.id));
    }
    fetch(`/api/focus/projects/tasks?id=${task.id}`, { method: "DELETE" }).catch(() => {});
  };

  const updateTaskInState = (taskId: number, projectId: number | null, updater: (t: Task) => Task) => {
    if (projectId !== null) {
      setProjects(p => p.map(pr => pr.id === projectId
        ? { ...pr, tasks: pr.tasks.map(t => t.id === taskId ? updater(t) : t) }
        : pr));
    } else {
      setStandaloneTasks(p => p.map(t => t.id === taskId ? updater(t) : t));
    }
  };

  const loadComments = async (task: Task) => {
    if (task.commentsLoaded) return;
    const rows = await fetch(`/api/focus/projects/tasks/comments?task_id=${task.id}`).then(r => r.json()).catch(() => []);
    updateTaskInState(task.id, task.project_id, t => ({ ...t, comments: Array.isArray(rows) ? rows : [], commentsLoaded: true }));
  };

  const addComment = async (task: Task, text: string) => {
    const res = await fetch("/api/focus/projects/tasks/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task_id: task.id, text }) }).then(r => r.json()).catch(() => null);
    if (res?.id) {
      updateTaskInState(task.id, task.project_id, t => ({ ...t, comments: [...(t.comments || []), res] }));
    }
  };

  const deleteComment = (task: Task, commentId: number) => {
    updateTaskInState(task.id, task.project_id, t => ({ ...t, comments: (t.comments || []).filter(c => c.id !== commentId) }));
    fetch(`/api/focus/projects/tasks/comments?id=${commentId}`, { method: "DELETE" }).catch(() => {});
  };

  const toggleCollapse = (id: number) => setCollapsed(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const projectTotal = (pr: Project) => pr.tasks.reduce((a, t) => a + t.total_secs + (elapsedMap[t.id] ?? 0), 0);
  const taskDisplaySecs = (t: Task) => t.total_secs + (elapsedMap[t.id] ?? 0);
  const runningCount = Object.keys(activeTimers).length;

  if (loading) return <div style={{ padding: 40, color: "#6B7D8E", fontFamily: "var(--font-body,'DM Sans',sans-serif)" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "var(--font-body,'DM Sans',sans-serif)", maxWidth: 940, margin: "0 auto", padding: "32px 20px 80px" }}>
      <style>{`
        .pf-del:hover{color:#DC373E!important}
        .pf-pb:hover{background:rgba(255,255,255,0.18)!important}
        @keyframes fpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
      `}</style>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 500 }}>Focus</div>
          <h1 style={{ fontFamily: "var(--font-display,'Outfit',sans-serif)", fontSize: 28, fontWeight: 700, color: "#0F3154", margin: 0 }}>
            Track what <span style={{ color: "#DC373E" }}>matters.</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {projects.filter(p => p.done).length > 0 && (
            <button onClick={() => setShowCompleted(v => !v)}
              style={{ background: "none", border: "1px solid #E1E8EF", borderRadius: 20, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#6B7D8E" }}>
              {showCompleted ? "Hide" : "Completed"} ({projects.filter(p => p.done).length})
            </button>
          )}
          <button onClick={() => { setShowNewProject(v => !v); setTimeout(() => newProjectInputRef.current?.focus(), 50); }}
            style={{ background: "#DC373E", color: "#fff", border: "none", borderRadius: 20, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            + New Project
          </button>
        </div>
      </div>

      {/* Two-section grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)", gap: 20, alignItems: "start" }}>

        {/* LEFT — Current Task */}
        <div style={{ ...card, padding: "22px 20px", position: "sticky", top: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B7D8E", fontWeight: 700, marginBottom: 14 }}>Current Task</div>
          {runningCount === 0 ? (
            <div style={{ fontSize: 14, color: "#94a3b8", textAlign: "center", padding: "30px 0" }}>
              No tasks running.<br />
              <span style={{ fontSize: 12 }}>Hit ▶ Start on any subtask.</span>
            </div>
          ) : (
            <>
              {[...projects.flatMap(p => p.tasks), ...standaloneTasks].filter(t => activeTimers[t.id] !== undefined).map(t => (
                <div key={t.id} style={{ marginBottom: 12, padding: "14px 16px", background: "linear-gradient(135deg,#0F3154,#1e4a7a)", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#DC373E", marginRight: 6, animation: "fpulse 1.5s infinite", verticalAlign: "middle" }} />
                    {projects.find(p => p.id === t.project_id)?.name ?? "Task"}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{t.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: "var(--font-display,'Outfit',sans-serif)", fontSize: 32, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                      {fmt(elapsedMap[t.id] ?? 0)}
                    </div>
                    <button onClick={() => stopTimer(t)} style={{ background: "#DC373E", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>■ Stop</button>
                  </div>
                </div>
              ))}
              {runningCount > 1 && (
                <button onClick={stopAll} style={{ width: "100%", marginTop: 4, background: "#F1F5F9", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, color: "#6B7D8E", cursor: "pointer", fontFamily: "inherit" }}>
                  ■ Stop All ({runningCount})
                </button>
              )}
            </>
          )}
        </div>

        {/* RIGHT — Tasks + Projects */}
        <div>
          {/* Standalone tasks */}
          <div style={{ ...card, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B7D8E", fontWeight: 700 }}>Tasks</div>
              <button onClick={() => { setShowNewTask(v => !v); setTimeout(() => standaloneInputRef.current?.focus(), 50); }}
                style={{ fontSize: 12, color: "#DC373E", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                + Add Task
              </button>
            </div>
            {showNewTask && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input ref={standaloneInputRef} value={newStandaloneTask} onChange={e => setNewStandaloneTask(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addStandaloneTask(); if (e.key === "Escape") { setShowNewTask(false); setNewStandaloneTask(""); } }}
                  placeholder="Task name..."
                  style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
                <button onClick={addStandaloneTask} style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                <button onClick={() => { setShowNewTask(false); setNewStandaloneTask(""); }} style={{ background: "none", border: "none", color: "#6B7D8E", fontSize: 18, cursor: "pointer" }}>×</button>
              </div>
            )}
            {standaloneTasks.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94a3b8", padding: "8px 0" }}>No tasks yet.</div>
            ) : (
              <div style={{ border: "1px solid #F1F5F9", borderRadius: 8, overflow: "hidden" }}>
                {standaloneTasks.map(task => (
                  <TaskRow key={task.id} task={task} accentColor="#0F3154"
                    isActive={activeTimers[task.id] !== undefined}
                    displaySecs={task.total_secs + (elapsedMap[task.id] ?? 0)}
                    onStart={() => startTimer(task)} onStop={() => stopTimer(task)}
                    onToggleDone={() => toggleTaskDone(task)} onDelete={() => deleteTask(task)}
                    onExpandComments={() => loadComments(task)}
                    onAddComment={text => addComment(task, text)}
                    onDeleteComment={cid => deleteComment(task, cid)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* New project form */}
          {showNewProject && (
            <div style={{ ...card, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7D8E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>New Project</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input ref={newProjectInputRef} value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") createProject(); if (e.key === "Escape") setShowNewProject(false); }}
                  placeholder="Project name..."
                  style={{ flex: 1, minWidth: 140, border: "1px solid #E1E8EF", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
                <div style={{ display: "flex", gap: 5 }}>
                  {COLORS.map(c => <button key={c} onClick={() => setNewProjectColor(c)} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: newProjectColor === c ? "3px solid #fff" : "3px solid transparent", outline: newProjectColor === c ? `2px solid ${c}` : "none", cursor: "pointer" }} />)}
                </div>
                <button onClick={createProject} style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>Create</button>
                <button onClick={() => setShowNewProject(false)} style={{ background: "none", border: "none", color: "#6B7D8E", fontSize: 20, cursor: "pointer" }}>×</button>
              </div>
            </div>
          )}

          {projects.length === 0 && (
            <div style={{ ...card, padding: "48px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              No projects yet — click <strong style={{ color: "#DC373E" }}>+ New Project</strong>
            </div>
          )}

          {[...projects.filter(p => !p.done), ...(showCompleted ? projects.filter(p => p.done) : [])].map(project => {
            const total = projectTotal(project);
            const isCollapsed = collapsed.has(project.id);
            const doneCount = project.tasks.filter(t => t.done).length;
            return (
              <div key={project.id} style={{ ...card, marginBottom: 14, overflow: "hidden", opacity: project.done ? 0.65 : 1 }}>
                <div style={{ background: project.done ? "#94a3b8" : project.color, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                    <input type="checkbox" checked={project.done} onChange={() => toggleProjectDone(project.id)}
                      style={{ width: 15, height: 15, flexShrink: 0, cursor: "pointer", accentColor: "#fff" }} title={project.done ? "Mark active" : "Mark complete"} />
                    <button onClick={() => toggleCollapse(project.id)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "left", padding: 0, minWidth: 0 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "inline-block", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>▼</span>
                      <span style={{ fontFamily: "var(--font-display,'Outfit',sans-serif)", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: project.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
                        {total > 0 ? fmtShort(total) + "  ·  " : ""}{doneCount}/{project.tasks.length} done
                      </span>
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    {!project.done && (
                      <button onClick={() => { setAddingTaskTo(project.id); setCollapsed(p => { const n = new Set(p); n.delete(project.id); return n; }); setTimeout(() => newTaskInputRef.current?.focus(), 50); }}
                        className="pf-pb"
                        style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "4px 10px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
                        + Subtask
                      </button>
                    )}
                    <button onClick={() => deleteProject(project.id)} className="pf-del" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 17, cursor: "pointer", lineHeight: 1, padding: "2px 5px", transition: "color 0.15s" }}>×</button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div>
                    {project.tasks.length === 0 && addingTaskTo !== project.id && (
                      <div style={{ padding: "16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No subtasks — click + Subtask</div>
                    )}
                    {project.tasks.map(task => (
                      <TaskRow key={task.id} task={task} accentColor={project.color}
                        isActive={activeTimers[task.id] !== undefined}
                        displaySecs={taskDisplaySecs(task)}
                        onStart={() => startTimer(task)} onStop={() => stopTimer(task)}
                        onToggleDone={() => toggleTaskDone(task)} onDelete={() => deleteTask(task)}
                        onExpandComments={() => loadComments(task)}
                        onAddComment={(text) => addComment(task, text)}
                        onDeleteComment={(cid) => deleteComment(task, cid)}
                      />
                    ))}
                    {addingTaskTo === project.id && (
                      <div style={{ padding: "10px 14px", borderTop: project.tasks.length > 0 ? "1px solid #F1F5F9" : "none", display: "flex", gap: 8 }}>
                        <input ref={newTaskInputRef} value={newTaskName} onChange={e => setNewTaskName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addTask(project.id); if (e.key === "Escape") { setAddingTaskTo(null); setNewTaskName(""); } }}
                          placeholder="Subtask name..."
                          style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }} />
                        <button onClick={() => addTask(project.id)} style={{ background: project.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                        <button onClick={() => { setAddingTaskTo(null); setNewTaskName(""); }} style={{ background: "none", border: "none", color: "#6B7D8E", fontSize: 18, cursor: "pointer" }}>×</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {/* Big Rocks */}
          <div style={{ ...card, padding: "22px 20px", marginTop: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B7D8E", fontWeight: 700, marginBottom: 4 }}>Big Rocks</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Important goals you want to keep in mind</div>
            <TodoList storageKey="bigrocks" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, accentColor, isActive, displaySecs, onStart, onStop, onToggleDone, onDelete, onExpandComments, onAddComment, onDeleteComment }: {
  task: Task; accentColor: string; isActive: boolean; displaySecs: number;
  onStart: () => void; onStop: () => void; onToggleDone: () => void; onDelete: () => void;
  onExpandComments: () => void; onAddComment: (t: string) => void; onDeleteComment: (id: number) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next) { onExpandComments(); setTimeout(() => commentInputRef.current?.focus(), 80); }
  };

  const submit = () => {
    const text = commentInput.trim();
    if (!text) return;
    onAddComment(text);
    setCommentInput("");
  };

  return (
    <div style={{ borderBottom: "1px solid #F1F5F9" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", background: isActive ? "#F8FAFF" : "#fff" }}>
        <input type="checkbox" checked={task.done} onChange={onToggleDone} style={{ accentColor, width: 14, height: 14, flexShrink: 0, cursor: "pointer" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: task.done ? "#94a3b8" : "#0F3154", textDecoration: task.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isActive && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#DC373E", marginRight: 6, animation: "fpulse 1.5s infinite", verticalAlign: "middle" }} />}
            {task.name}
          </div>
        </div>
        <button onClick={toggleComments} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: showComments ? "#0F3154" : "#94a3b8", padding: "2px 6px", fontFamily: "inherit" }} title="Notes">
          💬 {task.comments && task.comments.length > 0 ? task.comments.length : ""}
        </button>
        <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? accentColor : "#6B7D8E", fontVariantNumeric: "tabular-nums", minWidth: 40, textAlign: "right", flexShrink: 0 }}>
          {displaySecs > 0 ? fmt(displaySecs) : "0:00"}
        </div>
        {isActive
          ? <button onClick={onStop} style={{ background: "#DC373E", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>■ Stop</button>
          : <button onClick={onStart} disabled={task.done} style={{ background: task.done ? "#F1F5F9" : accentColor, color: task.done ? "#94a3b8" : "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: task.done ? "default" : "pointer", fontFamily: "inherit", flexShrink: 0 }}>▶ Start</button>
        }
        <button onClick={onDelete} className="pf-del" style={{ background: "none", border: "none", color: "#CBD5E1", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 2px", transition: "color 0.15s", flexShrink: 0 }}>×</button>
      </div>

      {showComments && (
        <div style={{ padding: "8px 14px 12px 36px", background: "#FAFBFC", borderTop: "1px solid #F1F5F9" }}>
          {(task.comments || []).map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 13, color: "#374151", flex: 1, lineHeight: 1.45 }}>{c.text}</span>
              <button onClick={() => onDeleteComment(c.id)} className="pf-del" style={{ background: "none", border: "none", color: "#CBD5E1", fontSize: 14, cursor: "pointer", lineHeight: 1, padding: 0, flexShrink: 0, transition: "color 0.15s" }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input ref={commentInputRef} value={commentInput} onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setShowComments(false); }}
              placeholder="Add a note..."
              style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 7, padding: "7px 10px", fontSize: 12, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff" }} />
            <button onClick={submit} style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
