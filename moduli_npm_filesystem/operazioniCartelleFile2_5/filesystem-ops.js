// filesystem-ops.js — Operazioni comuni sul filesystem

import fs from "node:fs/promises";
import path from "node:path";

// Creare una cartella
await fs.mkdir("output/reports", { recursive: true });
// recursive: true crea anche le cartelle intermedie (come mkdir -p)
console.log("Cartella creata");

// Creare una cartella chiamata "esempio"
await fs.mkdir("esempio", { recursive: true });
console.log("Cartella 'esempio' creata");


// Verificare se un file/cartella esiste
try {
    await fs.access("output");
    console.log("La cartella 'output' esiste");
} catch {
    console.log("La cartella 'output' non esiste");
}

// Elencare i file in una cartella
const files = await fs.readdir(".");
console.log("\nFile nella cartella corrente:");
for (const file of files) {
    const stats = await fs.stat(file);
    const tipo = stats.isDirectory() ? "📁" : "📄";
    const dimensione = stats.isDirectory() ? "" : ` (${stats.size} bytes)`;
    console.log(`  ${tipo} ${file}${dimensione}`);
}

// Copiare un file
await fs.writeFile("output/originale.txt", "Contenuto originale");
await fs.copyFile("output/originale.txt", "output/copia.txt");
console.log("\nFile copiato");

// Rinominare/spostare un file
await fs.rename("output/copia.txt", "output/rinominato.txt");
console.log("File rinominato");

// Eliminare un file
await fs.unlink("output/rinominato.txt");
console.log("File eliminato");

// Eliminare una cartella (deve essere vuota, o usare { recursive: true })
await fs.rm("output", { recursive: true });
console.log("Cartella eliminata con tutto il contenuto");