// ispeziona-request.js — Cosa contiene req

// Importa il modulo HTTP built-in di Node.js (prefisso "node:" = modulo nativo, non pacchetto esterno)
import http from "node:http";

// Crea il server: la callback viene eseguita ad ogni richiesta in arrivo
// req = oggetto con tutto ciò che il client ha inviato
// res = oggetto con cui il server costruisce e invia la risposta
const server = http.createServer((req, res) => {
    console.log("--- Nuova richiesta ---");

    // req.method → il verbo HTTP usato dal client (GET, POST, PUT, DELETE...)
    console.log("Metodo:", req.method);

    // req.url → percorso richiesto, inclusa eventuale query string (es. /api/utenti?page=2)
    console.log("URL:", req.url);

    // req.headers → oggetto con tutti gli header HTTP della richiesta
    // (contiene info come tipo browser, lingua accettata, ecc.)
    console.log("Headers:", req.headers);

    // Accesso diretto a un header specifico tramite chiave stringa
    console.log("User-Agent:", req.headers["user-agent"]);

    // Invia l'intestazione della risposta: codice di stato 200 (OK) e tipo di contenuto
    // Va chiamato PRIMA di res.end()
    res.writeHead(200, { "Content-Type": "text/plain" });

    // Chiude la risposta e invia il corpo al client
    // Template literal per inserire dinamicamente metodo e URL
    res.end(`Hai fatto una ${req.method} su ${req.url}`);
});

// Avvia il server sulla porta 3000
// La callback viene eseguita una sola volta, quando il server è pronto ad ascoltare
server.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
    console.log("Prova a visitare:");
    console.log("  http://localhost:3000/");
    console.log("  http://localhost:3000/api/utenti");
    console.log("  http://localhost:3000/pagina?id=42");
});
