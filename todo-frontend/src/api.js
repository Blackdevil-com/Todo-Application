const BASE = "https://todo-backend-hu8g.onrender.com/api/todos";

export const getTodos = () => fetch(BASE).then(r => r.json());

export const pingBackend = () =>
  fetch(BASE, { method: "GET" }).catch(() => {});

export const addTodo = (title) =>
  fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, done: false }),
  }).then(r => r.json());

export const deleteTodo = (id) =>
  fetch(`${BASE}/${id}`, { method: "DELETE" });

export const toggleTodo = (id, todo) =>
  fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...todo, done: !todo.done }),
  }).then(r => r.json());

export const updateTodoTitle = (id, todo, newTitle) =>
  fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...todo, title: newTitle }),
  }).then(r => r.json());

export const clearCompleted = async (todos) => {
  const completed = todos.filter(t => t.done);
  await Promise.all(completed.map(t => deleteTodo(t.id)));
};