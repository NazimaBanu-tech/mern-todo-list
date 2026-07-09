import { useState, useEffect, useMemo } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "./api";
import "./App.css";

// Standard categories list
const DEFAULT_CATEGORIES = [
  "Personal",
  "Work",
  "Study",
  "Health",
  "Shopping",
  "Finance",
  "Projects",
  "Other"
];

// Helper to format Date objects as YYYY-MM-DD
const formatDateStr = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// SVG Icon Helper Components
const IconDashboard = () => (
  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
);
const IconList = () => (
  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);
const IconKanban = () => (
  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
);
const IconCalendar = () => (
  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const IconArchive = () => (
  <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
const IconRestore = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, list, kanban, calendar, archived
  
  // Custom Category State
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem("custom_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [newCatInput, setNewCatInput] = useState("");

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate"); // dueDate, priority, status

  // Selected date for calendar view
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(today);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Confirmation states
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, onConfirm }

  // Toasts Alert States
  const [toasts, setToasts] = useState([]);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Personal");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formDueDate, setFormDueDate] = useState(formatDateStr(today));
  const [formDueTime, setFormDueTime] = useState("12:00");
  const [formStatus, setFormStatus] = useState("To Do");
  const [formTags, setFormTags] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Fetch Tasks on Mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error loading tasks:", err);
      showToast(`Error loading tasks: ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Toast Helpers
  const showToast = (message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Add Category Helper
  const handleAddCategory = (e) => {
    e.preventDefault();
    const clean = newCatInput.trim();
    if (!clean) return;
    if (customCategories.includes(clean)) {
      showToast("Category already exists", "warning");
      return;
    }
    const updated = [...customCategories, clean];
    setCustomCategories(updated);
    localStorage.setItem("custom_categories", JSON.stringify(updated));
    setNewCatInput("");
    showToast(`Category "${clean}" added!`, "success");
  };

  // Delete Category Helper
  const handleDeleteCategory = (catName) => {
    if (DEFAULT_CATEGORIES.includes(catName)) {
      showToast("Default categories cannot be deleted", "error");
      return;
    }
    const updated = customCategories.filter(c => c !== catName);
    setCustomCategories(updated);
    localStorage.setItem("custom_categories", JSON.stringify(updated));
    showToast(`Category deleted`, "info");
  };

  // Open Modal for Create or Edit
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormTitle(task.text || "");
      setFormDescription(task.description || "");
      setFormCategory(task.category || "Personal");
      setFormPriority(task.priority || "Medium");
      setFormDueDate(task.date || formatDateStr(today));
      setFormDueTime(task.dueTime || "12:00");
      setFormStatus(task.status || (task.completed ? "Completed" : "To Do"));
      setFormTags(task.tags ? task.tags.join(", ") : "");
      setFormNotes(task.notes || "");
    } else {
      setEditingTask(null);
      setFormTitle("");
      setFormDescription("");
      setFormCategory("Personal");
      setFormPriority("Medium");
      setFormDueDate(formatDateStr(today));
      setFormDueTime("12:00");
      setFormStatus("To Do");
      setFormTags("");
      setFormNotes("");
    }
    setShowFormModal(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const title = formTitle.trim();
    if (!title) {
      showToast("Title is required", "error");
      return;
    }

    const tagsArray = formTags
      ? formTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const taskPayload = {
      text: title,
      date: formDueDate || formatDateStr(new Date()),
      completed: formStatus === "Completed",
      description: formDescription,
      category: formCategory,
      priority: formPriority,
      dueTime: formDueTime,
      status: formStatus,
      tags: tagsArray,
      notes: formNotes
    };

    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, taskPayload);
        setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? updated : t)));
        showToast("Task updated successfully");
      } else {
        const saved = await createTask(taskPayload);
        setTasks((prev) => [...prev, saved]);
        showToast("Task created successfully");
      }
      setShowFormModal(false);
    } catch (err) {
      console.error("Error saving task:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      showToast(`Failed to save task: ${serverMsg}`, "error");
    }
  };

  // Delete Task helper with prompt
  const handleDeleteTaskPrompt = (id) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this task forever?",
      onConfirm: async () => {
        try {
          await deleteTask(id);
          setTasks((prev) => prev.filter((t) => t._id !== id));
          showToast("Task deleted forever", "info");
        } catch (err) {
          console.error("Error deleting task:", err);
          showToast(`Error deleting task: ${err.response?.data?.message || err.message}`, "error");
        }
        setConfirmDialog(null);
      }
    });
  };

  // Archive Task
  const handleArchiveTask = async (task) => {
    try {
      const updated = await updateTask(task._id, { archived: true });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      showToast("Task archived", "success");
    } catch (err) {
      console.error("Error archiving task:", err);
      showToast(`Error archiving task: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Restore Archived Task
  const handleRestoreTask = async (task) => {
    try {
      const updated = await updateTask(task._id, { archived: false });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      showToast("Task restored to list", "success");
    } catch (err) {
      console.error("Error restoring task:", err);
      showToast(`Error restoring task: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Toggle Task Status (Checkbox)
  const handleToggleTaskStatus = async (task) => {
    const isCompleted = !task.completed;
    const newStatus = isCompleted ? "Completed" : "To Do";
    try {
      const updated = await updateTask(task._id, {
        completed: isCompleted,
        status: newStatus
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      showToast(isCompleted ? "Task marked completed" : "Task marked incomplete");
    } catch (err) {
      console.error("Error updating task status:", err);
      showToast(`Error updating task status: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Duplicate Task
  const handleDuplicateTask = async (task) => {
    try {
      const copyPayload = {
        ...task,
        _id: undefined,
        text: `${task.text} (Copy)`,
        createdAt: undefined,
        updatedAt: undefined
      };
      const saved = await createTask(copyPayload);
      setTasks((prev) => [...prev, saved]);
      showToast("Task duplicated");
    } catch (err) {
      console.error("Error duplicating task:", err);
      showToast(`Error duplicating task: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Kanban Drag & Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    if (task.status === targetStatus) return;

    try {
      const updated = await updateTask(taskId, {
        status: targetStatus,
        completed: targetStatus === "Completed"
      });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
      showToast(`Moved to ${targetStatus}`);
    } catch (err) {
      console.error("Error updating column status:", err);
      showToast(`Error moving task: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Quick Add handler (from search bar / quick add box)
  const handleQuickAdd = async (text) => {
    const clean = text.trim();
    if (!clean) return;
    try {
      const payload = {
        text: clean,
        date: formatDateStr(today),
        category: "Personal",
        priority: "Medium",
        status: "To Do",
        completed: false
      };
      const saved = await createTask(payload);
      setTasks((prev) => [...prev, saved]);
      showToast("Task created successfully");
    } catch (err) {
      console.error("Error creating task:", err);
      showToast(`Error creating task: ${err.response?.data?.message || err.message}`, "error");
    }
  };

  // Date and Countdown Calculations
  const getCountdownString = (dueDateStr, dueTimeStr) => {
    if (!dueDateStr) return "";
    const dueTime = dueTimeStr || "00:00";
    const dueDateTime = new Date(`${dueDateStr}T${dueTime}`);
    const now = new Date();

    const diffMs = dueDateTime - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      const daysOverdue = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      return daysOverdue === 0 ? "Overdue today" : `Overdue by ${daysOverdue}d`;
    }
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `In ${diffDays} days`;
  };

  const isOverdue = (dueDateStr, status) => {
    if (status === "Completed") return false;
    const now = new Date();
    const todayStr = formatDateStr(now);
    return dueDateStr < todayStr;
  };

  const isDueToday = (dueDateStr) => {
    const now = new Date();
    return dueDateStr === formatDateStr(now);
  };

  // Computed Filtered & Sorted Tasks Lists
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Exclude archived tasks from active views, include in archived view
        if (currentView === "archived") return t.archived === true;
        return !t.archived;
      })
      .filter((t) => {
        // Category Filter
        if (filterCategory === "All") return true;
        return t.category === filterCategory;
      })
      .filter((t) => {
        // Priority Filter
        if (filterPriority === "All") return true;
        return t.priority === filterPriority;
      })
      .filter((t) => {
        // Status Filter
        if (filterStatus === "All") return true;
        const currentStatus = t.status || (t.completed ? "Completed" : "To Do");
        return currentStatus === filterStatus;
      })
      .filter((t) => {
        // Live Search query
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const textMatch = t.text.toLowerCase().includes(query);
        const descMatch = (t.description || "").toLowerCase().includes(query);
        const tagsMatch = t.tags ? t.tags.some(tag => tag.toLowerCase().includes(query)) : false;
        return textMatch || descMatch || tagsMatch;
      })
      .sort((a, b) => {
        // Sorting
        if (sortBy === "dueDate") {
          return (a.date || "").localeCompare(b.date || "");
        }
        if (sortBy === "priority") {
          const priorityWeights = { High: 3, Medium: 2, Low: 1 };
          const aWeight = priorityWeights[a.priority] || 2;
          const bWeight = priorityWeights[b.priority] || 2;
          return bWeight - aWeight; // Descending Priority
        }
        if (sortBy === "status") {
          return (a.status || "").localeCompare(b.status || "");
        }
        return 0;
      });
  }, [tasks, currentView, filterCategory, filterPriority, filterStatus, searchQuery, sortBy]);

  // Dashboard Stats Calculations
  const dashboardStats = useMemo(() => {
    const activeTasks = tasks.filter(t => !t.archived);
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.completed || t.status === "Completed").length;
    const pending = total - completed;
    const overdue = activeTasks.filter(t => isOverdue(t.date, t.status || (t.completed ? "Completed" : "To Do"))).length;
    const todayCount = activeTasks.filter(t => isDueToday(t.date)).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, todayCount, completionRate };
  }, [tasks]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Blank days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ blank: true });
    }
    // Real days
    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = formatDateStr(dateObj);
      const dayTasks = tasks.filter(t => !t.archived && t.date === dateStr);
      days.push({
        blank: false,
        day,
        dateStr,
        tasks: dayTasks,
        isToday: dateStr === formatDateStr(today),
        isActive: dateStr === formatDateStr(selectedCalendarDate)
      });
    }
    return days;
  }, [currentMonth, tasks, selectedCalendarDate]);

  const monthLabel = `${currentMonth.toLocaleString("default", { month: "long" })} ${currentMonth.getFullYear()}`;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Rendering Helper for Task Cards
  const renderTaskCard = (task) => {
    const overdue = isOverdue(task.date, task.status);
    const dueToday = isDueToday(task.date);
    const countdown = getCountdownString(task.date, task.dueTime);

    return (
      <div
        key={task._id}
        className={`task-card priority-${task.priority || "Medium"}`}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
      >
        <div className="task-card-header">
          <div className="task-checkbox-container">
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.completed || task.status === "Completed"}
              onChange={() => handleToggleTaskStatus(task)}
            />
            <span className={`task-title ${task.completed ? "strike" : ""}`}>
              {task.text}
            </span>
          </div>

          <div className="task-card-actions">
            <button className="action-icon-btn" onClick={() => openModal(task)} title="Edit">
              <IconEdit />
            </button>
            <button className="action-icon-btn" onClick={() => handleDuplicateTask(task)} title="Duplicate">
              <IconCopy />
            </button>
            {!task.archived ? (
              <button className="action-icon-btn" onClick={() => handleArchiveTask(task)} title="Archive">
                <IconArchive />
              </button>
            ) : (
              <button className="action-icon-btn" onClick={() => handleRestoreTask(task)} title="Restore">
                <IconRestore />
              </button>
            )}
            <button className="action-icon-btn delete" onClick={() => handleDeleteTaskPrompt(task._id)} title="Delete">
              <IconTrash />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta-row">
          <span className="meta-pill category">{task.category || "Personal"}</span>
          <span className={`meta-pill priority-${task.priority || "Medium"}`}>{task.priority || "Medium"}</span>
          {task.date && (
            <span className={`meta-pill date ${overdue ? "overdue" : ""} ${dueToday ? "today" : ""}`}>
              {task.date} {task.dueTime ? `@ ${task.dueTime}` : ""}
            </span>
          )}
          {countdown && (
            <span className={`countdown-timer ${overdue ? "danger" : ""}`}>{countdown}</span>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="task-meta-row" style={{ marginTop: "4px" }}>
            {task.tags.map((tag, idx) => (
              <span key={idx} style={{ fontSize: "10px", opacity: 0.7 }} className="meta-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Toast Messages container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Confirmation modal */}
      {confirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content dialog-content">
            <div className="dialog-icon">🌿</div>
            <p style={{ fontWeight: "700", marginBottom: "20px" }}>{confirmDialog.message}</p>
            <div className="form-actions" style={{ justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDialog(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: "var(--danger)" }} onClick={confirmDialog.onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Main form modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? "Edit Task" : "Create New Task"}</h3>
              <button className="close-btn" onClick={() => setShowFormModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveTask} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  className="form-input"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  placeholder="Task details..."
                  className="form-textarea"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {customCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="study, math, project"
                    className="form-input"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  rows="2"
                  placeholder="Additional thoughts..."
                  className="form-textarea"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="brand-logo" style={{ color: "white", padding: "2px 6px" }}>🌸</span>
            <h1 className="brand-name">Lumi</h1>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic", marginTop: "4px" }}>
            Organize your day, one task at a time.
          </p>
        </div>

        <nav className="nav-section">
          <span className="nav-label">Overview</span>
          <button
            className={`nav-item ${currentView === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentView("dashboard")}
          >
            <IconDashboard />
            <span>Dashboard</span>
          </button>

          <span className="nav-label">Views</span>
          <button
            className={`nav-item ${currentView === "list" ? "active" : ""}`}
            onClick={() => setCurrentView("list")}
          >
            <IconList />
            <span>Task List</span>
          </button>
          <button
            className={`nav-item ${currentView === "kanban" ? "active" : ""}`}
            onClick={() => setCurrentView("kanban")}
          >
            <IconKanban />
            <span>Kanban Board</span>
          </button>
          <button
            className={`nav-item ${currentView === "calendar" ? "active" : ""}`}
            onClick={() => setCurrentView("calendar")}
          >
            <IconCalendar />
            <span>Calendar View</span>
          </button>
          <button
            className={`nav-item ${currentView === "archived" ? "active" : ""}`}
            onClick={() => setCurrentView("archived")}
          >
            <IconArchive />
            <span>Archive</span>
          </button>

          <span className="nav-label">Custom Categories</span>
          <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {customCategories.map((cat) => (
              <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", group: "true" }}>
                <button
                  onClick={() => { setFilterCategory(cat); setCurrentView("list"); }}
                  style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                >
                  <span className="category-badge-dot" style={{ backgroundColor: cat === "Work" ? "var(--primary)" : cat === "Study" ? "var(--info)" : "var(--text-muted)" }}></span>
                  {cat}
                </button>
                {!DEFAULT_CATEGORIES.includes(cat) && (
                  <button onClick={() => handleDeleteCategory(cat)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "10px" }}>✕</button>
                )}
              </div>
            ))}
            <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
              <input
                type="text"
                placeholder="New Category..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                style={{ flex: 1, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--text-primary)", padding: "4px 8px", fontSize: "11px" }}
              />
              <button type="submit" style={{ background: "var(--primary)", border: "none", color: "white", width: "22px", height: "22px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+</button>
            </form>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div>Lumi v2.2</div>
          <div>Organize your day, one task at a time.</div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <div className="search-container">
            <span className="search-icon-inside"><IconSearch /></span>
            <input
              type="text"
              placeholder="Search tasks, descriptions, or tags..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <div className="date-indicator">
              📅 Today: {formatDateStr(today)}
            </div>
            <button className="quick-add-btn" onClick={() => openModal()}>
              <IconPlus /> Add Task
            </button>
          </div>
        </header>

        {/* Loading overlay */}
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Syncing database...</span>
          </div>
        ) : (
          <>
            {/* View content selector */}
            {currentView === "dashboard" && (
              <div>
                <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", color: "var(--text-primary)" }}>Dashboard</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>A calm overview of your tasks and milestones.</p>
                
                {/* Stats Cards */}
                <div className="dashboard-grid">
                  <div className="stat-card total">
                    <div className="stat-header">
                      <span>TOTAL TASKS</span>
                      <span className="stat-icon">📋</span>
                    </div>
                    <div className="stat-value">{dashboardStats.total}</div>
                    <div className="stat-meta">Active list tasks</div>
                  </div>

                  <div className="stat-card completed">
                    <div className="stat-header">
                      <span>COMPLETED</span>
                      <span className="stat-icon">🌸</span>
                    </div>
                    <div className="stat-value">{dashboardStats.completed}</div>
                    <div className="stat-meta">Completed and checked</div>
                  </div>

                  <div className="stat-card pending">
                    <div className="stat-header">
                      <span>PENDING</span>
                      <span className="stat-icon">⏳</span>
                    </div>
                    <div className="stat-value">{dashboardStats.pending}</div>
                    <div className="stat-meta">In progress or to do</div>
                  </div>

                  <div className="stat-card overdue">
                    <div className="stat-header">
                      <span>OVERDUE</span>
                      <span className="stat-icon">🚨</span>
                    </div>
                    <div className="stat-value" style={{ color: dashboardStats.overdue > 0 ? "var(--danger)" : "inherit" }}>
                      {dashboardStats.overdue}
                    </div>
                    <div className="stat-meta">Passed due date</div>
                  </div>

                  <div className="stat-card today">
                    <div className="stat-header">
                      <span>DUE TODAY</span>
                      <span className="stat-icon">🎯</span>
                    </div>
                    <div className="stat-value">{dashboardStats.todayCount}</div>
                    <div className="stat-meta">Today's target tasks</div>
                  </div>
                </div>

                {/* Progress Card */}
                <div style={{ backgroundColor: "var(--bg-secondary)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", marginBottom: "32px", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontWeight: "700" }}>
                    <span>Target Progress Indicators</span>
                    <span style={{ color: "var(--primary)" }}>{dashboardStats.completionRate}% Completed</span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${dashboardStats.completionRate}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Quick Add and Upcoming section */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="form-row-2">
                  <div style={{ backgroundColor: "var(--bg-secondary)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>⚡ Quick Add Task</h3>
                    <input
                      type="text"
                      className="taskInput"
                      placeholder="Add a simple task and press Enter..."
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleQuickAdd(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                      Quick Add creates a task with due date of Today in Category "Personal".
                    </div>
                  </div>

                  <div style={{ backgroundColor: "var(--bg-secondary)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px" }}>🚨 Notifications & Reminders</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {tasks.filter(t => !t.archived && isOverdue(t.date, t.status)).slice(0, 3).map(t => (
                        <div key={t._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "rgba(252, 165, 165, 0.08)", borderRadius: "8px", borderLeft: "4px solid var(--danger)" }}>
                          <span style={{ fontSize: "16px" }}>⚠️</span>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "13px" }}>{t.text}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Overdue date: {t.date}</div>
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => !t.archived && isDueToday(t.date) && !t.completed).slice(0, 3).map(t => (
                        <div key={t._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "rgba(147, 197, 253, 0.08)", borderRadius: "8px", borderLeft: "4px solid var(--info)" }}>
                          <span style={{ fontSize: "16px" }}>🎯</span>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "13px" }}>{t.text}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Due today at {t.dueTime || "any time"}</div>
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => !t.archived && !t.completed && (isOverdue(t.date, t.status) || isDueToday(t.date))).length === 0 && (
                        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>All tasks caught up for now. Enjoy the peace! 🌿</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* List, Calendar, Kanban, or Archive view */}
            {currentView !== "dashboard" && (
              <div>
                {/* Control Toolbar */}
                <div className="toolbar">
                  <div className="filter-group">
                    <select
                      className="select-control"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {customCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <select
                      className="select-control"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="All">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>

                    <select
                      className="select-control"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <select
                      className="select-control"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="dueDate">Sort by Due Date</option>
                      <option value="priority">Sort by Priority</option>
                      <option value="status">Sort by Status</option>
                    </select>
                  </div>

                  <div className="view-selector">
                    <button
                      className={`view-btn ${currentView === "list" ? "active" : ""}`}
                      onClick={() => setCurrentView("list")}
                    >
                      List
                    </button>
                    <button
                      className={`view-btn ${currentView === "kanban" ? "active" : ""}`}
                      onClick={() => setCurrentView("kanban")}
                    >
                      Kanban
                    </button>
                    <button
                      className={`view-btn ${currentView === "calendar" ? "active" : ""}`}
                      onClick={() => setCurrentView("calendar")}
                    >
                      Calendar
                    </button>
                  </div>
                </div>

                {/* List View Container */}
                {currentView === "list" && (
                  <div className="list-view-container">
                    {filteredTasks.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🌸</div>
                        <h4 className="empty-state-title">No tasks found</h4>
                        <p className="empty-state-desc">Relax, enjoy the moment, or add a target task</p>
                      </div>
                    ) : (
                      filteredTasks.map(renderTaskCard)
                    )}
                  </div>
                )}

                {/* Kanban View Board */}
                {currentView === "kanban" && (
                  <div className="kanban-board">
                    {/* To Do Column */}
                    <div
                      className="kanban-column"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "To Do")}
                    >
                      <div className="kanban-column-header">
                        <h4 className="kanban-column-title">
                          <span className="category-badge-dot" style={{ backgroundColor: "var(--danger)" }}></span> To Do
                        </h4>
                        <span className="kanban-count-badge">
                          {filteredTasks.filter(t => t.status === "To Do" || (!t.status && !t.completed)).length}
                        </span>
                      </div>
                      <div className="kanban-list">
                        {filteredTasks
                          .filter(t => t.status === "To Do" || (!t.status && !t.completed))
                          .map(renderTaskCard)}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div
                      className="kanban-column"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "In Progress")}
                    >
                      <div className="kanban-column-header">
                        <h4 className="kanban-column-title">
                          <span className="category-badge-dot" style={{ backgroundColor: "var(--primary)" }}></span> In Progress
                        </h4>
                        <span className="kanban-count-badge">
                          {filteredTasks.filter(t => t.status === "In Progress").length}
                        </span>
                      </div>
                      <div className="kanban-list">
                        {filteredTasks
                          .filter(t => t.status === "In Progress")
                          .map(renderTaskCard)}
                      </div>
                    </div>

                    {/* Completed Column */}
                    <div
                      className="kanban-column"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "Completed")}
                    >
                      <div className="kanban-column-header">
                        <h4 className="kanban-column-title">
                          <span className="category-badge-dot" style={{ backgroundColor: "var(--success)" }}></span> Completed
                        </h4>
                        <span className="kanban-count-badge">
                          {filteredTasks.filter(t => t.status === "Completed" || t.completed).length}
                        </span>
                      </div>
                      <div className="kanban-list">
                        {filteredTasks
                          .filter(t => t.status === "Completed" || t.completed)
                          .map(renderTaskCard)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Calendar View Container */}
                {currentView === "calendar" && (
                  <div className="calendar-view-container">
                    <div className="calendar-header">
                      <h3 className="calendar-month-title">{monthLabel}</h3>
                      <div className="calendar-arrows">
                        <button className="calendar-nav-btn" onClick={handlePrevMonth}>‹</button>
                        <button className="calendar-nav-btn" onClick={handleNextMonth}>›</button>
                      </div>
                    </div>

                    <div className="calendar-grid-header">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>

                    <div className="calendar-grid-body">
                      {calendarDays.map((cell, idx) => {
                        if (cell.blank) {
                          return <div key={`blank-${idx}`} className="calendar-day-cell blank"></div>;
                        }

                        return (
                          <div
                            key={cell.dateStr}
                            className={`calendar-day-cell ${cell.isToday ? "today-cell" : ""} ${cell.isActive ? "active" : ""}`}
                            onClick={() => {
                              setSelectedCalendarDate(new Date(cell.dateStr));
                              setFilterCategory("All");
                              setFilterPriority("All");
                              setFilterStatus("All");
                              setCurrentView("list");
                            }}
                          >
                            <span className="calendar-day-number">{cell.day}</span>
                            <div className="calendar-day-dots">
                              {cell.tasks.slice(0, 3).map(task => (
                                <span
                                  key={task._id}
                                  className={`calendar-dot priority-${task.priority || "Medium"}`}
                                  title={task.text}
                                ></span>
                              ))}
                              {cell.tasks.length > 3 && (
                                <span style={{ fontSize: "9px", fontWeight: "bold" }}>+{cell.tasks.length - 3}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Archived View */}
                {currentView === "archived" && (
                  <div className="list-view-container">
                    <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px" }}>Archived Completed Tasks</h2>
                    {filteredTasks.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h4 className="empty-state-title">No archived tasks</h4>
                        <p className="empty-state-desc">Completed tasks can be archived from the task card menu</p>
                      </div>
                    ) : (
                      filteredTasks.map(renderTaskCard)
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
