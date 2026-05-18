"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Task {
  id: number;
  project_id: number | null;
  name: string;
  total_secs: number;
  done: boolean;
}

interface Project {
  id: number;
  name: string;
  color: string;
  tasks: Task[];
}

const COLORS = ["#0F3154", "#DC373E", "#16a34a", "#0891b2", "#7c3aed", "#d97706", "#0f766e", "#9333ea"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}
function fmtShort(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function ProjectFocus() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [standaloneTasks, setStandaloneTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // New project form
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(COLORS[0]);

  // New standalone task form
  const [newStandaloneTask, setNewStandaloneTask] = useState("");

  // New task under a project
  const [addingTaskTo, setAddingTaskTo] = useState<number | null>(null);
  const [newTaskName, setNewTaskName] = useState("");

  // Active timer
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const newProjectInputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const standaloneInputRef = useRef<HTMLInputElement>(null);

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
    if (startTime !== null) {
      intervalRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startTime]);

  const stopTimer = useCallback(async () => {
    if (startTime === null || activeTaskId === null) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const taskId = activeTaskId;
    const projId = activeProjectId;
    setActiveTaskId(null);
    setActiveProjectId(null);
    setStartTime(null);
    setElapsed(0);
    if (projId !== null) {
      setProjects(prev => prev.map(p => p.id === projId
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, total_secs: t.total_secs + secs } : t) }
        : p));
    } else {
      setStandaloneTasks(prev => prev.map(t => t.id === taskId ? { ...t, total_secs: t.total_secs + secs } : t));
    }
    fetch("/api/focus/projects/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, add_secs: secs }),
    }).catch(() => {});
  }, [startTime, activeTaskId, activeProjectId]);

  const startTimer = (task: Task, projectId: number | null) => {
    if (activeTaskId !== null) stopTimer();
    setActiveTaskId(task.id);
    setActiveProjectId(projectId);
    setStartTime(Date.now());
    setElapsed(0);
  };

  const createProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    const res = await fetch("/api/focus/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color: newProjectColor }),
    }).then(r => r.json());
    if (res.id) setProjects(prev => [res, ...prev]);
    setNewProjectName("");
    setNewProjectColor(COLORS[0]);
    setShowNewProject(false);
  };

  const deleteProject = async (id: number) => {
    if (activeProjectId === id) stopTimer();
    setProjects(prev => prev.filter(p => p.id !== id));
    fetch(`/api/focus/projects?id=${id}`, { method: "DELETE" }).catch(() => {});
  };

  const addTaskToProject = async (projectId: number) => {
    const name = newTaskName.trim();
    if (!name) return;
    const res = await fetch("/api/focus/projects/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, name }),
    }).then(r => r.json());
    if (res.id) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, res] } : p));
    }
    setNewTaskName("");
    setAddingTaskTo(null);
  };

  const addStandaloneTask = async () => {
    const name = newStandaloneTask.trim();
    if (!name) return;
    const res = await fetch("/api/focus/projects/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: null, name }),
    }).then(r => r.json());
    if (res.id) setStandaloneTasks(prev => [...prev, res]);
    setNewStandaloneTask("");
  };

  const toggleTaskDone = (task: Task, projectId: number | null) => {
    const done = !task.done;
    if (projectId !== null) {
      setProjects(prev => prev.map(p => p.id === projectId
        ? { ...p, tasks: p.tasks.map(t => t.id === task.id ? { ...t, done } : t) }
        : p));
    } else {
      setStandaloneTasks(prev => prev.map(t => t.id === task.id ? { ...t, done } : t));
    }
    fetch("/api/focus/projects/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, done }),
    }).catch(() => {});
  };

  const deleteTask = (taskId: number, projectId: number | null) => {
    if (activeTaskId === taskId) stopTimer();
    if (projectId !== null) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p));
    } else {
      setStandaloneTasks(prev => prev.filter(t => t.id !== taskId));
    }
    fetch(`/api/focus/projects/tasks?id=${taskId}`, { method: "DELETE" }).catch(() => {});
  };

  const toggleCollapse = (id: number) => {
    setCollapsed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const projectTotal = (p: Project) => {
    const base = p.tasks.reduce((a, t) => a + t.total_secs, 0);
    return activeProjectId === p.id ? base + elapsed : base;
  };

  const taskDisplaySecs = (task: Task) => {
    return activeTaskId === task.id ? task.total_secs + elapsed : task.total_secs;
  };

  const standaloneTotal = standaloneTasks.reduce((a, t) => a + t.total_secs, 0)
    + (activeProjectId === null && activeTaskId !== null ? elapsed : 0);

  const activeTask = activeProjectId !== null
    ? projects.find(p => p.id === activeProjectId)?.tasks.find(t => t.id === activeTaskId)
    : standaloneTasks.find(t => t.id === activeTaskId);
  const activeProject = projects.find(p => p.id === activeProjectId);

  if (loading) return <div style={{ padding: 40, color: "#6B7D8E", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)", maxWidth: 820, margin: "0 auto", padding: "32px 20px 80px" }}>
      <style>{`
        .pf-del:hover { color: #DC373E !important; }
        .pf-start:hover { opacity: 0.85; }
        .pf-stop:hover { opacity: 0.85; }
        .pf-add-task:hover { background: #ECF1F7 !important; }
        .pf-project-btn:hover { background: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7D8E", marginBottom: 4, fontWeight: 500 }}>Focus</div>
          <h1 style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 28, fontWeight: 700, color: "#0F3154", margin: 0 }}>
            Projects &amp; Tasks
          </h1>
        </div>
        <button
          onClick={() => { setShowNewProject(v => !v); setTimeout(() => newProjectInputRef.current?.focus(), 50); }}
          style={{ background: "#DC373E", color: "#fff", border: "none", borderRadius: 20, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          + New Project
        </button>
      </div>

      {/* Active timer banner */}
      {activeTaskId !== null && (
        <div style={{ background: "linear-gradient(135deg, #0F3154, #1e4a7a)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#DC373E", animation: "fpulse 1.5s infinite" }} />
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                {activeProject ? activeProject.name : "Standalone"} · In progress
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{activeTask?.name}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 28, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {fmt(elapsed)}
            </div>
            <button
              onClick={stopTimer}
              className="pf-stop"
              style={{ background: "#DC373E", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }}
            >
              ■ Stop
            </button>
          </div>
        </div>
      )}

      {/* New project form */}
      {showNewProject && (
        <div style={{ background: "#F8FAFC", border: "1px solid #E1E8EF", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7D8E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>New Project</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              ref={newProjectInputRef}
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createProject(); if (e.key === "Escape") setShowNewProject(false); }}
              placeholder="Project name..."
              style={{ flex: 1, minWidth: 160, border: "1px solid #E1E8EF", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff" }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewProjectColor(c)} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: newProjectColor === c ? "3px solid #fff" : "3px solid transparent", outline: newProjectColor === c ? `2px solid ${c}` : "none", cursor: "pointer", flexShrink: 0 }} />
              ))}
            </div>
            <button onClick={createProject} style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Create
            </button>
            <button onClick={() => setShowNewProject(false)} style={{ background: "none", border: "none", color: "#6B7D8E", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "4px 6px" }}>×</button>
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.map(project => {
        const total = projectTotal(project);
        const isCollapsed = collapsed.has(project.id);
        return (
          <div key={project.id} style={{ marginBottom: 16, borderRadius: 14, overflow: "hidden", border: "1px solid #E1E8EF", boxShadow: "0 2px 8px rgba(15,49,84,0.05)" }}>
            {/* Project header */}
            <div style={{ background: project.color, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <button onClick={() => toggleCollapse(project.id)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "left", padding: 0 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", transition: "transform 0.15s", display: "inline-block", transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
                <span style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontSize: 16, fontWeight: 700, color: "#fff" }}>{project.name}</span>
                {total > 0 && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginLeft: 4 }}>{fmtShort(total)}</span>}
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginLeft: 2 }}>· {project.tasks.length} task{project.tasks.length !== 1 ? "s" : ""}</span>
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => { setAddingTaskTo(project.id); setCollapsed(prev => { const n = new Set(prev); n.delete(project.id); return n; }); setTimeout(() => newTaskInputRef.current?.focus(), 50); }}
                  className="pf-project-btn"
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "5px 12px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                >
                  + Task
                </button>
                <button onClick={() => deleteProject(project.id)} className="pf-del" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "2px 6px", transition: "color 0.15s" }}>×</button>
              </div>
            </div>

            {/* Tasks */}
            {!isCollapsed && (
              <div style={{ background: "#fff" }}>
                {project.tasks.length === 0 && addingTaskTo !== project.id && (
                  <div style={{ padding: "20px 20px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                    No tasks yet — add one above
                  </div>
                )}
                {project.tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    projectId={project.id}
                    accentColor={project.color}
                    isActive={activeTaskId === task.id}
                    displaySecs={taskDisplaySecs(task)}
                    onStart={() => startTimer(task, project.id)}
                    onStop={stopTimer}
                    onToggleDone={() => toggleTaskDone(task, project.id)}
                    onDelete={() => deleteTask(task.id, project.id)}
                  />
                ))}
                {/* Add task input */}
                {addingTaskTo === project.id && (
                  <div style={{ padding: "10px 16px", borderTop: project.tasks.length > 0 ? "1px solid #F1F5F9" : "none", display: "flex", gap: 8 }}>
                    <input
                      ref={newTaskInputRef}
                      value={newTaskName}
                      onChange={e => setNewTaskName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addTaskToProject(project.id); if (e.key === "Escape") { setAddingTaskTo(null); setNewTaskName(""); } }}
                      placeholder="Task name..."
                      style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: "#0F3154", outline: "none" }}
                    />
                    <button onClick={() => addTaskToProject(project.id)} style={{ background: project.color, color: "#fff", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                    <button onClick={() => { setAddingTaskTo(null); setNewTaskName(""); }} style={{ background: "none", border: "none", color: "#6B7D8E", fontSize: 19, cursor: "pointer", lineHeight: 1 }}>×</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Standalone tasks */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7D8E", fontWeight: 700 }}>
            Standalone Tasks {standaloneTotal > 0 && <span style={{ fontWeight: 400 }}>· {fmtShort(standaloneTotal)}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            ref={standaloneInputRef}
            value={newStandaloneTask}
            onChange={e => setNewStandaloneTask(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addStandaloneTask(); }}
            placeholder="Add a standalone task..."
            style={{ flex: 1, border: "1px solid #E1E8EF", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", color: "#0F3154", outline: "none", background: "#fff", boxShadow: "0 1px 4px rgba(15,49,84,0.05)" }}
          />
          <button
            onClick={addStandaloneTask}
            style={{ background: "#0F3154", color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
          >
            + Add
          </button>
        </div>
        {standaloneTasks.length > 0 && (
          <div style={{ border: "1px solid #E1E8EF", borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(15,49,84,0.05)" }}>
            {standaloneTasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                projectId={null}
                accentColor="#0F3154"
                isActive={activeTaskId === task.id}
                displaySecs={taskDisplaySecs(task)}
                onStart={() => startTimer(task, null)}
                onStop={stopTimer}
                onToggleDone={() => toggleTaskDone(task, null)}
                onDelete={() => deleteTask(task.id, null)}
              />
            ))}
          </div>
        )}
        {standaloneTasks.length === 0 && (
          <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>No standalone tasks yet.</div>
        )}
      </div>

      <style>{`@keyframes fpulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.5; transform:scale(0.8); } }`}</style>
    </div>
  );
}

function TaskRow({ task, accentColor, isActive, displaySecs, onStart, onStop, onToggleDone, onDelete }: {
  task: Task;
  projectId: number | null;
  accentColor: string;
  isActive: boolean;
  displaySecs: number;
  onStart: () => void;
  onStop: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
      borderBottom: "1px solid #F1F5F9",
      background: isActive ? "#FEFAFC" : "#fff",
    }}>
      <input type="checkbox" checked={task.done} onChange={onToggleDone} style={{ accentColor, width: 15, height: 15, flexShrink: 0, cursor: "pointer" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: task.done ? "#94a3b8" : "#0F3154", textDecoration: task.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {isActive && <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#DC373E", marginRight: 6, animation: "fpulse 1.5s infinite", verticalAlign: "middle" }} />}
          {task.name}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? accentColor : "#6B7D8E", fontVariantNumeric: "tabular-nums", minWidth: 48, textAlign: "right", flexShrink: 0 }}>
        {displaySecs > 0 ? fmt(displaySecs) : "0:00"}
      </div>
      {isActive ? (
        <button onClick={onStop} className="pf-stop" style={{ background: "#DC373E", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "opacity 0.15s" }}>■ Stop</button>
      ) : (
        <button onClick={onStart} disabled={task.done} className="pf-start" style={{ background: task.done ? "#F1F5F9" : accentColor, color: task.done ? "#94a3b8" : "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: task.done ? "default" : "pointer", fontFamily: "inherit", flexShrink: 0, transition: "opacity 0.15s" }}>▶ Start</button>
      )}
      <button onClick={onDelete} className="pf-del" style={{ background: "none", border: "none", color: "#CBD5E1", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 3px", transition: "color 0.15s", flexShrink: 0 }}>×</button>
    </div>
  );
}
