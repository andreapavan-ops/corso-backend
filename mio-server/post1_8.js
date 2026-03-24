// post1_8.js — Come leggere il body di una richiesta POST

import http from "node:http";

// Il body di una POST non arriva tutto in una volta, ma a "pezzi" (chunks)
// Questa funzione raccoglie tutti i pezzi e restituisce una Promise con il body completo
function leggiBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        // "data" viene emesso ogni volta che arriva un pezzo di dati
        req.on("data", (chunk) => {
            body += chunk.toString(); // accumula i pezzi in una stringa
        });

        // "end" viene emesso quando tutti i pezzi sono arrivati
        req.on("end", () => {
            resolve(body); // restituisce il body completo
        });

        // "error" in caso di problema durante la ricezione
        req.on("error", (err) => {
            reject(err);
        });
    });
}

const server = http.createServer(async (req, res) => {

    if (req.method === "POST" && req.url === "/dati") {
        // Aspetta che tutto il body sia arrivato
        const body = await leggiBody(req);

        // Il body arriva come stringa JSON, va trasformato in oggetto con JSON.parse
        const dati = JSON.parse(body);

        console.log("Dati ricevuti:", dati);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ messaggio: "Dati ricevuti!", dati }));

    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Usa POST su /dati");
    }
});

server.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
    console.log("Prova con curl:");
    console.log('  curl -X POST http://localhost:3000/dati -H "Content-Type: application/json" -d \'{"nome":"Mario","eta":30}\'');
});


/*
Apri due terminali:

Terminale 1 — avvia il server:


node post1_8.js
Terminale 2 — invia la richiesta POST:


curl -X POST http://localhost:3000/dati -H "Content-Type: application/json" -d '{"nome":"Mario","eta":30}'
curl è uno strumento da terminale che simula una richiesta HTTP — in questo caso fa quello che farebbe un form o un'app che invia dati JSON al server.
*/