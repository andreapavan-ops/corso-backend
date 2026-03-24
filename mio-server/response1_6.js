// response1_6.js — Come costruire una risposta HTTP con res

import http from "node:http";

const server = http.createServer((req, res) => {

    if (req.url === "/json") {
        // --- Esempio 1: risposta JSON con headers personalizzati ---

        // writeHead imposta il codice di stato e gli header della risposta
        // Va chiamato PRIMA di res.write() o res.end()
        res.writeHead(200, {
            "Content-Type": "application/json",   // Dice al client che arriva JSON
            "X-Powered-By": "Il Mio Server",      // Header personalizzato (X- = custom)
            "Cache-Control": "no-cache"            // Dice al browser di non cacheare
        });

        // res.write() invia il corpo a pezzi (streaming)
        // Si può chiamare più volte prima di res.end()
        res.write('{ "messaggio": "Prima parte..." }');
        res.write('{ "extra": "Seconda parte..." }');

        // res.end() chiude la connessione — OBBLIGATORIO
        res.end();

    } else {
        // --- Esempio 2: risposta testuale in una volta sola ---

        // writeHead + end in sequenza: il modo più comune e compatto
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Tutta la risposta in una volta");
    }
});

server.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
    console.log("Prova:");
    console.log("  http://localhost:3000/       → risposta testuale");
    console.log("  http://localhost:3000/json   → risposta JSON con headers custom");
});
