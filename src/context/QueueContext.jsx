import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getQueue, getQueueInRange } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { translate } from "../i18n";

const QueueContext = createContext(null);

/** The moderation queue shown on the map, for the period picked in the side panel. */
export function QueueProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [range, setRange] = useState({ key: "all", start: null, end: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const request = range.start ? getQueueInRange(range.start, range.end) : getQueue();
    request
      .then((data) => !cancelled && setIncidents(data))
      .catch((e) => !cancelled && setError(errorMessage(e, translate("errors.queue"))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range, version]);

  const selectRange = useCallback((key, start, end) => {
    setRange({ key, start: start?.startOf("day") ?? null, end: end?.endOf("day") ?? null });
  }, []);

  /** Applies a moderator's decision locally, so the list updates without a reload. */
  const remove = useCallback((id) => setIncidents((list) => list.filter((i) => i.id !== id)), []);
  const replace = useCallback((updated) => setIncidents((list) => list.map((i) => (i.id === updated.id ? updated : i))), []);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ incidents, range, loading, error, selectRange, remove, replace, reload }),
    [incidents, range, loading, error, selectRange, remove, replace, reload],
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueue must be used inside <QueueProvider>");
  return context;
}
