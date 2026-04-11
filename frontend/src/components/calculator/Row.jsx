import React from "react";

function Row({ data, onChange, onDelete }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="row">
      <input
        type="text"
        placeholder="Subject Name"
        className="input subject-name"
        value={data.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />

      <input
        type="number"
        placeholder="Credit"
        className="input"
        value={data.credit}
        onChange={(e) => handleChange("credit", e.target.value)}
      />

      <select
        className="input"
        value={data.grade}
        onChange={(e) => handleChange("grade", e.target.value)}
      >
        <option value="">Grade</option>
        <option value="10">A+</option>
        <option value="9">A</option>
        <option value="8">B+</option>
        <option value="7">B</option>
        <option value="6">C+</option>
        <option value="5">C</option>
        <option value="4">D</option>
        <option value="0">E/F</option>
      </select>

      <button className="btn btn-danger" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

export default Row;