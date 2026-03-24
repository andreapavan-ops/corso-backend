// json-crud.js — Leggere, modificare, salvare JSON
import chalk from 'chalk';


import fs from "node:fs/promises";

const FILE_PATH = "studenti.json";

// Funzione per leggere il file JSON
async function leggiStudenti() {
    try {
        const dati = await fs.readFile(FILE_PATH, "utf-8");
        return JSON.parse(dati);
    } catch (errore) {
        // Se il file non esiste, ritorna un array vuoto
        if (errore.code === "ENOENT") {
            return [];
        }
        throw errore;
    }
}

// Funzione per salvare nel file JSON
async function salvaStudenti(studenti) {
    // JSON.stringify con null e 2 per formattazione leggibile
    await fs.writeFile(FILE_PATH, JSON.stringify(studenti, null, 2));
}

// Funzione per aggiungere uno studente
async function aggiungi(nome, voto) {
    const studenti = await leggiStudenti();

    const nuovoStudente = {
        id: studenti.length > 0 ? Math.max(...studenti.map(s => s.id)) + 1 : 1,
        nome,
        voto: parseFloat(voto),
        data: new Date().toISOString()
    };

    studenti.push(nuovoStudente);
    await salvaStudenti(studenti);
    console.log(chalk.green(`Aggiunto: ${nome} (voto: ${voto})`));
}

// Funzione per elencare gli studenti
async function lista() {
    const studenti = await leggiStudenti();

    if (studenti.length === 0) {
        console.log(chalk.yellow("Nessuno studente registrato."));
        return;
    }

    console.table(studenti);
}

// Funzione per cercare
async function cerca(query) {
    const studenti = await leggiStudenti();
    const risultati = studenti.filter(s =>
        s.nome.toLowerCase().includes(query.toLowerCase())
    );

    if (risultati.length === 0) {
        console.log(chalk.yellow(`Nessun risultato per "${query}"`));
    } else {
        console.log(chalk.green(`${risultati.length} risultato/i per "${query}":`));;
        console.table(risultati);
    }
}

// Funzione per rimuovere
async function rimuovi(id) {
    const studenti = await leggiStudenti();
    const indice = studenti.findIndex(s => s.id === parseInt(id));

    if (indice === -1) {
        console.log(chalk.red(`Studente con id ${id} non trovato.`));
        return;
    }

    const rimosso = studenti.splice(indice, 1)[0];
    await salvaStudenti(studenti);
    console.log(chalk.green(`Rimosso: ${rimosso.nome}`));
}

// Router dei comandi
const [comando, ...args] = process.argv.slice(2);

switch (comando) {
    case "aggiungi":
        await aggiungi(args[0], args[1]);
        break;
    case "lista":
        await lista();
        break;
    case "cerca":
        await cerca(args[0]);
        break;
    case "rimuovi":
        await rimuovi(args[0]);
        break;
    default:
        console.log(chalk.bold("Comandi disponibili:"));
        console.log("  node json-crud.js aggiungi <nome> <voto>");
        console.log("  node json-crud.js lista");
        console.log("  node json-crud.js cerca <query>");
        console.log("  node json-crud.js rimuovi <id>");
}