import { useMemo, useState } from "react";
import "./App.css";

const pad2 = (n) => String(n).padStart(2, "0");
const toKey = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export default function App() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [input, setInput] = useState("");

  // tasksByDate: { "YYYY-MM-DD": [{ id, text, done }] }
  const [tasksByDate, setTasksByDate] = useState({});

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthLabel = useMemo(
    () =>
      `${currentMonth.toLocaleString("default", { month: "long" })} ${year}`,
    [currentMonth, year]
  );

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectedKey = toKey(selectedDate);
  const dayTasks = tasksByDate[selectedKey] || [];

  const todo = dayTasks.filter((t) => !t.done);
  const done = dayTasks.filter((t) => t.done);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const addTask = () => {
    const text = input.trim();
    if (!text) return;

    const newTask = { id: crypto.randomUUID(), text, done: false };
    setTasksByDate((prev) => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []), newTask],
    }));
    setInput("");
  };

  const toggleTask = (id) => {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }));
  };

  const deleteTask = (id) => {
    setTasksByDate((prev) => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || []).filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="app">
      <div className="topbar">
        <h1 className="title">To-Do List</h1>
        <p className="sub">Select a date and add your tasks</p>
      </div>

      <div className="layout">
        {/* Calendar Panel */}
        <div className="panel">
          <div className="calHeader">
            <div className="monthNav">
              <button className="iconBtn" onClick={prevMonth} aria-label="Prev">
                ‹
              </button>

              <div className="monthLabel">{monthLabel}</div>

              <button className="iconBtn" onClick={nextMonth} aria-label="Next">
                ›
              </button>
            </div>
          </div>

          <div className="dow">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="dowCell">
                {d}
              </div>
            ))}
          </div>

          <div className="calendar">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`b-${i}`} className="day blank" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const key = toKey(date);
              const count = (tasksByDate[key] || []).length;

              const isActive = toKey(date) === toKey(selectedDate);

              return (
                <button
                  key={key}
                  className={`dayBtn ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="dayNum">{day}</div>
                  {count > 0 && <span className="badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks Panel */}
        <div className="panel">
          <div className="panelTitle">
            Tasks for <span className="dateChip">{selectedKey}</span>
          </div>

          <div className="addRow">
            <input
              className="taskInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task..."
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button className="addBtn" onClick={addTask}>
              Add
            </button>
          </div>

          <div className="sectionHead">To do ({todo.length})</div>
          <div className="list">
            {todo.length === 0 && <div className="muted">No pending tasks.</div>}
            {todo.map((t) => (
              <div key={t.id} className="taskCard">
                <button className="check" onClick={() => toggleTask(t.id)}>
                  ✓
                </button>
                <div className="taskText">{t.text}</div>
                <button className="trash" onClick={() => deleteTask(t.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="sectionHead">Completed ({done.length})</div>
          <div className="list">
            {done.length === 0 && (
              <div className="muted">Nothing completed yet.</div>
            )}
            {done.map((t) => (
              <div key={t.id} className="taskCard done">
                <button
                  className="check filled"
                  onClick={() => toggleTask(t.id)}
                >
                  ✓
                </button>
                <div className="taskText strike">{t.text}</div>
                <button className="trash" onClick={() => deleteTask(t.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
