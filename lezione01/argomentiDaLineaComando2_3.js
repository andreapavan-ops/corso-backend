// argomenti.js — Leggere argomenti dalla linea di comando

// process.argv è un array:
// [0] = percorso dell'eseguibile node
// [1] = percorso dello script
// [2+] = argomenti passati dall'utente

const args = process.argv.slice(2); // Prendi solo gli argomenti utente

if (args.length === 0) {
    console.log("Uso: node argomenti.js <nome> [età]");
    console.log("Esempio: node argomenti.js Mario 25");
    process.exit(1); // Esci con codice di errore
}

const nome = args[0];
const eta = args[1] || "sconosciuta";

console.log(`Ciao ${nome}! Hai ${eta} anni.`);