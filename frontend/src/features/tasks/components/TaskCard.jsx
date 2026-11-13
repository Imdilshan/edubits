import "./TaskComponents.css";

export default function TaskCard({ task, onUpdate, onDelete, onEdit }) {

  const advance = (e) => {
    e.stopPropagation();
    const next = { todo: "in-progress", "in-progress": "done" };
    if (next[task.status]) {
      onUpdate(task._id, { status: next[task.status] });
    }
  };

  const undo = (e) => {
    e.stopPropagation();
    onUpdate(task._id, { status: "in-progress" });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const isDone = task.status === "done";

  return (
    <div className={`task-card ${task.priority}${isDone ? " task-done" : ""}`}>
      <div className="task-content" onClick={handleEdit}>
        <div className={`task-card-title${isDone ? " task-title-done" : ""}`}>
          {task.title}
        </div>

         <div className="task-meta">
          {task.subject && (
            <span className="task-subject">{task.subject}</span>
          )}
          {task.deadline && (
            <span className="task-deadline">
              {new Date(task.deadline).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>

      <div className="task-card-actions">

        {isDone ? (
          <>
            <button
              className="task-icon-btn undo"
              title="Move back to In Progress"
              onClick={undo}
            >↩</button>
            <button
              className="task-icon-btn delete"
              title="Delete task"
              onClick={handleDelete}
            >✕</button>
          </>
        ) : (
          <>
            <button
              className="task-icon-btn complete"
              title={task.status === "todo" ? "Start task" : "Mark as done"}
              onClick={advance}
            >✔</button>
            <button
              className="task-icon-btn delete"
              title="Delete task"
              onClick={handleDelete}
            >✕</button>
          </>
        )}
      </div>

    </div>
  );
}
