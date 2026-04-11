import React from "react";

function Semester({ data, onChange, onDelete }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="semester">
      <input
        type="number"
        placeholder="SGPA"
        className="input"
        value={data.sgpa}
        onChange={(e) => handleChange("sgpa", e.target.value)}
      />

      <input
        type="number"
        placeholder="Credits"
        className="input"
        value={data.credit}
        onChange={(e) => handleChange("credit", e.target.value)}
      />

      <button className="btn btn-danger" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

export default Semester;