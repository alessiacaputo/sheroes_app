/* =========================================================================
   SHEROES – Database esercizi e struttura allenamento
   Estratto da: ALLENAMENTO_A_CASA_SHEROES_FASE_1.pdf
   ========================================================================= */

// ---- Archetipi di animazione (riutilizzati da più esercizi) ----
// jump | plank_flow | hinge | squat | lunge | core_twist | pushup |
// band_curl | band_row | band_press | side_hold | calf_raise | rest

const EXERCISES = {
  // --- WARM UP ---
  jumping_jacks: {
    name: "Jumping Jacks",
    anim: "jump",
    cues: ["Ritmo blando, non a tutta velocità", "Atterraggio morbido sulle punte"]
  },
  skip_alto: {
    name: "Skip Alto",
    anim: "jump",
    cues: ["Porta il ginocchio in alto ad ogni passo", "Ritmo blando"]
  },
  skip_calciato_dietro: {
    name: "Skip Calciato Dietro",
    anim: "jump",
    cues: ["Calcia il tallone verso il gluteo", "Ritmo blando"]
  },
  bear_plank_down_dog: {
    name: "Bear Plank to Down Dog",
    anim: "plank_flow",
    cues: ["Cerca di stendere bene le gambe"]
  },
  bear_plank_down_dog_alt: {
    name: "Bear Plank to Down Dog Alternato",
    anim: "plank_flow",
    cues: ["Stendi bene le gambe", "Tocca con la mano destra il piede sinistro e viceversa"]
  },
  simplify_greatest_stretch: {
    name: "Simplify Greatest Stretch",
    anim: "lunge",
    cues: ["Prima affondo lungo, poi rotazione del busto", "Il sedere non rimane alto"]
  },
  straight_arm_goodmorning: {
    name: "Straight Arm Goodmorning",
    anim: "hinge",
    cues: [
      "Partenza a gambe larghe e tese, braccia tese sopra la testa",
      "Porta il busto parallelo al pavimento",
      "NON arrotondare la zona lombare",
      "Mantieni il sedere in fuori"
    ]
  },
  rdl_1l: {
    name: "1L RDL (Romanian Deadlift monopodalico)",
    anim: "hinge",
    cues: ["Gamba d'appoggio leggermente piegata", "Tieni l'addome attivo"]
  },

  // --- GIORNO 1 ---
  russian_twist: {
    name: "Russian Twist",
    anim: "core_twist",
    cues: ["Movimento controllato, non veloce", "Busto stabile, ruota dal core"]
  },
  superman_gambe: {
    name: "Superman Solo Gambe",
    anim: "core_twist",
    cues: ["Solleva solo le gambe, busto a terra", "Movimento controllato"]
  },
  plank: {
    name: "Plank",
    anim: "plank_flow",
    cues: ["Corpo in linea retta", "Addome e glutei contratti"]
  },
  pogo_jump: {
    name: "Pogo Jump",
    anim: "jump",
    cues: ["Piede a martello (dorsiflesso)", "Rimani a terra il meno possibile"]
  },
  bulgarian_squat_iso: {
    name: "Bulgarian Squat ISO",
    anim: "squat",
    cues: ["Mantieni la posizione per il tempo indicato", "Scendi fin dove riesci"]
  },
  zombie_squat: {
    name: "Zombie Squat",
    anim: "squat",
    cues: [
      "3 fermi: 1) sedere indietro 2) metà discesa 3) punto più profondo (senza perdere la schiena)",
      "Piedi più larghi delle spalle, punte leggermente extraruotate",
      "Le ginocchia seguono la linea delle punte dei piedi"
    ]
  },
  inchworm: {
    name: "Inchworm",
    anim: "plank_flow",
    cues: ["Gambe tese", "Esercizio sia in discesa che in salita"]
  },
  push_up_test: {
    name: "Test Push Up (max reps)",
    anim: "pushup",
    cues: ["Fai il maggior numero di push up possibile", "Questo numero determina il carico delle serie successive (60%)"]
  },
  touch_hamstring_3: {
    name: "3 Touch Hamstring",
    anim: "hinge",
    cues: ["Gamba leggermente piegata", "Il busto NON ruota mai"]
  },
  knee_push_up: {
    name: "Knee Push Up",
    anim: "pushup",
    cues: ["Gomiti vicini al busto", "Esegui il 60% delle reps del test iniziale"]
  },
  biceps_band: {
    name: "Biceps con Elastico",
    anim: "band_curl",
    cues: ["Gomiti fermi lungo il fianco", "Movimento controllato"]
  },
  copenhagen_short_lever: {
    name: "Copenhagen Short Lever",
    anim: "side_hold",
    cues: ["Appoggia il ginocchio su una sedia", "Mantieni la posizione per il tempo indicato"]
  },

  // --- GIORNO 2 ---
  deadbugs: {
    name: "Deadbugs",
    anim: "core_twist",
    cues: ["Zona lombare sempre a contatto col pavimento", "Movimento lento e controllato"]
  },
  bear_plank_touch_shoulder: {
    name: "Bear Plank Touch Shoulder",
    anim: "plank_flow",
    cues: ["Bacino stabile, non ruota", "Tocca la spalla opposta alternando"]
  },
  lateral_plank: {
    name: "Lateral Plank",
    anim: "side_hold",
    cues: ["Corpo in linea retta", "Bacino non cade verso il basso"]
  },
  snap_down: {
    name: "Snap Down",
    anim: "jump",
    cues: ["Cadi il più velocemente possibile", "Mantieni la posizione 3 secondi con ginocchia a 90°"]
  },
  iso_hamstring_2feet: {
    name: "2 Feet ISO Hamstring",
    anim: "hinge",
    cues: ["Talloni appoggiati al pavimento", "Mantieni la posizione per il tempo indicato"]
  },
  rdl_band: {
    name: "RDL con Elastico",
    anim: "hinge",
    cues: ["Scendi in 5 secondi", "Schiena sempre ben dritta"]
  },
  static_lunges: {
    name: "Static Lunges",
    anim: "lunge",
    cues: ["Arriva a toccare con il ginocchio il pavimento", "Il ginocchio NON deve mai cadere verso l'interno"]
  },
  bulgarian_squat: {
    name: "Bulgarian Squat",
    anim: "squat",
    cues: ["Movimento lento e controllato"]
  },
  row_band: {
    name: "Row con Elastico",
    anim: "band_row",
    cues: ["Riporta le braccia distese in 4 secondi"]
  },
  military_press_band: {
    name: "Military Press con Elastico",
    anim: "band_press",
    cues: ["Movimento controllato", "Non inarcare la schiena"]
  },
  calf_raise_1l: {
    name: "1L Calf Raise ISO",
    anim: "calf_raise",
    cues: ["Gamba completamente tesa", "Mantieni la posizione per il tempo indicato"]
  }
};

// ---- Struttura del warm up (comune a entrambi i giorni) ----
const WARMUP = {
  title: "Riscaldamento",
  blocks: [
    {
      type: "circuit",
      label: "A) Circuito attivazione",
      rounds: 2,
      restBetweenRounds: 0,
      note: "Ogni esercizio 20\" in maniera blanda, 2 giri senza recupero",
      items: [
        { ex: "jumping_jacks", mode: "time", duration: 20 },
        { ex: "skip_alto", mode: "time", duration: 20 },
        { ex: "skip_calciato_dietro", mode: "time", duration: 20 }
      ]
    },
    { type: "single", label: "B)", ex: "bear_plank_down_dog", mode: "reps", sets: 1, reps: 8 },
    { type: "single", label: "C)", ex: "bear_plank_down_dog_alt", mode: "reps", sets: 1, reps: 6, perSide: true },
    { type: "single", label: "D)", ex: "simplify_greatest_stretch", mode: "reps", sets: 1, reps: 6, perSide: true },
    { type: "single", label: "E)", ex: "straight_arm_goodmorning", mode: "reps", sets: 1, reps: 8 },
    { type: "single", label: "F)", ex: "rdl_1l", mode: "reps", sets: 1, reps: 8, perSide: true }
  ]
};

// ---- Giorno 1 ----
const DAY1 = {
  title: "Giorno 1",
  blocks: [
    {
      type: "circuit",
      label: "A) Core Circuit",
      rounds: 3,
      restBetweenRounds: 20,
      note: "Ogni esercizio 15\" (aumenta 2\"/settimana). Recupero libero tra i giri.",
      items: [
        { ex: "russian_twist", mode: "time", duration: 15 },
        { ex: "superman_gambe", mode: "time", duration: 15 },
        { ex: "plank", mode: "time", duration: 15 }
      ]
    },
    {
      type: "superset",
      label: "B) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "pogo_jump", mode: "reps", reps: 10 },
        { ex: "bulgarian_squat_iso", mode: "time", duration: 15 }
      ]
    },
    {
      type: "superset",
      label: "C) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "zombie_squat", mode: "reps", reps: 8 },
        { ex: "inchworm", mode: "reps", reps: 6 }
      ]
    },
    {
      type: "test_then_superset",
      label: "D) Test + Coppia di esercizi",
      note: "Prima 1 serie di push up al massimo. Nelle 3 serie successive farai il 60% di quel numero.",
      test: { ex: "push_up_test", mode: "amrap" },
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "touch_hamstring_3", mode: "reps", reps: 8, perSide: true },
        { ex: "knee_push_up", mode: "reps_pct", pct: 0.6 }
      ]
    },
    {
      type: "superset",
      label: "E) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "biceps_band", mode: "reps", reps: 10 },
        { ex: "copenhagen_short_lever", mode: "time", duration: 15 }
      ]
    }
  ]
};

// ---- Giorno 2 ----
const DAY2 = {
  title: "Giorno 2",
  blocks: [
    {
      type: "circuit",
      label: "A) Core Circuit",
      rounds: 3,
      restBetweenRounds: 20,
      note: "Ogni esercizio 15\". Recupero libero tra i giri.",
      items: [
        { ex: "deadbugs", mode: "time", duration: 15 },
        { ex: "bear_plank_touch_shoulder", mode: "time", duration: 15 },
        { ex: "lateral_plank", mode: "time", duration: 15 }
      ]
    },
    {
      type: "superset",
      label: "B) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "snap_down", mode: "reps", reps: 6 },
        { ex: "iso_hamstring_2feet", mode: "time", duration: 15 }
      ]
    },
    {
      type: "superset",
      label: "C) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "rdl_band", mode: "reps", reps: 8 },
        { ex: "static_lunges", mode: "reps", reps: 8, perSide: true }
      ]
    },
    {
      type: "superset",
      label: "D) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "bulgarian_squat", mode: "reps", reps: 8, perSide: true },
        { ex: "row_band", mode: "reps", reps: 10 }
      ]
    },
    {
      type: "superset",
      label: "E) Coppia di esercizi",
      sets: 3,
      restBetweenSets: 45,
      items: [
        { ex: "military_press_band", mode: "reps", reps: 10 },
        { ex: "calf_raise_1l", mode: "time", duration: 20, perSide: true }
      ]
    }
  ]
};

const WORKOUTS = {
  day1: { key: "day1", label: "Giorno 1", warmup: WARMUP, main: DAY1 },
  day2: { key: "day2", label: "Giorno 2", warmup: WARMUP, main: DAY2 }
};
