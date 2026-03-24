// router.js — Un server con più route

import http from "node:http";

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const percorso = url.pathname;
    const metodo = req.method;

    // === HOME PAGE ===
    if (metodo === "GET" && percorso === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Il mio server</title></head>
            <body>
                <h1>Benvenuto nel mio server Node.js!</h1>
                <p>Prova queste route:</p>
                <ul>
                    <li><a href="/about">Chi siamo</a></li>
                    <li><a href="/api/saluto?nome=Mario">API saluto</a></li>
                    <li><a href="/api/ora">API ora</a></li>
                </ul>
            </body>
            </html>
        `);
    }

    // === PAGINA ABOUT ===
    else if (metodo === "GET" && percorso === "/about") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
            <h1>Chi siamo</h1>
            <p>Questo server è stato creato con Node.js puro, senza framework.</p>
            <a href="/">← Torna alla home</a>
        `);
    }

    // === API: SALUTO ===
    else if (metodo === "GET" && percorso === "/api/saluto") {
        const nome = url.searchParams.get("nome") || "Mondo";
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            messaggio: `Ciao, ${nome}!`,
            timestamp: new Date().toISOString()
        }));
    }

    // === API: ORA CORRENTE ===
    else if (metodo === "GET" && percorso === "/api/ora") {
        const adesso = new Date();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            data: adesso.toLocaleDateString("it-IT"),
            ora: adesso.toLocaleTimeString("it-IT"),
            timestamp: adesso.toISOString()
        }));
    }

    // === 404: ROUTE NON TROVATA ===
    else {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
            <h1>404 — Pagina non trovata</h1>
            <p>Il percorso <code>${percorso}</code> non esiste.</p>
            <a href="/">← Torna alla home</a>
        `);
    }
});

server.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
});