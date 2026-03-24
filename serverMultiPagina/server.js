import http from "http";

const PORT = 3000;

function paginaHTML(titolo, contenuto) {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titolo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #f5f5f5; color: #333; }
    nav {
      background: #2c3e50;
      padding: 1rem 2rem;
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    nav a {
      color: #ecf0f1;
      text-decoration: none;
      font-weight: bold;
      padding: 0.3rem 0.7rem;
      border-radius: 4px;
      transition: background 0.2s;
    }
    nav a:hover { background: #3d5166; }
    nav .brand { font-size: 1.2rem; margin-right: auto; color: #fff; }
    main {
      max-width: 800px;
      margin: 3rem auto;
      padding: 2rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { margin-bottom: 1rem; color: #2c3e50; }
    p { line-height: 1.6; margin-bottom: 0.8rem; }
    a.btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1.2rem;
      background: #2c3e50;
      color: #fff;
      border-radius: 4px;
      text-decoration: none;
    }
    a.btn:hover { background: #3d5166; }
    .info-row { margin: 0.5rem 0; }
    .info-row span { font-weight: bold; }
  </style>
</head>
<body>
  <nav>
    <span class="brand">Il Mio Sito</span>
    <a href="/">Home</a>
    <a href="/chi-siamo">Chi siamo</a>
    <a href="/contatti">Contatti</a>
  </nav>
  <main>
    ${contenuto}
  </main>
</body>
</html>`;
}

const pagine = {
  "/": paginaHTML(
    "Home",
    `<h1>Benvenuto nel Mio Sito</h1>
    <p>Questo è un mini sito web creato con Node.js puro, senza framework.</p>
    <p>Naviga tra le pagine usando il menu in alto per scoprire di più su di noi.</p>
    <a class="btn" href="/chi-siamo">Scopri chi siamo →</a>`
  ),

  "/chi-siamo": paginaHTML(
    "Chi siamo",
    `<h1>Chi siamo</h1>
    <p>Siamo un piccolo team appassionato di sviluppo web e tecnologie open source.</p>
    <p>Lavoriamo ogni giorno per creare soluzioni semplici a problemi complessi.</p>
    <p>Questo sito è un esempio didattico realizzato durante il corso ITS Backend.</p>
    <a class="btn" href="/">← Torna alla Home</a>`
  ),

  "/contatti": paginaHTML(
    "Contatti",
    `<h1>Contatti</h1>
    <p>Puoi raggiungerci attraverso i seguenti recapiti:</p>
    <p class="info-row"><span>Email:</span> info@miosito.it</p>
    <p class="info-row"><span>Telefono:</span> +39 02 1234567</p>
    <p class="info-row"><span>Indirizzo:</span> Via Roma 42, 20100 Milano</p>
    <a class="btn" href="/">← Torna alla Home</a>`
  ),
};

const pagina404 = paginaHTML(
  "404 - Pagina non trovata",
  `<h1>404 — Pagina non trovata</h1>
  <p>La pagina che stai cercando non esiste o è stata spostata.</p>
  <a class="btn" href="/">← Torna alla Home</a>`
);

const server = http.createServer((req, res) => {
  const percorso = req.url;

  if (percorso === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(`${req.method} ${percorso}`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (pagine[percorso]) {
    res.writeHead(200);
    res.end(pagine[percorso]);
  } else {
    res.writeHead(404);
    res.end(pagina404);
  }
});

server.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
