/* =========================================================================
   SHEROES – Pagina storico
   ========================================================================= */

(function () {
  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) +
      " · " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDuration(sec) {
    const m = Math.round(sec / 60);
    return m + " min";
  }

  function renderStats() {
    const s = Storage.getStats();
    document.getElementById("stat-total").textContent = s.totalSessions;
    document.getElementById("stat-minutes").textContent = s.totalMinutes;
    document.getElementById("stat-week").textContent = s.lastWeek;
    document.getElementById("stat-streak").textContent = s.streak;
  }

  function renderChart(sessions) {
    const wrap = document.getElementById("chart-wrap");
    const canvas = document.getElementById("history-chart");
    if (sessions.length === 0) {
      wrap.style.display = "none";
      return;
    }
    wrap.style.display = "block";

    const last = sessions.slice(-12);
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 600;
    const cssH = 140;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.height = cssH + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const values = last.map((s) => Math.round(s.durationSec / 60));
    const maxV = Math.max(...values, 1);
    const barGap = 10;
    const barW = (cssW - barGap * (last.length - 1)) / last.length;

    last.forEach((s, i) => {
      const v = values[i];
      const h = (v / maxV) * (cssH - 24);
      const x = i * (barW + barGap);
      const y = cssH - h - 18;

      ctx.fillStyle = s.dayKey === "day1" ? "#ff3d6e" : "#2de1c2";
      roundRect(ctx, x, y, barW, h, 5);
      ctx.fill();

      ctx.fillStyle = "#9a96a6";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(v + "'", x + barW / 2, y - 5 < 8 ? 10 : y - 5);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (h < 1) h = 1;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function renderList() {
    const all = Storage.getAll().sort((a, b) => b.timestamp - a.timestamp);
    const listArea = document.getElementById("list-area");
    listArea.innerHTML = "";

    if (all.length === 0) {
      listArea.innerHTML = `
        <div class="empty-state">
          <div class="em-icon">🗓️</div>
          <p>Non hai ancora salvato nessun allenamento.<br>Vai alla pagina Allenamento per iniziare la prima sessione!</p>
        </div>`;
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "session-list";

    all.forEach((s) => {
      const item = document.createElement("div");
      item.className = "session-item";
      item.innerHTML = `
        <div>
          <span class="day-pill">${s.dayLabel || s.dayKey}</span>
          <div class="date">${formatDate(s.timestamp)}</div>
          ${s.note ? `<div class="note">${escapeHtml(s.note)}</div>` : ""}
        </div>
        <div style="display:flex; align-items:center; gap:14px;">
          <div class="dur">${formatDuration(s.durationSec)}</div>
          <button class="del-btn" title="Elimina" data-id="${s.id}">✕</button>
        </div>
      `;
      wrap.appendChild(item);
    });

    listArea.appendChild(wrap);

    listArea.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        Storage.deleteSession(btn.dataset.id);
        refreshAll();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function refreshAll() {
    const all = Storage.getAll().sort((a, b) => a.timestamp - b.timestamp);
    renderStats();
    renderChart(all);
    renderList();
  }

  document.getElementById("btn-clear-all").addEventListener("click", () => {
    if (confirm("Cancellare tutto lo storico allenamenti? L'azione non è reversibile.")) {
      Storage.clearAll();
      refreshAll();
    }
  });

  refreshAll();
})();
