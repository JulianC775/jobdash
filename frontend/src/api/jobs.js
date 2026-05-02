const BASE = "/api";

export async function searchJobs(filters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.location) params.set("location", filters.location);
  if (filters.remote) params.set("remote", "true");
  if (filters.employmentType) params.set("employment_type", filters.employmentType);
  if (filters.salaryMin) params.set("salary_min", filters.salaryMin);
  if (filters.page) params.set("page", filters.page);

  const res = await fetch(`${BASE}/jobs/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Search failed (${res.status})`);
  }
  return res.json();
}

export async function getBookmarks(status) {
  const params = status ? `?status=${status}` : "";
  const res = await fetch(`${BASE}/bookmarks${params}`);
  if (!res.ok) throw new Error("Failed to load bookmarks");
  return res.json();
}

export async function addBookmark(job) {
  const res = await fetch(`${BASE}/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save job");
  }
  return res.json();
}

export async function deleteBookmark(id) {
  const res = await fetch(`${BASE}/bookmarks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove bookmark");
  return res.json();
}

export async function updateStatus(id, status) {
  const res = await fetch(`${BASE}/bookmarks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}
