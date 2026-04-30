const BASE_URL = "https://task-manager-pr67.onrender.com";

function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#333";
  toast.style.color = "white";
  toast.style.padding = "10px";
  toast.style.borderRadius = "8px";

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
}

async function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, password })
  });

  showToast("Signup successful!");
  window.location.href = "index.html";
}

async function addTask() {
  const title = document.getElementById("taskInput").value;
  const dueDate = document.getElementById("dueDate").value;
  const token = localStorage.getItem("token");

  await fetch(`${BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, dueDate })
  });

  showToast("Task added!");
  loadTasks();
}

async function toggleComplete(id, current) {
  const token = localStorage.getItem("token");

  await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ completed: !current })
  });

  showToast("Updated!");
  loadTasks();
}

async function editTask(id, oldTitle) {
  const newTitle = prompt("Edit task:", oldTitle);
  if (!newTitle) return;

  const token = localStorage.getItem("token");

  await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title: newTitle })
  });

  showToast("Task edited!");
  loadTasks();
}

async function deleteTask(id) {
  const token = localStorage.getItem("token");

  await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  showToast("Deleted!");
  loadTasks();
}

async function loadTasks() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/api/tasks`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const tasks = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  document.getElementById("stats").innerHTML = `
    <p>Total: ${tasks.length}</p>
    <p>Completed: ${tasks.filter(t => t.completed).length}</p>
    <p>Pending: ${tasks.filter(t => !t.completed).length}</p>
  `;

  tasks.forEach(task => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.title;

    const status = document.createElement("small");

    if (task.completed) {
      status.textContent = "DONE";
      status.style.color = "green";
    } else if (task.dueDate && new Date(task.dueDate) < new Date()) {
      status.textContent = "OVERDUE";
      status.style.color = "red";
    } else {
      status.textContent = "PENDING";
      status.style.color = "orange";
    }

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.onclick = () => toggleComplete(task._id, task.completed);

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => editTask(task._id, task.title);

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => deleteTask(task._id);

    li.appendChild(span);
    li.appendChild(status);
    li.appendChild(completeBtn);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    list.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

window.onload = loadTasks;
