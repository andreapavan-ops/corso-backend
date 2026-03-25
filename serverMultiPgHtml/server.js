import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const pagine = {
  "/": "home.html",
  "/chi-siamo": "chi_siamo.html",
  "/contatti": "contatti.html",
};


const server = http.createServer((req, res) => {
  const percorso = req.url;

  if (percorso === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

    if (percorso === "/style.css") {
    fs.readFile(path.join(__dirname, "style.css"), "utf8", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
      res.end(data);
    });
    return;
  }

  console.log(`${req.method} ${percorso}`);

  const file = pagine[percorso] || "404.html";
  const statusCode = pagine[percorso] ? 200 : 404;

  fs.readFile(path.join(__dirname, file), "utf8", (err, data) => {
    res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
    res.end(data);
  });

});

server.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
