# Struttura e funzionalità del progetto — Mini JSONPlaceholder

Documento di riferimento completo sull'architettura e il funzionamento di ogni cartella e file del progetto.

---

## Panoramica generale

**Mini JSONPlaceholder** è un'applicazione educativa in italiano che insegna i concetti fondamentali di:
- Backend REST API con Express.js
- Database MySQL con query SQL parametrizzate
- Autenticazione JWT e bcrypt
- Frontend vanilla senza framework

| Componente | Tecnologia | Porta |
|------------|------------|-------|
| Backend | Node.js + Express 4 | 3000 |
| Database | MySQL 8 via Docker | 3307 |
| Admin DB | phpMyAdmin | 8081 |
| Frontend | HTML/CSS/JS puro | 8080 |

---

## Struttura ad albero

```
JSONPLACEHOLDER-full-stack/
├── CLAUDE.md                           # Documentazione progetto per Claude AI
├── .gitignore                          # Esclude: node_modules/, .env, .DS_Store
├── docker-compose.yml                  # MySQL 8 (porta 3307) + phpMyAdmin (porta 8081)
│
├── docs/                               # Documentazione formativa
│   ├── guida-setup-mysql.md            # Setup Docker + .env, troubleshooting
│   ├── cheatsheet-sql.md               # SQL di riferimento usati nel progetto
│   ├── spiegazione-migrazione.md       # Array vs MySQL, async/await, pool, FK
│   ├── esercizi.md                     # Descrizione degli esercizi numerati
│   └── struttura-progetto.md           # Questo file
│
├── api/                                # BACKEND — Express REST API
│   ├── .env.example                    # Template credenziali DB + JWT
│   ├── .env                            # Credenziali reali (gitignored)
│   ├── package.json                    # Dipendenze + "dev": node --watch server.js
│   ├── server.js                       # Entry point — Express, CORS, routes, :3000
│   │
│   ├── data/
│   │   └── database.vecchio.js         # Archivio: vecchia logica array in-memory
│   │
│   ├── database/
│   │   ├── connessione.js              # Pool mysql2 — legge .env, esporta pool
│   │   ├── schema.sql                  # CREATE TABLE (auto-eseguito da Docker)
│   │   ├── seed.sql                    # INSERT dati iniziali (auto-eseguito da Docker)
│   │   └── queries/
│   │       ├── utenti.js               # CRUD SQL async per la tabella utenti
│   │       ├── post.js                 # CRUD SQL async + paginazione LIMIT/OFFSET
│   │       └── commenti.js             # CRUD SQL async per la tabella commenti
│   │
│   ├── middleware/
│   │   └── autenticazione.js           # JWT: richiediAutenticazione, richiediRuolo()
│   │
│   ├── routes/
│   │   ├── utenti.js                   # /api/utenti — GET/POST/PUT/PATCH/DELETE
│   │   ├── post.js                     # /api/post — GET/POST/PUT/PATCH/DELETE
│   │   ├── commenti.js                 # /api/commenti — GET/POST/PUT/PATCH/DELETE
│   │   └── auth.js                     # /api/auth — POST /registrazione, POST /login
│   │
│   └── scripts/
│       └── genera-hash.js              # Utility CLI per generare hash bcrypt
│
└── web/                                # FRONTEND — HTML/CSS/JS puro, no build tools
    ├── package.json                    # Dev: serve -l 8080
    ├── index.html                      # Markup: sezioni, form, nav, breadcrumb
    ├── stile.css                       # CSS: card, button, form, nav, .nascosta
    └── js/
        ├── api.js                      # Fetch wrapper: BASE_URL, Bearer token, una funzione per endpoint
        ├── ui.js                       # Rendering DOM: mostraUtenti, mostraPost, mostraCommenti
        └── app.js                      # Orchestratore: stato, form handler, drill-down, login
```

---

## Cartella `api/` — Backend

### `server.js` — Entry point

Il file di avvio di Express. Si occupa di:

1. Caricare `.env` con `dotenv`
2. Abilitare CORS (per permettere le chiamate da frontend :8080 a backend :3000)
3. Parsare il body JSON con `express.json()`
4. Montare le 4 route principali:
   - `/api/utenti` → routes/utenti.js
   - `/api/post` → routes/post.js
   - `/api/commenti` → routes/commenti.js
   - `/api/auth` → routes/auth.js
5. Avviare il server sulla porta 3000

### `api/database/` — Layer dati

#### `connessione.js`

Crea e esporta un pool di connessioni `mysql2/promise`. Un pool riusa le connessioni invece di aprirne una nuova per ogni query (più efficiente).

Legge da `.env`: `DB_HOST`, `DB_PORT` (3307 per evitare conflitto con MySQL Workbench locale), `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

#### `schema.sql`

Contiene i `CREATE TABLE` per le 3 tabelle del progetto. Docker lo esegue automaticamente al primo avvio del container.

**Tabella `utenti`:**
```sql
id          INT AUTO_INCREMENT PRIMARY KEY
nome        VARCHAR(100) NOT NULL
email       VARCHAR(150) NOT NULL UNIQUE
citta       VARCHAR(100) NOT NULL DEFAULT ''
sesso       ENUM('M','F','Altro') NOT NULL
codiceFiscale CHAR(16) NOT NULL DEFAULT ''
dataNascita DATE
telefono    VARCHAR(20) NOT NULL DEFAULT ''
password    VARCHAR(255) NOT NULL
ruolo       ENUM('utente','admin') NOT NULL DEFAULT 'utente'
creatoIl    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

**Tabella `post`:**
```sql
id       INT AUTO_INCREMENT PRIMARY KEY
userId   INT NOT NULL, FOREIGN KEY → utenti.id ON DELETE CASCADE
titolo   VARCHAR(200) NOT NULL
corpo    TEXT NOT NULL
creatoIl TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

**Tabella `commenti`:**
```sql
id       INT AUTO_INCREMENT PRIMARY KEY
postId   INT NOT NULL, FOREIGN KEY → post.id ON DELETE CASCADE
nome     VARCHAR(100) NOT NULL
email    VARCHAR(150) NOT NULL
corpo    TEXT NOT NULL
creatoIl TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

La chiave `ON DELETE CASCADE` significa: eliminando un utente → si eliminano i suoi post → si eliminano i loro commenti.

#### `seed.sql`

Insert dei dati iniziali. Viene eseguito automaticamente da Docker dopo `schema.sql`.
Contiene 5 utenti (Mario Rossi con `ruolo='admin'`, gli altri `ruolo='utente'`), con password hashate via bcrypt.

**Credenziali admin di test:** `mario@email.com` / `password123`

#### `queries/utenti.js`

Esporta funzioni async che eseguono le query SQL per la tabella `utenti`.

| Funzione | Query | Note |
|----------|-------|------|
| `trovaUtenti(citta?)` | `SELECT ... FROM utenti [WHERE LOWER(citta) = LOWER(?)]` | Non include `password` nella SELECT |
| `trovaUtentePerId(id)` | `SELECT ... FROM utenti WHERE id = ?` | Restituisce `undefined` se non trovato |
| `trovaUtentePerEmail(email)` | `SELECT ... FROM utenti WHERE email = ?` | Include `password` — SOLO per login |
| `creaUtente(dati)` | `INSERT INTO utenti (...) VALUES (?, ...)` | Restituisce il nuovo utente (SELECT dopo INSERT) |
| `sostituisciUtente(id, dati)` | `UPDATE utenti SET nome=?, email=?, ... WHERE id=?` | Per PUT (sostituzione completa) |
| `aggiornaUtente(id, dati)` | Query dinamica: solo i campi presenti | Per PATCH (aggiornamento parziale) |
| `eliminaUtente(id)` | `DELETE FROM utenti WHERE id = ?` | Cascata automatica su post e commenti |

**Pattern chiave:** `const [righe] = await pool.query(sql, [params])` — la destrutturazione prende solo le righe, scartando i metadata MySQL.

**Prevenzione SQL injection:** tutti i valori usano `?` come placeholder, mai concatenazione di stringhe.

#### `queries/post.js`

Aggiunge la paginazione:

```js
// trovaPost restituisce:
{
  dati: [...],           // array di post per la pagina corrente
  meta: {
    pagina: 1,           // pagina attuale
    limite: 3,           // post per pagina
    totale: 25,          // totale post (per questo userId o tutti)
    pagine: 9            // Math.ceil(totale / limite)
  }
}
```

La query usa `LIMIT ? OFFSET ?` per paginare: `OFFSET = (pagina - 1) * limite`.

#### `queries/commenti.js`

Struttura identica a utenti.js. Supporta filtro opzionale `?postId=N`.

### `api/middleware/autenticazione.js`

Contiene due middleware JWT:

#### `richiediAutenticazione`

```
Request con Authorization: Bearer <token>
  → estrae token
  → jwt.verify(token, JWT_SECRET)
  → setta req.utente = { id, email, nome, ruolo }
  → chiama next() per passare al route handler
```

Se il token manca o è invalido → risponde `401 Token mancante` o `401 Token non valido`.

#### `richiediRuolo(...ruoliPermessi)`

È una **factory function** (funzione che restituisce una funzione). Accetta uno o più ruoli come argomenti e restituisce un middleware che controlla se `req.utente.ruolo` è tra quelli permessi.

```js
richiediRuolo("admin")        // solo admin
richiediRuolo("admin", "moderatore")  // admin o moderatore
```

Se il ruolo non è permesso → risponde `403 Permessi insufficienti`.

### `api/routes/` — Route handlers

Ogni file è un `Router` Express. Gli handler sono tutti `async` con `try/catch` per gestire errori del database.

#### `routes/auth.js` — Autenticazione

| Endpoint | Logica |
|----------|--------|
| `POST /api/auth/registrazione` | Valida campi → controlla email duplicata (409) → hash bcrypt → INSERT → genera JWT → restituisce `{token, utente}` |
| `POST /api/auth/login` | Valida email/password → `trovaUtentePerEmail` (include hash) → `bcrypt.compare` → genera JWT → restituisce `{token, utente}` (senza password) |

Il JWT include nel payload: `{ id, email, nome, ruolo }` con scadenza 7 giorni.

#### `routes/utenti.js` — CRUD Utenti

| Endpoint | Auth | Logica |
|----------|------|--------|
| `GET /` | No | `trovaUtenti(citta?)` |
| `GET /:id` | No | `trovaUtentePerId(id)`, 404 se non trovato |
| `POST /` | No | Hash password → `creaUtente`, 201 |
| `PUT /:id` | Sì + ownership | Solo proprietario o admin → hash password → `sostituisciUtente` |
| `PATCH /:id` | Sì + ownership | Solo proprietario o admin → password opzionale → `aggiornaUtente` |
| `DELETE /:id` | Sì + admin | `richiediRuolo("admin")` → `eliminaUtente` |

**Ownership check (inline middleware):**
```js
if (req.utente.id !== parseInt(req.params.id) && req.utente.ruolo !== "admin") {
    return res.status(403).json({ errore: "Puoi modificare solo il tuo profilo" });
}
```

#### `routes/post.js` — CRUD Post con paginazione

| Endpoint | Auth | Logica |
|----------|------|--------|
| `GET /` | No | `trovaPost(userId?, pagina, limite)` → `{dati, meta}` |
| `GET /:id` | No | `trovaPostPerId(id)` |
| `POST /` | Sì | `creaPost({userId, titolo, corpo})`, 201 |
| `PUT /:id` | Sì + ownership | Fetch post → `isAutore = post.userId === req.utente.id` oppure `isAdmin` → `sostituisciPost` |
| `PATCH /:id` | Sì + ownership | Stessa logica → `aggiornaPost` |
| `DELETE /:id` | Sì + ownership | Stessa logica → `eliminaPost` |

**Differenza rispetto a utenti:** l'ownership check sui post non può essere in un middleware separato perché deve prima fare una query DB per leggere il `userId` del post.

#### `routes/commenti.js` — CRUD Commenti

Struttura simile, autenticazione richiesta per POST/PUT/PATCH/DELETE.

---

## Cartella `web/` — Frontend

### `index.html` — Markup

La pagina è divisa in sezioni gestite via CSS (classe `.nascosta` = `display: none`):

1. **Header + Nav** — titolo e bottoni di navigazione (Utenti, Post, Commenti, Logout)
2. **Sezione Login** — form email/password, stato autenticazione corrente
3. **Sezione Utenti** — div statistiche, form creazione/modifica, campo ricerca, lista card
4. **Sezione Post** — form creazione, breadcrumb, lista card, controlli paginazione
5. **Sezione Commenti** — form creazione, breadcrumb, lista card

I form usano id univoci (`form-utente`, `form-post`, `form-commento`, `form-login`).

### `stile.css` — Stile

CSS senza framework. Componenti principali:

| Classe/Selettore | Scopo |
|-----------------|-------|
| `:root` | Variabili CSS: colori, raggio bordo, ombra |
| `.contenitore` | Wrapper max-width 800px centrato |
| `.nascosta` | `display: none` — usata per toggle sezioni |
| `.card` | Box bianco con bordo, padding, ombra |
| `.btn-primario` | Bottone blu (Vedi Post, Vedi Commenti) |
| `.btn-secondario` | Bottone giallo (Modifica) |
| `.btn-pericolo` | Bottone rosso (Elimina) |
| `.errore` | Div rosso per messaggi di errore (auto-remove 4s) |
| `.azioni` | Gruppo di bottoni in basso alla card |

### `js/api.js` — Fetch wrapper

**Responsabilità:** chiamate HTTP all'API. Zero DOM, zero stato.

```js
const BASE_URL = "http://localhost:3000/api";

async function chiamataApi(percorso, opzioni = {}) {
    const token = localStorage.getItem("token");
    // Aggiunge automaticamente Authorization: Bearer <token> se presente
    // Esegue fetch, lancia Error se risposta !ok
    // Restituisce JSON
}
```

**Funzioni esportate:**

| Funzione | Metodo | Endpoint |
|----------|--------|----------|
| `login(email, password)` | POST | /auth/login |
| `ottieniUtenti()` | GET | /utenti |
| `creaUtente(dati)` | POST | /utenti |
| `eliminaUtente(id)` | DELETE | /utenti/:id |
| `aggiornaUtente(id, dati)` | PATCH | /utenti/:id |
| `ottieniPost(userId?, pagina, limite)` | GET | /post?pagina=&limite=&userId= |
| `creaPost(dati)` | POST | /post |
| `eliminaPost(id)` | DELETE | /post/:id |
| `ottieniCommenti(postId?)` | GET | /commenti?postId= |
| `creaCommento(dati)` | POST | /commenti |
| `eliminaCommento(id)` | DELETE | /commenti/:id |

### `js/ui.js` — Rendering DOM

**Responsabilità:** costruire HTML a partire dai dati. Zero API calls, zero stato.

Ogni funzione riceve: dati + contenitore DOM + oggetto callbacks. Costruisce le card con `innerHTML` e template literal, poi attacca gli event listener ai bottoni.

| Funzione | Cosa fa |
|----------|---------|
| `mostraUtenti(utenti, contenitore, callbacks, utenteLoggato)` | Card con nome/email/città/sesso/CF/dataNascita/telefono/creatoIl. Bottone "Elimina" visibile solo se `utenteLoggato?.ruolo === "admin"` |
| `mostraPost(post, contenitore, callbacks, utenteLoggato)` | Card con titolo/corpo/creatoIl. Bottone "Elimina" visibile solo se `puoEliminare = p.userId === utenteLoggato?.id \|\| isAdmin` |
| `mostraCommenti(commenti, contenitore, callbacks)` | Card con nome/email/corpo/creatoIl. Bottone "Elimina" sempre visibile |
| `mostraErrore(messaggio, contenitore)` | Div rosso in cima al contenitore, si rimuove dopo 4 secondi |

**Pattern event listener sicuro:**
```js
const btnElimina = card.querySelector('[data-azione="elimina"]');
if (btnElimina) btnElimina.addEventListener("click", () => callbacks.onElimina(id));
```
Il `if (btnElimina)` evita crash se il bottone non è stato renderizzato (utente non admin).

### `js/app.js` — Orchestratore

**Responsabilità:** stato dell'app, navigazione, form handler, drill-down, login/logout.

#### Stato locale

```js
let utenteSelezionato = null;   // utente corrente nel drill-down utenti→post
let postSelezionato = null;     // post corrente nel drill-down post→commenti
let utenteInModifica = null;    // utente in modifica (null = modalità creazione)
let paginaCorrente = 1;         // pagina attiva dei post
const limitePost = 3;           // post per pagina (costante)
```

#### Helper chiave

```js
function getUtenteLoggato() {
    const raw = localStorage.getItem("utente");
    return raw ? JSON.parse(raw) : null;
}
```

Legge l'utente salvato in localStorage dopo il login. Viene passato come 4° argomento a `mostraUtenti` e `mostraPost` per il rendering condizionale dei bottoni.

#### Flusso login

```
Avvio app
  ├── localStorage.getItem("token") presente → mostraApp() → caricaUtenti() + aggiornaStatistiche()
  └── Nessun token → mostraLogin() (mostra sezione login, nasconde tutto il resto)

Submit form-login
  → api.login(email, password)
  → localStorage.setItem("token", token)
  → localStorage.setItem("utente", JSON.stringify(utente))
  → mostraApp() → caricaUtenti()

Click Logout
  → localStorage.removeItem("token")
  → localStorage.removeItem("utente")
  → mostraLogin()
```

#### Flusso drill-down

```
Lista Utenti
  └── Click "Vedi Post" su card utente
        → utenteSelezionato = {id, nome}
        → mostraSezione("post")
        → caricaPost(utente.id)   ← filtra per userId
        → mostra breadcrumb "Utenti → Post di Mario"

Lista Post
  └── Click "Vedi Commenti" su card post
        → postSelezionato = {id, titolo}
        → mostraSezione("commenti")
        → caricaCommenti(post.id)  ← filtra per postId
        → mostra breadcrumb "Post → Commenti di ..."

Click breadcrumb → torna indietro, resetta lo stato di drill-down
```

#### Paginazione post

```
caricaPost(userId?, pagina=1)
  → api.ottieniPost(userId, pagina, 3)
  → risposta: { dati: [...], meta: { pagina, totale, pagine } }
  → ui.mostraPost(dati, ...)
  → aggiornaInterfacciaPaginazione(meta):
       - info-pagina: "Pagina 2 di 9 (25 post)"
       - btn-precedente: disabilitato se pagina === 1
       - btn-successiva: disabilitato se pagina === pagine
```

#### Modifica utente

```
Click "Modifica" su card utente
  → iniziaModificaUtente(utente):
       - pre-compila form con dati utente
       - password input: required=false (facoltativa in PATCH)
       - titolo form: "Modifica Utente"
       - bottone "Annulla" visibile
       - utenteInModifica = utente

Submit form-utente con utenteInModifica !== null
  → legge campi, valida CF
  → se password vuota: non inclusa nel body
  → api.aggiornaUtente(id, dati)  ← PATCH
  → resetFormUtente()

Click "Annulla"
  → resetFormUtente()  ← ripristina modalità creazione
```

#### Statistiche

```js
async function aggiornaStatistiche() {
    const [utenti, post, commenti] = await Promise.all([
        api.ottieniUtenti(),
        api.ottieniPost(),
        api.ottieniCommenti()
    ]);
    // mostra: "X utenti | Y post | Z commenti"
    // post.meta.totale per il conteggio reale
}
```

`Promise.all` esegue le 3 chiamate in **parallelo** invece di 3 chiamate sequenziali.

---

## Flusso completo di una request autenticata

Esempio: l'utente loggato come Mario (admin) elimina un utente.

```
1. Browser: Click "Elimina" su card utente #3
2. app.js: confirm("Sei sicuro?")
3. app.js: api.eliminaUtente(3)
4. api.js: chiamataApi("/utenti/3", { method: "DELETE" })
           → legge token da localStorage
           → fetch("http://localhost:3000/api/utenti/3", {
               method: "DELETE",
               headers: { Authorization: "Bearer eyJ..." }
             })
5. server.js: riceve DELETE /api/utenti/3
6. routes/utenti.js: richiediAutenticazione(req, res, next)
           → jwt.verify(token) → req.utente = { id:1, ruolo:"admin" }
           → next()
7. routes/utenti.js: richiediRuolo("admin")(req, res, next)
           → req.utente.ruolo === "admin" ✓ → next()
8. routes/utenti.js: handler
           → queries/utenti.js: eliminaUtente(3)
           → pool.query("DELETE FROM utenti WHERE id = ?", [3])
           → ON DELETE CASCADE elimina post e commenti di utente 3
9. routes/utenti.js: res.json({ messaggio: "Utente eliminato", utente: {...} })
10. api.js: risposta ok → restituisce JSON
11. app.js: caricaUtenti() → aggiorna lista
           aggiornaStatistiche() → aggiorna contatori
```

---

## Convenzioni del progetto

| Convenzione | Esempio |
|-------------|---------|
| Lingua: italiano | `errore`, `nome`, `corpo`, `creatoIl` |
| Errori: `{ errore: "..." }` | `{ errore: "Post non trovato" }` |
| Success DELETE: `{ messaggio, risorsa }` | `{ messaggio: "Post eliminato", post: {...} }` |
| Status codes | 201 POST ok, 400 validation, 401 no auth, 403 no permission, 404 not found, 500 server error |
| Query SQL: solo `?` placeholder | `WHERE id = ?` con array `[id]` |
| Password: mai in response | SELECT esplicite senza il campo password |
| Token: localStorage | `localStorage.getItem("token")` |
| Moduli ES: `import/export` | `import { trovaUtenti } from "../database/queries/utenti.js"` |

---

## Tecnologie usate

| Layer | Libreria | Versione | Scopo |
|-------|----------|----------|-------|
| Runtime | Node.js | — | JavaScript lato server |
| Framework | Express | 4.21 | Router HTTP + middleware |
| DB driver | mysql2/promise | 3.22 | Pool connessioni async MySQL |
| Password | bcrypt | 6.0 | Hash + confronto password |
| Auth | jsonwebtoken | 9.0 | Crea e verifica JWT |
| CORS | cors | 2.8 | Permette chiamate cross-origin |
| Config | dotenv | 17.4 | Carica `.env` in `process.env` |
| Database | MySQL | 8.0 | Container Docker |
| Admin web | phpMyAdmin | 5 | UI web per MySQL |
| Dev server | serve | 14.2 | HTTP server per i file statici frontend |
