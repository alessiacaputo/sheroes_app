/* =========================================================================
   SHEROES – Omino 2D (pittogramma SVG, nessuna libreria 3D esterna)
   Disegna una figura stilizzata "tipo app fitness": testa, tronco, 2 braccia,
   2 gambe, animata tra 2 pose chiave per ogni tipo di movimento.
   Nota: è uno schema semplificato per orientarsi a colpo d'occhio, non una
   dimostrazione biomeccanica precisa — le note scritte restano la guida.
   ========================================================================= */

// ---- Geometria di base (viewBox 0 0 320 260, figura rivolta verso destra) ----
const SK = {
  hip: { x: 160, y: 150 },
  torso: 78,
  headR: 15,
  headGap: 20,
  upperArm: 34,
  foreArm: 32,
  thigh: 44,
  shank: 46
};

function deg2rad(d) { return (d * Math.PI) / 180; }

// Un punto a distanza `len` dall'origine, con angolo `angleDeg`
// (0° = verso il basso, 90° = in avanti, -90° = indietro, 180° = in alto)
function point(origin, angleDeg, len) {
  const r = deg2rad(angleDeg);
  return { x: origin.x + len * Math.sin(r), y: origin.y + len * Math.cos(r) };
}

function computePose(p) {
  const hip = { x: SK.hip.x + (p.hipX || 0), y: SK.hip.y + (p.hipY || 0) };
  const lean = p.torsoLean || 0;
  const neck = {
    x: hip.x + SK.torso * Math.sin(deg2rad(lean)),
    y: hip.y - SK.torso * Math.cos(deg2rad(lean))
  };
  const headAngle = lean + (p.headTilt || 0);
  const head = {
    x: neck.x + (SK.headR + SK.headGap) * Math.sin(deg2rad(headAngle)),
    y: neck.y - (SK.headR + SK.headGap) * Math.cos(deg2rad(headAngle))
  };

  const thighN = p.thighN || 0, shankN = p.shankN != null ? p.shankN : thighN;
  const thighF = p.thighF != null ? p.thighF : thighN, shankF = p.shankF != null ? p.shankF : shankN;
  const upperN = p.upperN != null ? p.upperN : 12, foreN = p.foreN != null ? p.foreN : upperN;
  const upperF = p.upperF != null ? p.upperF : upperN, foreF = p.foreF != null ? p.foreF : foreN;

  const kneeN = point(hip, thighN, SK.thigh);
  const footN = point(kneeN, shankN, SK.shank);
  const kneeF = point(hip, thighF, SK.thigh);
  const footF = point(kneeF, shankF, SK.shank);

  const elbowN = point(neck, upperN, SK.upperArm);
  const handN = point(elbowN, foreN, SK.foreArm);
  const elbowF = point(neck, upperF, SK.upperArm);
  const handF = point(elbowF, foreF, SK.foreArm);

  return { head, neck, hip, kneeN, footN, kneeF, footF, elbowN, handN, elbowF, handF };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpParams(a, b, t) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const out = {};
  keys.forEach((k) => { out[k] = lerp(a[k] || 0, b[k] || 0, t); });
  return out;
}

const ease = (t) => (1 - Math.cos(Math.min(Math.max(t, 0), 1) * Math.PI)) / 2; // 0->1 smooth
const oscillate = (p) => { // 0 -> 1 -> 0 smooth loop over one phase cycle
  const t = p < 0.5 ? p * 2 : 2 - p * 2;
  return ease(t);
};

/* =========================================================================
   Archetipi di movimento: ogni esercizio punta a uno di questi.
   a/b = pose chiave (parametri), mode: "oscillate" | "hold" | "asym"
   captions = [testo fase A->B, testo fase B->A] oppure singolo testo per "hold"
   ========================================================================= */
const STANDING = { hipY: 0, torsoLean: 6, thighN: 0, shankN: 0, upperN: 12, foreN: 12 };

const ARCHETYPES = {
  jump_jacks: {
    a: Object.assign({}, STANDING, { thighN: 0, thighF: 0, upperN: 12, upperF: -12, foreN: 12, foreF: -12 }),
    b: { hipY: -14, torsoLean: 4, thighN: 26, thighF: -26, shankN: 0, shankF: 0, upperN: 168, upperF: 168, foreN: 168, foreF: 168 },
    mode: "oscillate",
    captions: ["Gambe larghe, braccia su", "Torna al centro"]
  },
  high_knee: {
    a: Object.assign({}, STANDING),
    b: { hipY: -8, torsoLean: 6, thighN: 100, shankN: -70, thighF: -12, shankF: 8, upperN: -60, foreN: -20, upperF: 60, foreF: 30 },
    mode: "oscillate",
    captions: ["Ginocchio al petto…", "…alterna lato"]
  },
  kick_back: {
    a: Object.assign({}, STANDING),
    b: { hipY: -4, torsoLean: 10, thighN: -8, shankN: 130, thighF: 6, shankF: 0, upperN: 40, foreN: 10, upperF: -30, foreF: -10 },
    mode: "oscillate",
    captions: ["Calcia il tallone al gluteo…", "…alterna lato"]
  },
  pogo: {
    a: Object.assign({}, STANDING, { thighN: 4, thighF: -4 }),
    b: { hipY: -10, torsoLean: 6, thighN: 4, thighF: -4, shankN: 4, shankF: -4, upperN: 4, upperF: -4, foreN: 4, foreF: -4 },
    mode: "oscillate",
    captions: ["Rimbalzo leggero sulle punte"]
  },
  snap_down: {
    a: Object.assign({}, STANDING, { hipY: -6 }),
    b: { hipY: 40, torsoLean: 18, thighN: 45, shankN: -45, thighF: -45, shankF: 45, upperN: -20, foreN: -10, upperF: 20, foreF: 10 },
    mode: "asym",
    captions: ["Scendi veloce…", "…tieni 3 secondi"]
  },

  down_dog: {
    a: { hipY: 25, torsoLean: 78, headTilt: -6, thighN: 20, shankN: 10, thighF: 20, shankF: 10, upperN: 96, foreN: 8, upperF: 96, foreF: 8 },
    b: { hipY: -18, torsoLean: 65, headTilt: 40, thighN: 8, shankN: -4, thighF: 8, shankF: -4, upperN: 96, foreN: 8, upperF: 96, foreF: 8 },
    mode: "oscillate",
    captions: ["Bacino in alto (Down Dog)", "Torna in quadrupedia"]
  },
  plank_static: {
    a: { hipY: 15, torsoLean: 82, headTilt: 0, thighN: 0, shankN: 4, thighF: 0, shankF: 4, upperN: 96, foreN: 4, upperF: 96, foreF: 4 },
    b: { hipY: 15, torsoLean: 82, headTilt: 0, thighN: 0, shankN: 4, thighF: 0, shankF: 4, upperN: 80, foreN: -20, upperF: 96, foreF: 4 },
    mode: "hold",
    captions: ["Mantieni la posizione, corpo in linea retta"]
  },
  inchworm: {
    a: { hipY: -30, torsoLean: 78, headTilt: -10, thighN: 8, shankN: 4, thighF: 8, shankF: 4, upperN: 84, foreN: 4, upperF: 84, foreF: 4 },
    b: { hipY: -55, torsoLean: 25, headTilt: 30, thighN: 4, shankN: 4, thighF: 4, shankF: 4, upperN: 92, foreN: 0, upperF: 92, foreF: 0 },
    mode: "oscillate",
    captions: ["Cammina in avanti con le mani…", "…poi torna con i piedi"]
  },

  hinge: {
    a: Object.assign({}, STANDING, { upperN: 150, foreN: 150, upperF: 150, foreF: 150 }),
    b: { hipY: -4, torsoLean: 72, headTilt: -6, thighN: 6, shankN: 4, thighF: 6, shankF: 4, upperN: 150, foreN: 150, upperF: 150, foreF: 150 },
    mode: "oscillate",
    captions: ["Busto in avanti (schiena dritta)", "Torna dritta"]
  },
  hinge_hold: {
    a: { hipY: 0, torsoLean: 68, headTilt: -6, thighN: 6, shankN: 4, thighF: 6, shankF: 4, upperN: 30, foreN: 20, upperF: 30, foreF: 20 },
    b: { hipY: 0, torsoLean: 68, headTilt: -6, thighN: 6, shankN: 4, thighF: 6, shankF: 4, upperN: 30, foreN: 20, upperF: 30, foreF: 20 },
    mode: "hold",
    captions: ["Mantieni la posizione, talloni a terra"]
  },

  squat: {
    a: Object.assign({}, STANDING, { upperN: 60, foreN: 100, upperF: 60, foreF: 100 }),
    b: { hipY: 52, torsoLean: 24, thighN: 62, shankN: -60, thighF: 62, shankF: -60, upperN: 60, foreN: 100, upperF: 60, foreF: 100 },
    mode: "oscillate",
    captions: ["Scendi, sedere indietro", "Risali"]
  },
  squat_hold: {
    a: { hipY: 40, torsoLean: 20, thighN: 55, shankN: -52, thighF: 55, shankF: -52, upperN: 60, foreN: 100, upperF: 60, foreF: 100 },
    b: { hipY: 40, torsoLean: 20, thighN: 55, shankN: -52, thighF: 55, shankF: -52, upperN: 60, foreN: 100, upperF: 60, foreF: 100 },
    mode: "hold",
    captions: ["Mantieni la posizione più in basso che riesci"]
  },

  lunge: {
    a: Object.assign({}, STANDING, { upperN: 10, foreN: 10, upperF: 10, foreF: 10 }),
    b: { hipY: 34, torsoLean: 8, thighN: 45, shankN: -50, thighF: -35, shankF: 70, upperN: -20, foreN: 0, upperF: 20, foreF: 0 },
    mode: "oscillate",
    captions: ["Scendi in affondo (ginocchio verso terra)", "Risali"]
  },
  lunge_twist: {
    a: Object.assign({}, STANDING),
    b: { hipY: 20, torsoLean: 35, headTilt: 10, thighN: 55, shankN: -55, thighF: -20, shankF: 40, upperN: 30, foreN: -60, upperF: -80, foreF: 40 },
    mode: "oscillate",
    captions: ["Affondo lungo…", "…poi ruota il busto"]
  },

  lying_twist: {
    a: { hipY: 55, torsoLean: 40, headTilt: -10, thighN: 60, shankN: -20, thighF: 60, shankF: -20, upperN: 96, foreN: -20, upperF: 96, foreF: 20 },
    b: { hipY: 55, torsoLean: 40, headTilt: -10, thighN: 60, shankN: -20, thighF: 60, shankF: -20, upperN: 96, foreN: 20, upperF: 96, foreF: -20 },
    mode: "oscillate",
    captions: ["Ruota da un lato…", "…poi dall'altro"]
  },
  prone_lift: {
    a: { hipY: 62, torsoLean: -6, headTilt: 0, thighN: 6, shankN: 0, thighF: 6, shankF: 0, upperN: -150, foreN: -150, upperF: -150, foreF: -150 },
    b: { hipY: 62, torsoLean: -6, headTilt: 0, thighN: -34, shankN: 8, thighF: -34, shankF: 8, upperN: -150, foreN: -150, upperF: -150, foreF: -150 },
    mode: "oscillate",
    captions: ["Solleva le gambe (busto a terra)", "Abbassa controllata"]
  },

  pushup: {
    a: { hipY: 15, torsoLean: 82, headTilt: 0, thighN: 0, shankN: 4, thighF: 0, shankF: 4, upperN: 96, foreN: 4, upperF: 96, foreF: 4 },
    b: { hipY: 5, torsoLean: 80, headTilt: -4, thighN: 0, shankN: 4, thighF: 0, shankF: 4, upperN: 100, foreN: 130, upperF: 100, foreF: 130 },
    mode: "oscillate",
    captions: ["Scendi, gomiti vicini al busto", "Spingi su"]
  },

  band_curl: {
    a: Object.assign({}, STANDING, { upperN: 12, foreN: 12, upperF: 12, foreF: 12 }),
    b: Object.assign({}, STANDING, { upperN: 12, foreN: 165, upperF: 12, foreF: 165 }),
    mode: "oscillate",
    captions: ["Piega il gomito", "Distendi controllata"]
  },
  band_row: {
    a: Object.assign({}, STANDING, { torsoLean: 30, upperN: 96, foreN: 96, upperF: 96, foreF: 96 }),
    b: Object.assign({}, STANDING, { torsoLean: 30, upperN: 96, foreN: 170, upperF: 96, foreF: 170 }),
    mode: "oscillate",
    captions: ["Tira i gomiti indietro", "Distendi in 4 secondi"]
  },
  band_press: {
    a: Object.assign({}, STANDING, { upperN: 100, foreN: 155, upperF: 100, foreF: 155 }),
    b: Object.assign({}, STANDING, { upperN: 178, foreN: 178, upperF: 178, foreF: 178 }),
    mode: "oscillate",
    captions: ["Spingi in alto", "Torna giù controllata"]
  },

  side_hold: {
    a: { hipY: 30, torsoLean: 30, headTilt: 0, thighN: 4, shankN: 4, thighF: 4, shankF: 4, upperN: 96, foreN: 0, upperF: -150, foreF: 0 },
    b: { hipY: 30, torsoLean: 30, headTilt: 0, thighN: 4, shankN: 4, thighF: 4, shankF: 4, upperN: 96, foreN: 0, upperF: -150, foreF: 0 },
    mode: "hold",
    captions: ["Mantieni la posizione, corpo in linea"]
  },

  calf_raise: {
    a: Object.assign({}, STANDING),
    b: Object.assign({}, STANDING, { hipY: -14 }),
    mode: "oscillate",
    captions: ["Sali sulle punte", "Scendi controllata"]
  },

  rest: {
    a: Object.assign({}, STANDING),
    b: Object.assign({}, STANDING, { hipY: -3 }),
    mode: "oscillate",
    captions: ["Recupero"]
  }
};

const SVG_NS = "http://www.w3.org/2000/svg";

class StickFigure {
  constructor(container) {
    this.container = container;
    this.currentAnim = "rest";
    this.perSide = false;
    this._sideFlip = 1;
    this._startTime = performance.now();
    this._build();
    this._raf = this._raf.bind(this);
    requestAnimationFrame(this._raf);
  }

  _el(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  _build() {
    this.container.innerHTML = "";
    this.container.style.position = "relative";
    this.container.style.width = "100%";
    this.container.style.height = "100%";

    const svg = this._el("svg", {
      viewBox: "0 -20 320 330",
      width: "100%",
      height: "100%",
      style: "display:block; transition: transform 0.15s ease;"
    });

    svg.appendChild(this._el("line", {
      x1: 20, y1: 233, x2: 300, y2: 233,
      stroke: "#ffffff22", "stroke-width": 2, "stroke-dasharray": "3 7"
    }));

    this.elArmFar = this._el("polyline", { fill: "none", stroke: "#9a96a6", "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.55 });
    this.elLegFar = this._el("polyline", { fill: "none", stroke: "#9a96a6", "stroke-width": 10, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.55 });
    this.elTorso = this._el("line", { stroke: "#f5f3f0", "stroke-width": 11, "stroke-linecap": "round" });
    this.elLegNear = this._el("polyline", { fill: "none", stroke: "#ff3d6e", "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round" });
    this.elArmNear = this._el("polyline", { fill: "none", stroke: "#ff3d6e", "stroke-width": 10, "stroke-linecap": "round", "stroke-linejoin": "round" });
    this.elHead = this._el("circle", { r: SK.headR, fill: "#f5f3f0" });

    [this.elArmFar, this.elLegFar, this.elTorso, this.elLegNear, this.elArmNear, this.elHead]
      .forEach((e) => svg.appendChild(e));

    this.container.appendChild(svg);
    this.svgEl = svg;

    const caption = document.createElement("div");
    caption.className = "figure-caption";
    this.container.appendChild(caption);
    this.captionEl = caption;
  }

  setAnimation(key, opts = {}) {
    if (!ARCHETYPES[key]) key = "rest";
    if (this.currentAnim !== key) this._startTime = performance.now();
    this.currentAnim = key;
    this.perSide = !!opts.perSide;
  }

  _raf(now) {
    requestAnimationFrame(this._raf);
    const arche = ARCHETYPES[this.currentAnim] || ARCHETYPES.rest;
    const cycle = arche.mode === "asym" ? 2.2 : 1.7;
    const elapsed = (now - this._startTime) / 1000;
    const phase = (elapsed % cycle) / cycle;

    if (this.perSide) {
      const idx = Math.floor(elapsed / cycle);
      this._sideFlip = idx % 2 === 0 ? 1 : -1;
    } else {
      this._sideFlip = 1;
    }
    this.svgEl.style.transform = this._sideFlip < 0 ? "scaleX(-1)" : "scaleX(1)";

    let t;
    if (arche.mode === "hold") {
      t = 0.9 + 0.1 * Math.sin(elapsed * 2);
    } else if (arche.mode === "asym") {
      // discesa rapida (primo 20% del ciclo), tenuta, risalita rapida (ultimo 25%)
      if (phase < 0.2) t = ease(phase / 0.2);
      else if (phase < 0.75) t = 1;
      else t = 1 - ease((phase - 0.75) / 0.25);
    } else {
      t = oscillate(phase);
    }

    const params = lerpParams(arche.a, arche.b, t);
    const pose = computePose(params);
    this._draw(pose);

    const caps = arche.captions || [];
    let text;
    if (caps.length <= 1) text = caps[0] || "";
    else text = phase < 0.5 ? caps[0] : caps[1];
    if (this.captionEl.textContent !== text) this.captionEl.textContent = text;
  }

  _draw(p) {
    this.elHead.setAttribute("cx", p.head.x);
    this.elHead.setAttribute("cy", p.head.y);
    this.elTorso.setAttribute("x1", p.neck.x);
    this.elTorso.setAttribute("y1", p.neck.y);
    this.elTorso.setAttribute("x2", p.hip.x);
    this.elTorso.setAttribute("y2", p.hip.y);
    this.elLegFar.setAttribute("points", `${p.hip.x},${p.hip.y} ${p.kneeF.x},${p.kneeF.y} ${p.footF.x},${p.footF.y}`);
    this.elLegNear.setAttribute("points", `${p.hip.x},${p.hip.y} ${p.kneeN.x},${p.kneeN.y} ${p.footN.x},${p.footN.y}`);
    this.elArmFar.setAttribute("points", `${p.neck.x},${p.neck.y} ${p.elbowF.x},${p.elbowF.y} ${p.handF.x},${p.handF.y}`);
    this.elArmNear.setAttribute("points", `${p.neck.x},${p.neck.y} ${p.elbowN.x},${p.elbowN.y} ${p.handN.x},${p.handN.y}`);
  }
}
