import { useEffect, useState, useCallback, useRef } from "react";
import {
  getTodos,
  addTodo,
  deleteTodo,
  toggleTodo,
  updateTodoTitle,
  clearCompleted,
} from "./api";
import MouseSmoke from "./MouseSmoke";
import "./App.css";



// ── TodoItem Component ──────────────────────────────────
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(todo.title);
  const editRef = useRef(null);

  // Auto-grow the edit textarea
  const growEditArea = () => {
    const el = editRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    if (editing) {
      growEditArea();
      editRef.current?.focus();
      // place cursor at end
      const len = editRef.current?.value.length ?? 0;
      editRef.current?.setSelectionRange(len, len);
    }
  }, [editing]);

  const commitEdit = () => {
    if (editVal.trim() && editVal.trim() !== todo.title) {
      onEdit(todo.id, todo, editVal.trim());
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    // Shift+Enter = newline inside textarea; plain Enter = commit
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { setEditVal(todo.title); setEditing(false); }
  };

  return (
    <div className={`todo-item${todo.done ? " done" : ""}`}>
      {/* Checkbox */}
      <button
        className={`checkbox${todo.done ? " checked" : ""}`}
        onClick={() => onToggle(todo.id, todo)}
        aria-label={todo.done ? "Mark as active" : "Mark as done"}
      />

      {/* Text / Edit */}
      <div className="todo-text-wrap">
        {editing ? (
          <textarea
            ref={editRef}
            className="todo-edit-input"
            rows={1}
            value={editVal}
            onChange={e => { setEditVal(e.target.value); growEditArea(); }}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            className="todo-text"
            onDoubleClick={() => !todo.done && setEditing(true)}
            title={todo.done ? "" : "Double-click to edit"}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="item-actions">
        {!todo.done && (
          <button
            className="icon-btn edit"
            onClick={() => setEditing(true)}
            aria-label="Edit task"
            title="Edit"
          >
            ✎
          </button>
        )}
        <button
          className="icon-btn delete"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ── App Component ───────────────────────────────────────
export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const inputRef = useRef(null);

  // ── Fetch on mount with retry for Render cold start ──
  useEffect(() => {
    let attempts = 0;
    const MAX = 5;
    const DELAY = 10000; // 10 seconds between retries

    const tryFetch = () => {
      attempts++;
      getTodos()
        .then(data => {
          setTodos(data);
          setLoading(false);
          setRetrying(false);
          setError(null);
        })
        .catch(() => {
          if (attempts < MAX) {
            setRetrying(true);
            setError(`Backend is waking up… (attempt ${attempts}/${MAX})`);
            setTimeout(tryFetch, DELAY);
          } else {
            setRetrying(false);
            setError("Could not connect to backend. Please refresh the page.");
            setLoading(false);
          }
        });
    };

    tryFetch();
  }, []);

  // ── Add ──
  const handleAdd = useCallback(async () => {
    const title = input.trim();
    if (!title) return;
    setInput("");
    // Collapse the textarea back to one line immediately
    if (inputRef.current) {
      inputRef.current.style.height = "";
    }
    try {
      const newTodo = await addTodo(title);
      setTodos(prev => [...prev, newTodo]);
    } catch {
      setError("Failed to add task.");
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  // ── Toggle ──
  const handleToggle = useCallback(async (id, todo) => {
    try {
      const updated = await toggleTodo(id, todo);
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      setError("Failed to update task.");
    }
  }, []);

  // ── Delete ──
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      setError("Failed to delete task.");
    }
  }, []);

  // ── Edit ──
  const handleEdit = useCallback(async (id, todo, newTitle) => {
    try {
      const updated = await updateTodoTitle(id, todo, newTitle);
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      setError("Failed to update task.");
    }
  }, []);

  // ── Clear Completed ──
  const handleClearCompleted = async () => {
    try {
      await clearCompleted(todos);
      setTodos(prev => prev.filter(t => !t.done));
    } catch {
      setError("Failed to clear tasks.");
    }
  };

  // ── Derived ──
  const active = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const filtered =
    filter === "active" ? active :
    filter === "done" ? done :
    todos;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  return (
    <div className="app">
      {/* Neon smoke mouse effect — rendered over everything */}
      <MouseSmoke />
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span className="dot" />
          <span>Today</span>
          <span className="sep">/</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        {/* Header */}
        <div className="header">
          <div className="header-title">
            <h1>Today, <em>focused.</em></h1>
            <p className="header-subtitle">{today}</p>
          </div>
          <div className="stats-badge">
            <span className="stat-number">{done.length}/{todos.length}</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-bar">
            <div className="loading-bar-inner" />
          </div>
        )}

        {/* Error / Retrying toast */}
        {error && (
          <div className="error-toast" role="alert">
            <span>{retrying ? "⏳" : "⚠"}</span>
            <span>{error}</span>
            {!retrying && (
              <button
                style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                onClick={() => setError(null)}
              >✕</button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="input-row">
          <textarea
            ref={inputRef}
            id="todo-input"
            className="todo-input"
            rows={1}
            placeholder="What needs to get done?"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // auto-grow while typing
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={e => {
              // Shift+Enter = newline; plain Enter = submit
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
            }}
            disabled={loading}
            autoComplete="off"
            style={{ resize: "none", overflow: "hidden" }}
          />
          <button
            id="add-btn"
            className="add-btn"
            onClick={handleAdd}
            disabled={loading || !input.trim()}
          >
            <span className="plus-icon">+</span>
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="filter-tabs">
            {["all", "active", "done"].map(f => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`filter-tab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <span className="tasks-left">
            <strong>{active.length}</strong> task{active.length !== 1 ? "s" : ""} left
          </span>
        </div>

        {/* List */}
        <div className="todo-list-wrapper">
          <div className="todo-list">
            {!loading && filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {filter === "done" ? "🎉" : filter === "active" ? "✨" : "📝"}
                </div>
                <p className="empty-title">
                  {filter === "done"
                    ? "Nothing completed yet"
                    : filter === "active"
                    ? "All caught up!"
                    : "No tasks yet"}
                </p>
                <p className="empty-sub">
                  {filter === "all" ? "Add something above to get started" : ""}
                </p>
              </div>
            ) : (
              filtered.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <span className="footer-left">
            {todos.length} task{todos.length !== 1 ? "s" : ""} total
          </span>
          <button
            className="clear-btn"
            onClick={handleClearCompleted}
            disabled={done.length === 0}
          >
            Clear Completed
          </button>
        </div>

      </div>
    </div>
  );
}