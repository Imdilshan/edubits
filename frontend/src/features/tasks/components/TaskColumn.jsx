import TaskCard from "./TaskCard";

export default function TaskColumn({
  title,
  status,
  tasks,
  updateTask,
  deleteTask,
  onEdit,
}) {
  const filteredTasks = tasks.filter((t) => t.status === status);

  return (
    <div className="column">
      <div className="col-header">
        <div className="col-title">
          <span
            className={`col-dot ${
              status === "todo"
                ? "dot-todo"
                : status === "in-progress"
                ? "dot-progress"
                : "dot-done"
            }`}
          ></span>

          {title}
          <span className="col-count">{filteredTasks.length}</span>
        </div>
      </div>

      <div className="col-body">
        {filteredTasks.length === 0 ? (
          <div className="col-empty">
            <p>No tasks here</p>
            <small>Add something to get started</small>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}