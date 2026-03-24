import fs from "node:fs/promises";

const FILE = "rubrica.json";

async function leggi() {
    try {
        const dati = await fs.readFile(FILE, "utf-8");
        return JSON.parse(dati);
    } catch {
        return [];
    }
}

async function salva(contatti) {
    await fs.writeFile(FILE, JSON.stringify(contatti, null, 2));
}

const args = process.argv.slice(2);
const comando = args[0];

if (comando === "aggiungi") {
    const contatti = await leggi();
    const nuovoContatto = {
        id: Date.now(),
        nome: args[1],
        email: args[2],
        telefono: args[3],
        dataCreazione: new Date().toISOString()
    };
    contatti.push(nuovoContatto);
    await salva(contatti);
    console.log("Contatto aggiunto:", nuovoContatto.nome);
} else if (comando === "lista") {
    const contatti = await leggi();
    if (contatti.length === 0) {
        console.log("Rubrica vuota.");
    } else {
        console.table(contatti);
    }
} else if (comando === "cerca") {
    const contatti = await leggi();
    const query = args[1].toLowerCase();
    const risultati = contatti.filter(c =>
        JSON.stringify(c).toLowerCase().includes(query)
    );
    if (risultati.length === 0) {
        console.log("Nessun contatto trovato.");
    } else {
        console.table(risultati);
    }
} else if (comando === "modifica") {
    const contatti = await leggi();
    const id = parseInt(args[1]);
    const campo = args[2];
    const valore = args[3];
    const contatto = contatti.find(c => c.id === id);
    if (!contatto) {
        console.log("Contatto non trovato.");
    } else {
        contatto[campo] = valore;
        await salva(contatti);
        console.log("Contatto aggiornato:", contatto.nome);
    }
} else if (comando === "rimuovi") {
    const contatti = await leggi();
    const id = parseInt(args[1]);
    const nuovi = contatti.filter(c => c.id !== id);
    if (nuovi.length === contatti.length) {
        console.log("Contatto non trovato.");
    } else {
        await salva(nuovi);
        console.log("Contatto rimosso.");
    }
}

