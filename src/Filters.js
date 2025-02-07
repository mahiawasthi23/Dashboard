import React from "react";

export function Filters({
  selectedAge,
  setSelectedAge,
  selectedGender,
  setSelectedGender,
  dateRange,
  setDateRange,
  handleDateChange,
  setApplyFilters,
}) {
  return (
    <div>
      <h3>Filters</h3>
      <label>
        Age:
        <select value={selectedAge} onChange={(e) => setSelectedAge(e.target.value)}>
          <option>15-25</option>
          <option>&gt;25</option>
        </select>
      </label>
      <label>
        Gender:
        <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
          <option>Male</option>
          <option>Female</option>
        </select>
      </label>
      <label>
        Date Range:
        <input
          type="date"
          name="start"
          value={dateRange.start ? dateRange.start.split("/").reverse().join("-") : ""}
          onChange={handleDateChange}
        />
        <input
          type="date"
          name="end"
          value={dateRange.end ? dateRange.end.split("/").reverse().join("-") : ""}
          onChange={handleDateChange}
        />
      </label>
      <button onClick={() => setApplyFilters(true)}>Apply Filters</button>
    </div>
  );
}
