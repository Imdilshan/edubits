export default function Filters() {
  return (
    <div className="filters">
      <input
        type="text"
        className="filter-input"
        placeholder="Search tasks..."
      />

      <select className="filter-select">
        <option>All Types</option>
        <option value="assignment">Assignment</option>
        <option value="project">Project</option>
      </select>

      <select className="filter-select">
        <option>All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}