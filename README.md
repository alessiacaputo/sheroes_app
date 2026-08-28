# SHEROES – Allenamento a casa (Fase 1)

Sito statico (HTML/CSS/JS puro, nessuna build necessaria) creato a partire dalla
scheda PDF del tuo allenatore. Due pagine:

- **`index.html`** — scegli Giorno 1 o Giorno 2, poi "Inizia Allenamento":
  ti guida in automatico da riscaldamento a esercizi, con cronometro
  automatico, conteggio serie/giri, timer di recupero e un omino 3D
  stilizzato che mostra il pattern di movimento insieme alle note
  dell'allenatore ("Attenzione a…").
- **`history.html`** — storico delle sessioni salvate (data, giorno, durata,
  nota), statistiche (sessioni totali, minuti totali, sessioni negli ultimi
  7 giorni, giorni di fila) e un grafico delle ultime 12 sessioni.

## Come pubblicarlo su GitHub Pages

1. Crea un nuovo repository su GitHub (es. `sheroes-workout`).
2. Carica tutti i file di questa cartella mantenendo la stessa struttura
   (`index.html`, `history.html`, `css/`, `js/`) nella root del repository.
   - Da web: "Add file" → "Upload files", trascina tutto dentro.
   - Da terminale:
     ```bash
     git init
     git add .
     git commit -m "SHEROES workout app"
     git branch -M main
     git remote add origin https://github.com/TUO-USERNAME/sheroes-workout.git
     git push -u origin main
     ```
3. Nel repository vai su **Settings → Pages**.
4. In "Build and deployment" scegli **Source: Deploy from a branch**,
   branch **main**, cartella **/ (root)** → Save.
5. Dopo 1-2 minuti il sito sarà live su:
   `https://TUO-USERNAME.github.io/sheroes-workout/`
6. Aggiungi quel link alla home della schermata del telefono (Safari/Chrome
   → "Aggiungi a Home") per aprirlo come un'app durante l'allenamento.

Nessuna chiave API, nessun account, nessun costo: è tutto statico.

## Come funziona lo storico

Le sessioni vengono salvate nel `localStorage` del browser che usi, cioè
**restano su quel dispositivo/browser specifico** (non si sincronizzano tra
telefono e computer). Se cancelli i dati di navigazione del browser, lo
storico si perde. Se in futuro vuoi sincronizzare tra più dispositivi,
serve aggiungere un piccolo backend o un servizio come Firebase — non
incluso in questa versione.

## Cosa modificare se cambia la scheda (Fase 2, ecc.)

Tutta la struttura dell'allenamento è in `js/data.js`:

- `EXERCISES`: nome, note dell'allenatore ("cues") e "archetipo di
  animazione" (`anim`) di ogni esercizio.
- `WARMUP`, `DAY1`, `DAY2`: la sequenza di blocchi (circuiti, coppie/superset,
  singoli esercizi, test AMRAP) con tempi/ripetizioni/serie.

Per aggiungere un nuovo esercizio: aggiungilo a `EXERCISES` scegliendo uno
degli archetipi già presenti in `js/figure.js` dentro `ARCHETYPES` (es.
`squat`, `hinge`, `lunge`, `jump_jacks`, `plank_static`, `band_curl`, ecc.)
oppure creane uno nuovo definendo due pose chiave (`a` e `b`, in gradi) e una
didascalia — il motore interpola automaticamente il movimento.

## Limiti da tenere presente

- **Il disegno dell'omino è uno schema semplificato** (pittogramma 2D,
  simile a quelli delle app fitness), non una dimostrazione biomeccanica
  perfetta: serve per capire a colpo d'occhio la forma del movimento
  (scendere/salire, avanti/indietro, quale lato), non per replicare la
  tecnica esatta esercizio per esercizio. Le indicazioni scritte
  ("Attenzione a…") restano la fonte principale — seguile sempre.
- Sotto le indicazioni c'è anche un link "Cerca un video di riferimento"
  che apre una ricerca YouTube per quell'esercizio, utile se vuoi vedere
  un'esecuzione reale.
- L'app **non conta le ripetizioni** in automatico (richiederebbe la
  fotocamera e un modello di visione artificiale): per gli esercizi a
  ripetizioni mostra il target e tu tocchi "Fatto ✓" quando hai finito la
  serie; per gli esercizi a tempo il cronometro parte ed è automatico.
- I tempi di recupero tra le "coppie di esercizi" (dove il PDF dice "si
  riposa quanto si vuole") sono impostati di default a 45" (20" tra i giri
  del core circuit) — puoi sempre saltarli o aggiungere +15" dal player.
