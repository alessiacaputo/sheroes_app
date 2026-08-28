/* =========================================================================
   SHEROES – Motore del player di allenamento
   ========================================================================= */

// ---- Suoni (WebAudio, nessun file esterno necessario) ----
const Beep = {
  ctx: null,
  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  tone(freq, dur, vol = 0.18) {
    try {
      this.ensure();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) { /* ignore audio errors (autoplay policies etc.) */ }
  },
  tick() { this.tone(660, 0.08); },
  go() { this.tone(880, 0.28); },
  done() { this.tone(520, 0.18); setTimeout(() => this.tone(780, 0.28), 150); }
};

// ---- Costruzione della sequenza di "step" a partire dai blocchi in data.js ----
function expandPerSide(item) {
  if (!item.perSide) return [item];
  return [
    Object.assign({}, item, { sideLabel: "Lato destro" }),
    Object.assign({}, item, { sideLabel: "Lato sinistro" })
  ];
}

function buildSteps(workout) {
  const steps = [];

  function pushWork(item, meta) {
    expandPerSide(item).forEach((it) => {
      steps.push(Object.assign({ isRest: false, isTest: false }, it, meta));
    });
  }

  function pushRest(seconds, label) {
    if (seconds > 0) {
      steps.push({ isRest: true, isTest: false, duration: seconds, restLabel: label });
    }
  }

  function processSection(section, sectionLabel) {
    section.blocks.forEach((block) => {
      const blockLabel = `${sectionLabel} · ${block.label}`;

      if (block.type === "circuit") {
        for (let r = 1; r <= block.rounds; r++) {
          block.items.forEach((item) => {
            pushWork(item, { blockLabel, roundIndex: r, roundsTotal: block.rounds, blockNote: block.note });
          });
          if (r < block.rounds) pushRest(block.restBetweenRounds || 0, "Recupero tra i giri (libero)");
        }
      } else if (block.type === "single") {
        for (let s = 1; s <= block.sets; s++) {
          pushWork({ ex: block.ex, mode: block.mode, duration: block.duration, reps: block.reps, perSide: block.perSide },
            { blockLabel, setIndex: s, setsTotal: block.sets });
        }
      } else if (block.type === "superset") {
        for (let s = 1; s <= block.sets; s++) {
          block.items.forEach((item) => {
            pushWork(item, { blockLabel, setIndex: s, setsTotal: block.sets });
          });
          if (s < block.sets) pushRest(block.restBetweenSets || 0, "Recupero");
        }
      } else if (block.type === "test_then_superset") {
        steps.push({ isRest: false, isTest: true, ex: block.test.ex, mode: "amrap", blockLabel, blockNote: block.note });
        for (let s = 1; s <= block.sets; s++) {
          block.items.forEach((item) => {
            pushWork(item, { blockLabel, setIndex: s, setsTotal: block.sets });
          });
          if (s < block.sets) pushRest(block.restBetweenSets || 0, "Recupero");
        }
      }
    });
  }

  processSection(workout.warmup, "Riscaldamento");
  processSection(workout.main, workout.main.title);

  return steps;
}

// ---- Player: gestisce lo stato corrente e i timer ----
class WorkoutPlayer {
  constructor({ onUpdate, onFinish }) {
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.reset();
  }

  reset() {
    this.steps = [];
    this.index = 0;
    this.pushUpMax = null;
    this.paused = false;
    this.timerHandle = null;
    this.remaining = 0;
    this.stepStartedAt = null;
    this.elapsedInStep = 0;
    this.workoutStartedAt = null;
    this.dayKey = null;
    this.dayLabel = null;
  }

  start(workout) {
    this.reset();
    this.dayKey = workout.key;
    this.dayLabel = workout.label;
    this.steps = buildSteps(workout);
    this.workoutStartedAt = Date.now();
    this._enterStep(0);
  }

  get currentStep() {
    return this.steps[this.index];
  }

  get progress() {
    return { current: this.index + 1, total: this.steps.length };
  }

  _clearTimer() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  _enterStep(i) {
    this._clearTimer();
    this.index = i;
    const step = this.currentStep;
    this.paused = false;

    if (!step) {
      this._finish();
      return;
    }

    // Resolve reps_pct now that pushUpMax may be known
    if (step.mode === "reps_pct" && this.pushUpMax != null) {
      step._resolvedReps = Math.max(1, Math.round(this.pushUpMax * step.pct));
    }

    if (step.mode === "time" || step.isRest) {
      this.remaining = step.duration;
      this._beeped3 = false;
      this.timerHandle = setInterval(() => this._tick(), 100);
      Beep.go();
    } else {
      // reps / reps_pct / amrap: count up a free stopwatch, user advances manually
      this.elapsedInStep = 0;
      this._tickStart = Date.now();
      this.timerHandle = setInterval(() => {
        this.elapsedInStep = (Date.now() - this._tickStart) / 1000;
        this._notify();
      }, 200);
    }

    this._notify();
  }

  _tick() {
    if (this.paused) return;
    this.remaining -= 0.1;
    if (this.remaining <= 3.05 && this.remaining > 2.95 && !this._beeped3) {
      this._beeped3 = true;
    }
    if (this.remaining <= 3 && this.remaining > 0) {
      const whole = Math.ceil(this.remaining);
      if (whole !== this._lastWhole) {
        this._lastWhole = whole;
        if (whole <= 3 && whole >= 1) Beep.tick();
      }
    }
    if (this.remaining <= 0) {
      this.remaining = 0;
      Beep.done();
      this._clearTimer();
      this.next(true);
      return;
    }
    this._notify();
  }

  togglePause() {
    this.paused = !this.paused;
    this._notify();
  }

  setAmrapResult(n) {
    this.pushUpMax = Math.max(0, parseInt(n, 10) || 0);
    this.next(false);
  }

  next(auto = false) {
    if (this.index + 1 >= this.steps.length) {
      this._finish();
    } else {
      this._enterStep(this.index + 1);
    }
  }

  prev() {
    if (this.index > 0) this._enterStep(this.index - 1);
  }

  skip() {
    this._clearTimer();
    this.next(false);
  }

  addSeconds(sec) {
    const step = this.currentStep;
    if (step && (step.mode === "time" || step.isRest)) {
      this.remaining += sec;
      this._notify();
    }
  }

  _finish() {
    this._clearTimer();
    const durationSec = Math.round((Date.now() - this.workoutStartedAt) / 1000);
    this.onFinish({
      dayKey: this.dayKey,
      dayLabel: this.dayLabel,
      durationSec,
      stepsCompleted: this.steps.length
    });
  }

  _notify() {
    this.onUpdate(this);
  }

  abort() {
    this._clearTimer();
  }
}
