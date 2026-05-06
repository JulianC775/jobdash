import { useState } from "react";
import FilterBar from "./components/FilterBar";
import JobCard from "./components/JobCard";
import BookmarkList from "./components/BookmarkList";
import { searchJobs } from "./api/jobs";
import { useBookmarks } from "./hooks/useBookmarks";
import "./App.css";

const TABS = ["search", "saved"];
const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "salary_desc", label: "Salary: High → Low" },
  { value: "salary_asc", label: "Salary: Low → High" },
];

function sortJobs(jobs, sort) {
  if (sort === "relevance") return jobs;
  return [...jobs].sort((a, b) => {
    const av = a.salary_max ?? a.salary_min ?? -1;
    const bv = b.salary_max ?? b.salary_min ?? -1;
    return sort === "salary_desc" ? bv - av : av - bv;
  });
}

export default function App() {
  const [tab, setTab] = useState("search");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentFilters, setCurrentFilters] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState("relevance");

  const { bookmarks, bookmarkedIds, save, remove, setStatus, setNotes } = useBookmarks();

  const bookmarkMap = Object.fromEntries(bookmarks.map((b) => [b.job_id, b]));

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    setCurrentPage(1);
    try {
      const data = await searchJobs({ ...filters, page: 1 });
      setResults(data.jobs);
      setSearched(true);
      setHasMore(data.jobs.length >= PAGE_SIZE);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!currentFilters || loadingMore) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await searchJobs({ ...currentFilters, page: nextPage });
      setResults((prev) => [...prev, ...data.jobs]);
      setCurrentPage(nextPage);
      setHasMore(data.jobs.length >= PAGE_SIZE);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
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
            {searched && results.length > 0 && (
              <div className="results-bar">
                <p className="result-count">{results.length} job{results.length !== 1 ? "s" : ""} found</p>
                <select
                  className="sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="job-grid">
              {sortJobs(results, sort).map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  isBookmarked={bookmarkedIds.has(job.job_id)}
                  bookmarkEntry={bookmarkMap[job.job_id]}
                  onBookmark={save}
                  onRemove={remove}
                  onStatusChange={setStatus}
                  onNotesChange={setNotes}
                />
              ))}
            </div>
            {hasMore && (
              <div className="load-more-wrap">
                <button
                  className="btn btn--outline btn--load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "saved" && (
          <BookmarkList
            bookmarks={bookmarks}
            onRemove={remove}
            onStatusChange={setStatus}
            onNotesChange={setNotes}
            filter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        )}
      </main>
    </div>
  );
}
