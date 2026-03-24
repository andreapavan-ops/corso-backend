// parsing-url.js

import http from "node:http";

const server = http.createServer((req, res) => {
    // Costruiamo un oggetto URL completo
    // (req.url contiene solo il percorso, dobbiamo aggiungere un host fittizio)
    const url = new URL(req.url, `http://${req.headers.host}`);

    console.log("Percorso:", url.pathname);         // /api/utenti
    console.log("Query string:", url.search);       // ?page=2&limit=10
    console.log("Parametro 'page':", url.searchParams.get("page"));     // "2"
    console.log("Parametro 'limit':", url.searchParams.get("limit"));   // "10"

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
        percorso: url.pathname,
        parametri: Object.fromEntries(url.searchParams)
    }));
});

server.listen(3000, () => {
    console.log("Server su http://localhost:3000");
    console.log("Prova: http://localhost:3000/api/utenti?page=2&limit=10");
});