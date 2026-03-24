// nativoVsExpress1_11.js — Confronto tra HTTP nativo e Express
// Questo file è solo didattico — NON è eseguibile

// ============================================================
// HTTP NATIVO (quello che abbiamo usato finora)
// ============================================================

import http from "node:http";

const server = http.createServer(async (req, res) => {
    // Dobbiamo analizzare l'URL manualmente ogni volta
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Dobbiamo controllare sia il metodo che il pathname con if/else
    if (req.method === "GET" && url.pathname === "/api/utenti") {
        // Dobbiamo impostare il Content-Type manualmente
        res.writeHead(200, { "Content-Type": "application/json" });
        // Dobbiamo convertire l'oggetto in stringa JSON manualmente
        res.end(JSON.stringify(utenti));
    }
    else if (req.method === "POST" && url.pathname === "/api/utenti") {
        // Dobbiamo leggere il body pezzo per pezzo (chunks) manualmente
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            // Dobbiamo parsare il JSON manualmente
            const dati = JSON.parse(body);
            // validare, salvare, rispondere...
        });
    }
    // Con molte route il codice diventa una lunga catena di if/else...
    else {
        // Dobbiamo gestire il 404 manualmente
        res.writeHead(404);
        res.end("Not found");
    }
});


// ============================================================
// EXPRESS (framework che semplifica tutto il lavoro sopra)
// ============================================================

import express from "express";
const app = express();

// Un solo middleware che gestisce automaticamente il parsing del body JSON
// per TUTTE le route — con http nativo andava fatto ogni volta a mano
app.use(express.json());

// Le route sono separate e leggibili: app.get(), app.post(), app.put(), app.delete()
// Non serve più controllare req.method manualmente
app.get("/api/utenti", (req, res) => {
    // res.json() imposta Content-Type e fa JSON.stringify automaticamente
    res.json(utenti);
});

app.post("/api/utenti", (req, res) => {
    // req.body è già un oggetto JavaScript — niente chunks, niente JSON.parse
    const dati = req.body;
    // validare, salvare, rispondere...
});

// Express gestisce automaticamente il 404 per le route non definite
