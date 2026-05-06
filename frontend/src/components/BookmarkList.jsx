import JobCard from "./JobCard";

const STATUS_FILTERS = ["all", "saved", "applied", "interviewing", "offer", "rejected"];

const CSV_FIELDS = ["title", "company", "location", "status", "employment_type", "apply_link", "saved_at", "notes"];

function toCSV(rows) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = CSV_FIELDS.join(",");
  const lines = rows.map((r) => CSV_FIELDS.map((f) => escape(r[f])).join(","));
  return [header, ...lines].join("\n");
}

function downloadCSV(rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "saved_jobs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookmarkList({ bookmarks, onRemove, onStatusChange, onNotesChange, filter, onFilterChange }) {
  const visible = filter === "all" ? bookmarks : bookmarks.filter((b) => b.status === filter);

  return (
    <section className="bookmark-list">
      <div className="bookmark-list__header">
        <h2>Saved Jobs ({bookmarks.length})</h2>
        <div className="status-tabs">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`status-tab ${filter === s ? "status-tab--active" : ""}`}
              onClick={() => onFilterChange(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {visible.length > 0 && (
          <button
            className="btn btn--outline btn--export"
            onClick={() => downloadCSV(visible)}
          >
            Export CSV
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">No jobs here yet.</p>
      ) : (
        <div className="job-grid">
          {visible.map((b) => (
            <JobCard
              key={b.id}
              job={b}
              isBookmarked
              bookmarkEntry={b}
              onRemove={onRemove}
              onStatusChange={onStatusChange}
              onNotesChange={onNotesChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
