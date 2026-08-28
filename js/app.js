/* =========================================================================
   SHEROES – App (collegamento UI ↔ player ↔ figura 3D)
   ========================================================================= */

(function () {
  const screenSelect = document.getElementById("screen-select");
  const screenPlayer = document.getElementById("screen-player");
  const screenSummary = document.getElementById("screen-summary");

  const dayCards = document.querySelectorAll(".day-card");
  const btnStart = document.getElementById("btn-start");
  let selectedDay = null;

  dayCards.forEach((card) => {
    card.addEventListener("click", () => {
      dayCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedDay = card.dataset.day;
      btnStart.disabled = false;
    });
  });

  let figure = null;
  let player = null;
  let lastFinishSummary = null;

  function formatTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  function showScreen(name) {
    screenSelect.classList.toggle("hidden", name !== "select");
    screenPlayer.classList.toggle("active", name === "player");
    screenSummary.classList.toggle("active", name === "summary");
  }

  function render(p) {
    const step = p.currentStep;
    if (!step) return;
    const prog = p.progress;

    document.getElementById("progress-fill").style.width = (prog.current / prog.total) * 100 + "%";
    document.getElementById("step-count").textContent = `${prog.current} / ${prog.total}`;
    document.getElementById("step-block-label").textContent = step.isRest ? step.restLabel || "Recupero" : step.blockLabel;

    const exData = step.isRest ? null : EXERCISES[step.ex];
    const nameEl = document.getElementById("exercise-name");
    const sideTag = document.getElementById("side-tag");

    if (step.isRest) {
      nameEl.firstChild.textContent = "Recupero";
      sideTag.style.display = "none";
      if (figure) figure.setAnimation("rest");
    } else {
      nameEl.firstChild.textContent = exData.name;
      if (step.sideLabel) {
        sideTag.textContent = step.sideLabel;
        sideTag.style.display = "inline-block";
      } else {
        sideTag.style.display = "none";
      }
      if (figure) figure.setAnimation(exData.anim, { perSide: !!step.sideLabel });
    }

    const cuesList = document.getElementById("cues-list");
    cuesList.innerHTML = "";
    if (!step.isRest) {
      exData.cues.forEach((c) => {
        const li = document.createElement("li");
        li.textContent = c;
        cuesList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "Respira, scuoti le gambe, bevi un sorso d'acqua se serve.";
      cuesList.appendChild(li);
    }

    const noteEl = document.getElementById("block-note");
    if (step.blockNote) {
      noteEl.style.display = "block";
      noteEl.textContent = step.blockNote;
    } else {
      noteEl.style.display = "none";
    }

    const timerWrap = document.getElementById("timer-wrap");
    const repsWrap = document.getElementById("reps-wrap");
    const amrapWrap = document.getElementById("amrap-wrap");
    const mainControls = document.getElementById("main-controls");
    const restExtra = document.getElementById("rest-extra");

    timerWrap.style.display = "none";
    repsWrap.style.display = "none";
    amrapWrap.style.display = "none";
    mainControls.style.display = "flex";
    restExtra.style.display = "none";
    timerWrap.classList.remove("rest");

    if (step.isTest) {
      amrapWrap.style.display = "block";
      mainControls.style.display = "none";
    } else if (step.isRest) {
      timerWrap.style.display = "block";
      timerWrap.classList.add("rest");
      document.getElementById("timer-label").textContent = "Recupero — prossimo: " + nextExerciseName(p);
      document.getElementById("timer-value").textContent = formatTime(p.remaining);
      mainControls.style.display = "none";
      restExtra.style.display = "flex";
    } else if (step.mode === "time") {
      timerWrap.style.display = "block";
      document.getElementById("timer-label").textContent = "Lavoro";
      document.getElementById("timer-value").textContent = formatTime(p.remaining);
      document.getElementById("btn-next").textContent = "Salta →";
    } else {
      repsWrap.style.display = "block";
      let repsText;
      if (step.mode === "reps_pct") {
        repsText = (step._resolvedReps != null ? step._resolvedReps : "—") + " rep (60%)";
      } else {
        repsText = step.reps + " rep";
      }
      document.getElementById("reps-value").textContent = repsText;
      document.getElementById("reps-sub").textContent =
        `Serie ${step.setIndex || 1}/${step.setsTotal || 1} — tocca "Fatto" quando hai finito`;
      document.getElementById("btn-next").textContent = "Fatto ✓";
    }

    document.getElementById("btn-pause").textContent = p.paused ? "Riprendi" : "Pausa";
  }

  function nextExerciseName(p) {
    const n = p.steps[p.index + 1];
    if (!n) return "fine allenamento";
    return n.isRest ? "recupero" : EXERCISES[n.ex].name + (n.sideLabel ? ` (${n.sideLabel})` : "");
  }

  function startWorkout(dayKey) {
    showScreen("player");
    if (!figure) {
      figure = new StickFigure(document.getElementById("figure-canvas"));
    }
    if (!player) {
      player = new WorkoutPlayer({
        onUpdate: render,
        onFinish: (summary) => {
          lastFinishSummary = summary;
          document.getElementById("summary-duration").textContent = Math.round(summary.durationSec / 60) + "'";
          document.getElementById("summary-day").textContent = summary.dayLabel;
          document.getElementById("summary-note").value = "";
          showScreen("summary");
        }
      });
    }
    player.start(WORKOUTS[dayKey]);
  }

  btnStart.addEventListener("click", () => {
    if (!selectedDay) return;
    Beep.ensure();
    startWorkout(selectedDay);
  });

  document.getElementById("btn-prev").addEventListener("click", () => player && player.prev());
  document.getElementById("btn-next").addEventListener("click", () => player && player.next(false));
  document.getElementById("btn-pause").addEventListener("click", () => player && player.togglePause());
  document.getElementById("btn-skip-rest").addEventListener("click", () => player && player.skip());
  document.getElementById("btn-add15").addEventListener("click", () => player && player.addSeconds(15));

  document.getElementById("btn-amrap-confirm").addEventListener("click", () => {
    const val = document.getElementById("amrap-input").value;
    if (val === "" || isNaN(parseInt(val, 10))) return;
    player.setAmrapResult(val);
  });
  document.getElementById("amrap-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-amrap-confirm").click();
  });

  document.getElementById("btn-abort").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Vuoi davvero interrompere l'allenamento? I progressi di questa sessione non verranno salvati.")) {
      if (player) player.abort();
      showScreen("select");
    }
  });

  document.getElementById("btn-save-session").addEventListener("click", () => {
    if (!lastFinishSummary) return;
    const note = document.getElementById("summary-note").value.trim();
    Storage.saveSession({
      id: String(Date.now()),
      timestamp: Date.now(),
      dayKey: lastFinishSummary.dayKey,
      dayLabel: lastFinishSummary.dayLabel,
      durationSec: lastFinishSummary.durationSec,
      note
    });
    window.location.href = "history.html";
  });

  document.getElementById("btn-new-session").addEventListener("click", () => {
    dayCards.forEach((c) => c.classList.remove("selected"));
    selectedDay = null;
    btnStart.disabled = true;
    showScreen("select");
  });
})();
