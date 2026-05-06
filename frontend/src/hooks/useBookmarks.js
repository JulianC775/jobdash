import { useState, useEffect, useCallback } from "react";
import { getBookmarks, addBookmark, deleteBookmark, updateStatus, updateNotes } from "../api/jobs";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const refresh = useCallback(async () => {
    try {
      const data = await getBookmarks();
      setBookmarks(data.bookmarks);
      setBookmarkedIds(new Set(data.bookmarks.map((b) => b.job_id)));
    } catch {
      // backend not yet reachable; leave existing state intact
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (job) => {
    await addBookmark(job);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await deleteBookmark(id);
    await refresh();
  }, [refresh]);

  const setStatus = useCallback(async (id, status) => {
    await updateStatus(id, status);
    await refresh();
  }, [refresh]);

  const setNotes = useCallback(async (id, notes) => {
    await updateNotes(id, notes);
    await refresh();
  }, [refresh]);

  return { bookmarks, bookmarkedIds, save, remove, setStatus, setNotes };
}
