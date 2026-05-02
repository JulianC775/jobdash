import { useState } from "react";
import FilterBar from "./components/FilterBar";
import JobCard from "./components/JobCard";
import BookmarkList from "./components/BookmarkList";
import { searchJobs } from "./api/jobs";
import { useBookmarks } from "./hooks/useBookmarks";
import "./App.css";

const TABS = ["search", "saved"];

export default function App() {
  const [tab, setTab] = useState("search");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { bookmarks, bookmarkedIds, save, remove, setStatus } = useBookmarks();

  const bookmarkMap = Object.fromEntries(bookmarks.map((b) => [b.job_id, b]));

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchJobs(filters);
      setResults(data.jobs);
      setSearched(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">JobDash</h1>
        <nav className="app-nav">
          {TABS.map((t) => (
            <button
              key={t}
              className={`nav-tab ${tab === t ? "nav-tab--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "search" ? "Search" : `Saved (${bookmarks.length})`}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {tab === "search" && (
          <>
            <FilterBar onSearch={handleSearch} loading={loading} />
            {error && <p className="error-banner">{error}</p>}
            {searched && !loading && results.length === 0 && (
              <p className="empty-state">No results found. Try different keywords.</p>
            )}
            <div className="job-grid">
              {results.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  isBookmarked={bookmarkedIds.has(job.job_id)}
                  bookmarkEntry={bookmarkMap[job.job_id]}
                  onBookmark={save}
                  onRemove={remove}
                  onStatusChange={setStatus}
                />
              ))}
            </div>
          </>
        )}

        {tab === "saved" && (
          <BookmarkList
            bookmarks={bookmarks}
            onRemove={remove}
            onStatusChange={setStatus}
            filter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        )}
      </main>
    </div>
  );
}
