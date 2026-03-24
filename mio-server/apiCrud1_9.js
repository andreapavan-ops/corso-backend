// api-server.js — Server API RESTful con Node.js puro

import http from "node:http";

// ============================================================
// "Database" in memoria
// ============================================================

// Array che simula un database — i dati esistono solo finché il server è acceso
let utenti = [
    { id: 1, nome: "Mario Rossi", email: "mario@email.com" },
    { id: 2, nome: "Luigi Verdi", email: "luigi@email.com" },
    { id: 3, nome: "Peach Bianchi", email: "peach@email.com" }
];

// Contatore per assegnare ID univoci ai nuovi utenti
let prossimoId = 4;

// ============================================================
// Helper: leggere il body JSON della richiesta
// ============================================================

// Il body di una POST/PUT arriva a "pezzi" (chunks) — questa funzione
// li raccoglie tutti e li trasforma in un oggetto JavaScript
function leggiBodyJSON(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        // Ogni volta che arriva un pezzo di dati, lo aggiunge alla stringa
        req.on("data", (chunk) => { body += chunk.toString(); });

        // Quando tutti i pezzi sono arrivati, parsa il JSON
        // Se body è vuoto (es. GET senza body) restituisce un oggetto vuoto {}
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(new Error("JSON non valido"));
            }
        });

        // In caso di errore durante la ricezione
        req.on("error", reject);
    });
}

// ============================================================
// Helper: inviare una risposta JSON
// ============================================================

// Funzione riutilizzabile per rispondere sempre in JSON
// statusCode: il codice HTTP (200, 201, 404, 500...)
// dati: l'oggetto JavaScript da inviare come JSON
function rispondiJSON(res, statusCode, dati) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  // CORS: permette chiamate da qualsiasi dominio (utile per test)
    });
    // JSON.stringify converte l'oggetto in stringa JSON
    // null, 2 = formattazione leggibile con 2 spazi di indentazione
    res.end(JSON.stringify(dati, null, 2));
}

// ============================================================
// Helper: estrarre l'ID dal percorso (/api/utenti/3 → 3)
// ============================================================

// Divide il percorso per "/" e prende l'ultimo segmento come numero
// Es: "/api/utenti/3" → ["", "api", "utenti", "3"] → parseInt("3") → 3
// Se l'ultimo segmento non è un numero (es. "/api/utenti") restituisce null
function estraiId(percorso) {
    const parti = percorso.split("/");
    const ultimo = parti[parti.length - 1];
    const id = parseInt(ultimo);
    return isNaN(id) ? null : id;
}

// ============================================================
// Il server
// ============================================================

const server = http.createServer(async (req, res) => {
    // Usa la classe URL per analizzare l'URL in modo sicuro
    const url = new URL(req.url, `http://${req.headers.host}`);
    const percorso = url.pathname; // solo il percorso, senza query string
    const metodo = req.method;     // GET, POST, PUT, DELETE...

    // Log di ogni richiesta in arrivo
    console.log(`${metodo} ${percorso}`);

    try {
        // === GET /api/utenti → Lista tutti gli utenti ===
        if (metodo === "GET" && percorso === "/api/utenti") {
            rispondiJSON(res, 200, utenti);
        }

        // === GET /api/utenti/:id → Un singolo utente ===
        else if (metodo === "GET" && percorso.startsWith("/api/utenti/")) {
            const id = estraiId(percorso);
            // find() cerca il primo elemento che soddisfa la condizione
            const utente = utenti.find(u => u.id === id);

            if (utente) {
                rispondiJSON(res, 200, utente);
            } else {
                rispondiJSON(res, 404, { errore: `Utente con id ${id} non trovato` });
            }
        }

        // === POST /api/utenti → Crea un nuovo utente ===
        else if (metodo === "POST" && percorso === "/api/utenti") {
            const dati = await leggiBodyJSON(req);

            // Validazione: nome e email sono obbligatori
            if (!dati.nome || !dati.email) {
                rispondiJSON(res, 400, {
                    errore: "I campi 'nome' e 'email' sono obbligatori"
                });
                return;
            }

            // Crea il nuovo utente con ID incrementale
            const nuovoUtente = {
                id: prossimoId++,
                nome: dati.nome,
                email: dati.email
            };

            utenti.push(nuovoUtente);
            rispondiJSON(res, 201, nuovoUtente); // 201 = Created
        }

        // === PUT /api/utenti/:id → Aggiorna un utente ===
        else if (metodo === "PUT" && percorso.startsWith("/api/utenti/")) {
            const id = estraiId(percorso);
            // findIndex() restituisce la posizione nell'array (-1 se non trovato)
            const indice = utenti.findIndex(u => u.id === id);

            if (indice === -1) {
                rispondiJSON(res, 404, { errore: `Utente con id ${id} non trovato` });
                return;
            }

            const dati = await leggiBodyJSON(req);

            if (!dati.nome || !dati.email) {
                rispondiJSON(res, 400, {
                    errore: "I campi 'nome' e 'email' sono obbligatori"
                });
                return;
            }

            // Spread operator: copia l'utente esistente e sovrascrive nome ed email
            utenti[indice] = { ...utenti[indice], nome: dati.nome, email: dati.email };
            rispondiJSON(res, 200, utenti[indice]);
        }

        // === DELETE /api/utenti/:id → Elimina un utente ===
        else if (metodo === "DELETE" && percorso.startsWith("/api/utenti/")) {
            const id = estraiId(percorso);
            const indice = utenti.findIndex(u => u.id === id);

            if (indice === -1) {
                rispondiJSON(res, 404, { errore: `Utente con id ${id} non trovato` });
                return;
            }

            // splice(indice, 1) rimuove 1 elemento alla posizione indice e lo restituisce
            const rimosso = utenti.splice(indice, 1)[0];
            rispondiJSON(res, 200, { messaggio: `Utente "${rimosso.nome}" eliminato` });
        }

        // === Gestione CORS preflight (OPTIONS) ===
        // Il browser invia una richiesta OPTIONS prima di una POST/PUT cross-origin
        // per verificare che il server la accetti
        else if (metodo === "OPTIONS") {
            res.writeHead(204, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            });
            res.end();
        }

        // === 404: Route non trovata ===
        else {
            rispondiJSON(res, 404, {
                errore: "Route non trovata",
                route: `${metodo} ${percorso}`
            });
        }

    } catch (errore) {
        // === 500: Errore interno del server ===
        // Cattura qualsiasi errore non gestito nelle operazioni sopra
        console.error("Errore:", errore.message);
        rispondiJSON(res, 500, { errore: "Errore interno del server" });
    }
});

server.listen(3000, () => {
    console.log("API Server in ascolto su http://localhost:3000");
    console.log("\nEndpoint disponibili:");
    console.log("  GET    /api/utenti        → Lista utenti");
    console.log("  GET    /api/utenti/:id    → Singolo utente");
    console.log("  POST   /api/utenti        → Crea utente");
    console.log("  PUT    /api/utenti/:id    → Aggiorna utente");
    console.log("  DELETE /api/utenti/:id    → Elimina utente");
});
