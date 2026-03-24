// server.js — Il server più semplice del mondo

import http from "node:http";

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Ciao dal server!");
});

server.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
});

/*
(per abilitare gli import)
Poiché nel tuo codice usi import invece del vecchio require, Node.js deve sapere che stai usando i moduli moderni. Hai due opzioni:

Opzione A (Consigliata): Crea un file chiamato package.json nella stessa cartella e scrivici dentro:
{
  "type": "module"
}
*/