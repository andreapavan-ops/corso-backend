// Modulo nativo di Node.js per creare il server HTTP
import http from "http";
// fs (file system): permette di leggere e scrivere file sul disco
import fs from "fs";
// path: costruisce percorsi di file in modo compatibile con tutti i sistemi operativi
import path from "path";
// fileURLToPath: converte l'URL del file corrente in un percorso di cartella
// (necessario con ES modules perché __dirname non esiste di default)
import { fileURLToPath } from "url";

// __dirname = percorso assoluto della cartella dove si trova questo file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// Mappa le rotte URL ai file HTML corrispondenti
const pagine = {
  "/": "home.html",
  "/chi-siamo": "chi_siamo.html",
  "/contatti": "contatti.html",
};

// Creiamo il server: per ogni richiesta viene eseguita questa funzione
const server = http.createServer((req, res) => {
  const percorso = req.url;

  // Il browser richiede automaticamente il favicon: rispondiamo 204 (No Content)
  // per evitare che finisca nella logica delle pagine
  if (percorso === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Gestiamo la richiesta del file CSS separatamente
  // perché ha un Content-Type diverso (text/css invece di text/html)
  if (percorso === "/style.css") {
    fs.readFile(path.join(__dirname, "style.css"), "utf8", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  console.log(`${req.method} ${percorso}`);

  // Se la rotta esiste nella mappa, usiamo il file corrispondente
  // altrimenti serviamo la pagina 404
  const file = pagine[percorso] || "404.html";
  const statusCode = pagine[percorso] ? 200 : 404;

  // Leggiamo il file HTML dal disco e lo inviamo come risposta
  // path.join costruisce il percorso assoluto: __dirname + nome file
  fs.readFile(path.join(__dirname, file), "utf8", (err, data) => {
    res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  });

});

// Avviamo il server sulla porta specificata
server.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
