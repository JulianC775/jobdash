import { useState } from "react";

const STATUS_COLORS = {
  saved: "#6c757d",
  applied: "#0d6efd",
  interviewing: "#fd7e14",
  offer: "#198754",
  rejected: "#dc3545",
};

const DESC_LIMIT = 200;

function formatSalary(min, max, currency, period) {
  if (!min && !max) return null;
  const fmt = (n) => n ? `${currency || "$"}${Number(n).toLocaleString()}` : null;
  const range = [fmt(min), fmt(max)].filter(Boolean).join(" – ");
  return period ? `${range} / ${period.toLowerCase()}` : range;
}

function postedAgo(isoString) {
  if (!isoString) return null;
  const ms = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}

export default function JobCard({ job, isBookmarked, onBookmark, bookmarkEntry, onRemove, onStatusChange, onNotesChange }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period);
  const ago = postedAgo(job.posted_at);
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(bookmarkEntry?.notes ?? "");
  const [notesDirty, setNotesDirty] = useState(false);

  const desc = job.description || "";
  const needsExpand = desc.length > DESC_LIMIT;
  const displayDesc = expanded || !needsExpand ? desc : desc.slice(0, DESC_LIMIT) + "…";

  const handleNotesBlur = () => {
    if (notesDirty && onNotesChange) {
      onNotesChange(bookmarkEntry.id, localNotes);
      setNotesDirty(false);
    }
  };

  return (
    <div className="job-card">
      <div className="job-card__header">
        {job.employer_logo && (
          <img className="job-card__logo" src={job.employer_logo} alt={job.company} />
        )}
        <div className="job-card__title-block">
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">{job.company}</p>
        </div>
      </div>

      <div className="job-card__meta">
        {job.location && <span className="badge badge--location">📍 {job.location}</span>}
        {job.is_remote && <span className="badge badge--remote">Remote</span>}
        {job.employment_type && <span className="badge">{job.employment_type}</span>}
        {salary && <span className="badge badge--salary">💰 {salary}</span>}
        {ago && <span className="badge badge--ago">{ago}</span>}
      </div>

      {desc && (
        <div className="job-card__desc-wrap">
          <p className="job-card__desc">{displayDesc}</p>
          {needsExpand && (
            <button className="btn-link" onClick={() => setExpanded((x) => !x)}>
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      <div className="job-card__actions">
        {job.apply_link && (
          <a className="btn btn--primary" href={job.apply_link} target="_blank" rel="noreferrer">
            Apply
          </a>
        )}

        {isBookmarked ? (
          <button
            className="btn btn--danger"
            onClick={() => onRemove(bookmarkEntry.id)}
          >
            Remove
          </button>
        ) : (
          <button className="btn btn--outline" onClick={() => onBookmark(job)}>
            Save
          </button>
        )}

        {isBookmarked && bookmarkEntry && (
          <select
            className="status-select"
            value={bookmarkEntry.status}
            onChange={(e) => onStatusChange(bookmarkEntry.id, e.target.value)}
            style={{ borderColor: STATUS_COLORS[bookmarkEntry.status] }}
          >
            {Object.keys(STATUS_COLORS).map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )}
      </div>

      {isBookmarked && (
        <textarea
          className="job-card__notes"
          placeholder="Add notes… (saved automatically)"
          value={localNotes}
          onChange={(e) => { setLocalNotes(e.target.value); setNotesDirty(true); }}
          onBlur={handleNotesBlur}
          rows={3}
        />
      )}
    </div>
  );
}
