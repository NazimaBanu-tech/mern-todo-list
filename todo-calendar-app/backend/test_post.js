const payload = {
  text: "My test task title",
  date: "2026-07-08",
  completed: false,
  description: "Description text",
  category: "Personal",
  priority: "Medium",
  dueTime: "12:00",
  status: "To Do",
  tags: ["study", "math"],
  notes: "Notes content"
};

try {
  console.log("Sending POST to http://localhost:5000/api/tasks...");
  const response = await fetch("http://localhost:5000/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  console.log("Status:", response.status);
  console.log("SUCCESS! Response:", data);
} catch (err) {
  console.error("FAILED! Error:", err.message);
}
