/* =========================================================================
   SHEROES – Persistenza storico allenamenti (localStorage)
   ========================================================================= */

const SHEROES_STORAGE_KEY = "sheroes_workout_history_v1";

const Storage = {
  getAll() {
    try {
      const raw = localStorage.getItem(SHEROES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Errore lettura storico:", e);
      return [];
    }
  },

  saveSession(session) {
    const all = Storage.getAll();
    all.push(session);
    try {
      localStorage.setItem(SHEROES_STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      console.error("Errore salvataggio storico:", e);
      return false;
    }
  },

  deleteSession(id) {
    const all = Storage.getAll().filter((s) => s.id !== id);
    localStorage.setItem(SHEROES_STORAGE_KEY, JSON.stringify(all));
  },

  clearAll() {
    localStorage.removeItem(SHEROES_STORAGE_KEY);
  },

  // Aggregate stats
  getStats() {
    const all = Storage.getAll();
    const totalSessions = all.length;
    const totalMinutes = Math.round(all.reduce((sum, s) => sum + (s.durationSec || 0), 0) / 60);

    // sessions in last 7 days
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const lastWeek = all.filter((s) => now - s.timestamp <= weekMs).length;

    // current streak (consecutive days with at least 1 session, up to today)
    const daysWithSession = new Set(
      all.map((s) => new Date(s.timestamp).toISOString().slice(0, 10))
    );
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (daysWithSession.has(key)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return { totalSessions, totalMinutes, lastWeek, streak };
  }
};
