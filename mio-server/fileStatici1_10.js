// static-server.js — Servire file statici da una cartella

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mappa delle estensioni ai Content-Type
const MIME_TYPES = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "application/javascript",
    ".json": "application/json",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
    ".ico":  "image/x-icon"
};

const server = http.createServer(async (req, res) => {
    // Solo richieste GET
    if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Metodo non permesso");
        return;
    }

    // Costruire il percorso del file
    let filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url);

    try {
        const contenuto = await fs.readFile(filePath);
        const estensione = path.extname(filePath);
        const contentType = MIME_TYPES[estensione] || "application/octet-stream";

        res.writeHead(200, { "Content-Type": contentType });
        res.end(contenuto);
    } catch (errore) {
        if (errore.code === "ENOENT") {
            res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            res.end("<h1>404 — File non trovato</h1>");
        } else {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Errore interno del server");
        }
    }
});

server.listen(3000, () => {
    console.log("File server su http://localhost:3000");
    console.log("Serve i file dalla cartella 'public/'");
});

/*
Una cosa però: questo server serve file dalla cartella public/ — che deve esistere con almeno un index.html dentro, altrimenti ottieni 404.

Creati tre file in public/: index.html, style.css, script.js. Così puoi vedere che il server serve correttamente tutti e tre i tipi di file (HTML, CSS, JS).

Avvia con node fileStatici1_10.js e vai su http://localhost:3000
*/