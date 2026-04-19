export default function Stats({ tasks }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let overdue = 0;
  let soon = 0;

  tasks.forEach((t) => {
    if (!t.deadline || t.status === "done") return;

    const d = new Date(t.deadline);
    const diff = Math.floor((d - now) / (1000 * 3600 * 24));

    if (diff < 0) overdue++;
    else if (diff <= 3) soon++;
  });
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="stats-row">
  <div className="stat-card stat-total">
    <div className="stat-num">{tasks.length}</div>
    <div className="stat-label">Total</div>
  </div>

  <div className="stat-card stat-overdue">
    <div className="stat-num">{overdue}</div>
    <div className="stat-label">Overdue</div>
  </div>

  <div className="stat-card stat-due">
    <div className="stat-num">{soon}</div>
    <div className="stat-label">Due Soon</div>
  </div>

  <div className="stat-card stat-done">
    <div className="stat-num">{done}</div>
    <div className="stat-label">Done</div>
  </div>
</div>
  );
}