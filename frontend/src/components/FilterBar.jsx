import { useState } from "react";

const EMPLOYMENT_TYPES = [
  { value: "", label: "Any type" },
  { value: "FULLTIME", label: "Full-time" },
  { value: "PARTTIME", label: "Part-time" },
  { value: "CONTRACTOR", label: "Contract" },
  { value: "INTERN", label: "Internship" },
];

export default function FilterBar({ onSearch, loading }) {
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    remote: false,
    employmentType: "",
    salaryMin: "",
  });

  const set = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filters.query.trim()) return;
    onSearch({ ...filters, page: 1 });
  };

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <input
        className="filter-input filter-input--query"
        type="text"
        placeholder="Job title, keywords…"
        value={filters.query}
        onChange={set("query")}
        required
      />
      <input
        className="filter-input"
        type="text"
        placeholder="Location"
        value={filters.location}
        onChange={set("location")}
      />
      <select className="filter-select" value={filters.employmentType} onChange={set("employmentType")}>
        {EMPLOYMENT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      <input
        className="filter-input filter-input--salary"
        type="number"
        placeholder="Min salary"
        value={filters.salaryMin}
        onChange={set("salaryMin")}
        min="0"
      />
      <label className="filter-checkbox">
        <input type="checkbox" checked={filters.remote} onChange={set("remote")} />
        Remote only
      </label>
      <button className="btn btn--primary" type="submit" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
