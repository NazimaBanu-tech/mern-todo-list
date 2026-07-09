const LOCAL_STORAGE_KEY = "priorityflow_tasks";

// Helper to get tasks from localStorage
const getLocalTasks = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save tasks to localStorage
const saveLocalTasks = (tasks) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

export const getTasks = async () => {
  // Simulate network latency for authentic feel
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getLocalTasks();
};

export const createTask = async (taskData) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const tasks = getLocalTasks();
  const newTask = {
    ...taskData,
    _id: crypto.randomUUID(),
    completed: taskData.completed || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveLocalTasks(tasks);
  return newTask;
};

export const updateTask = async (id, taskData) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const tasks = getLocalTasks();
  const index = tasks.findIndex((t) => t._id === id);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    saveLocalTasks(tasks);
    return tasks[index];
  }
  throw new Error("Task not found");
};

export const deleteTask = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const tasks = getLocalTasks();
  const filtered = tasks.filter((t) => t._id !== id);
  saveLocalTasks(filtered);
  return { message: "Task deleted" };
};
