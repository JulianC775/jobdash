import JobCard from "./JobCard";

const STATUS_FILTERS = ["all", "saved", "applied", "interviewing", "offer", "rejected"];

export default function BookmarkList({ bookmarks, onRemove, onStatusChange, filter, onFilterChange }) {
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
