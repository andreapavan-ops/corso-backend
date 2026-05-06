// js/app.js — Modulo principale
//
// Importa api.js e ui.js, gestisce navigazione, form e drill-down.

import * as api from "./api.js";
import * as ui from "./ui.js";

// ============================================================
// Stato drill-down
// ============================================================

let utenteSelezionato = null;   // { id, nome }
let postSelezionato = null;     // { id, titolo }
let utenteInModifica = null;   // utente da modificare, null = modalità creazione
let paginaCorrente = 1;
const limitePost = 3;

// ============================================================
// Utente loggato
// ============================================================

function getUtenteLoggato() {
    const raw = localStorage.getItem("utente");
    return raw ? JSON.parse(raw) : null;
}


// ============================================================
// Riferimenti DOM
// ============================================================

const sezioni = {
    utenti: document.getElementById("sezione-utenti"),
    post: document.getElementById("sezione-post"),
    commenti: document.getElementById("sezione-commenti"),
};

const navBottoni = {
    utenti: document.getElementById("nav-utenti"),
    post: document.getElementById("nav-post"),
    commenti: document.getElementById("nav-commenti"),
};

const liste = {
    utenti: document.getElementById("lista-utenti"),
    post: document.getElementById("lista-post"),
    commenti: document.getElementById("lista-commenti"),
};

const breadcrumbs = {
    post: document.getElementById("breadcrumb-post"),
    commenti: document.getElementById("breadcrumb-commenti"),
};

const titoli = {
    post: document.getElementById("titolo-post"),
    commenti: document.getElementById("titolo-commenti"),
};

// ============================================================
// Navigazione
// ============================================================

function mostraSezione(nome) {
    for (const [chiave, sezione] of Object.entries(sezioni)) {
        sezione.classList.toggle("nascosta", chiave !== nome);
        navBottoni[chiave].classList.toggle("attivo", chiave === nome);
    }
}

navBottoni.utenti.addEventListener("click", async () => {
    utenteSelezionato = null;
    mostraSezione("utenti");
    await caricaUtenti();
});

navBottoni.post.addEventListener("click", async () => {
    utenteSelezionato = null;
    breadcrumbs.post.innerHTML = "";
    titoli.post.textContent = "Post";
    document.getElementById("post-userId").value = "";
    mostraSezione("post");
    await caricaPost();
});

navBottoni.commenti.addEventListener("click", async () => {
    postSelezionato = null;
    breadcrumbs.commenti.innerHTML = "";
    titoli.commenti.textContent = "Commenti";
    document.getElementById("commento-postId").value = "";
    mostraSezione("commenti");
    await caricaCommenti();
});

// ============================================================
// Caricamento dati
// ============================================================

async function caricaUtenti() {
    try {
        const utenti = await api.ottieniUtenti();
ui.mostraUtenti(utenti, liste.utenti, {
    onVediPost: vediPostDiUtente,
    onModifica: iniziaModificaUtente,
    onElimina: eliminaUtente,
});
    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
}

async function caricaPost(userId, pagina = 1) {
    try {
        const risultato = await api.ottieniPost(userId, pagina, limitePost);
        ui.mostraPost(risultato.dati, liste.post, {
            onVediCommenti: vediCommentiDiPost,
            onElimina: eliminaPost,
        });
        // Mostra paginazione solo nella vista "tutti i post" (senza filtro utente)
        const panelloPaginazione = document.getElementById("paginazione-post");
        if (!userId) {
            aggiornaInterfacciaPaginazione(risultato.meta);
            panelloPaginazione.style.display = "";
        } else {
            panelloPaginazione.style.display = "none";
        }
        paginaCorrente = risultato.meta.pagina;
    } catch (err) {
        ui.mostraErrore(err.message, liste.post);
    }
}

function aggiornaInterfacciaPaginazione(meta) {
    document.getElementById("info-pagina").textContent = `Pagina ${meta.pagina} di ${meta.pagine}`;
    document.getElementById("btn-precedente").disabled = meta.pagina <= 1;
    document.getElementById("btn-successiva").disabled = meta.pagina >= meta.pagine;
}

async function caricaCommenti(postId) {
    try {
        const commenti = await api.ottieniCommenti(postId);
        ui.mostraCommenti(commenti, liste.commenti, {
            onElimina: eliminaCommento,
        });
    } catch (err) {
        ui.mostraErrore(err.message, liste.commenti);
    }
}

async function aggiornaStatistiche() {
    // Promise.all esegue le 3 chiamate IN PARALLELO — più veloce che farle una alla volta
    const [utenti, post, commenti] = await Promise.all([
        api.ottieniUtenti(),
        api.ottieniPost(),
        api.ottieniCommenti()
    ]);
    // post è ora { dati, meta } — il totale reale è in meta.totale
    document.getElementById("statistiche").textContent =
        `Utenti: ${utenti.length} | Post: ${post.meta.totale} | Commenti: ${commenti.length}`;
}


// ============================================================
// Drill-down
// ============================================================

async function vediPostDiUtente(utente) {
    utenteSelezionato = { id: utente.id, nome: utente.nome };
    titoli.post.textContent = `Post di ${utente.nome}`;
    breadcrumbs.post.innerHTML = `<a id="torna-utenti">Utenti</a> &rarr; Post di ${utente.nome}`;
    document.getElementById("post-userId").value = utente.id;

    document.getElementById("torna-utenti").addEventListener("click", async () => {
        utenteSelezionato = null;
        mostraSezione("utenti");
        await caricaUtenti();
    });

    mostraSezione("post");
    await caricaPost(utente.id);
}

async function vediCommentiDiPost(post) {
    postSelezionato = { id: post.id, titolo: post.titolo };
    titoli.commenti.textContent = `Commenti al post: ${post.titolo}`;
    breadcrumbs.commenti.innerHTML = `<a id="torna-post">Post</a> &rarr; Commenti`;
    document.getElementById("commento-postId").value = post.id;

    document.getElementById("torna-post").addEventListener("click", async () => {
        postSelezionato = null;
        mostraSezione("post");
        if (utenteSelezionato) {
            await caricaPost(utenteSelezionato.id);
        } else {
            breadcrumbs.post.innerHTML = "";
            titoli.post.textContent = "Post";
            await caricaPost();
        }
    });

    mostraSezione("commenti");
    await caricaCommenti(post.id);
}

// ============================================================
// Modifica utente
// ============================================================

function iniziaModificaUtente(utente) {
    utenteInModifica = utente;

    // Pre-compila il form con i dati dell'utente
    document.getElementById("utente-nome").value = utente.nome;
    document.getElementById("utente-email").value = utente.email;
    document.getElementById("utente-citta").value = utente.citta || "";
    document.getElementById("utente-sesso").value = utente.sesso || "";
    document.getElementById("utente-cf").value = utente.codiceFiscale || "";
    document.getElementById("utente-dataNascita").value = utente.dataNascita ? utente.dataNascita.slice(0, 10) : "";
    document.getElementById("utente-telefono").value = utente.telefono || "";

    // Password opzionale in modifica (non si può pre-compilare per sicurezza)
    document.getElementById("utente-password").required = false;

    // Cambia titolo e mostra bottone Annulla
    document.getElementById("titolo-form-utente").textContent = "Modifica Utente";
    document.getElementById("annulla-modifica").style.display = "";
}

function resetFormUtente() {
    utenteInModifica = null;
    document.getElementById("form-utente").reset();
    document.getElementById("utente-password").required = true;
    document.getElementById("titolo-form-utente").textContent = "Nuovo Utente";
    document.getElementById("annulla-modifica").style.display = "none";
}


// ============================================================
// Eliminazione
// ============================================================

async function eliminaUtente(id) {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
    try {
        await api.eliminaUtente(id);
        await caricaUtenti();
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
}

async function eliminaPost(id) {
    if (!confirm("Sei sicuro di voler eliminare questo post?")) return;
    try {
        await api.eliminaPost(id);
        await caricaPost(utenteSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.post);
    }
}

async function eliminaCommento(id) {
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
    try {
        await api.eliminaCommento(id);
        await caricaCommenti(postSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.commenti);
    }
}

// ============================================================
// Form — Creazione
// ============================================================

document.getElementById("form-utente").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("utente-nome").value.trim();
    const email = document.getElementById("utente-email").value.trim();
    const citta = document.getElementById("utente-citta").value.trim();
    const sesso = document.getElementById("utente-sesso").value;
    const codiceFiscale = document.getElementById("utente-cf").value.trim();
    const dataNascita = document.getElementById("utente-dataNascita").value;
    const telefono = document.getElementById("utente-telefono").value.trim();
    const password = document.getElementById("utente-password").value;



    // ============================================================
    // Validazione Codice Fiscale
    // ============================================================
    // Il CF italiano ha sempre questa struttura:
    //   6 lettere (cognome + nome) + 2 cifre (anno) + 1 lettera (mese)
    //   + 2 cifre (giorno) + 1 lettera + 3 cifre (comune) + 1 lettera (controllo)
    // La regex verifica SOLO il formato, non la correttezza matematica.
    // toUpperCase() rende il controllo case-insensitive: "rssmra..." diventa "RSSMRA..."
    const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    // CF è obbligatorio (required nell'HTML) quindi è sempre valorizzato qui
    if (!regexCF.test(codiceFiscale.toUpperCase())) {
        // ui.mostraErrore mostra il messaggio per 4 secondi poi lo rimuove
        // "return" blocca l'esecuzione: il fetch NON viene inviato
        ui.mostraErrore("Codice fiscale non valido (formato: RSSMRA80A01H501A)", liste.utenti);
        return;
    }
    try {
        if (utenteInModifica) {
            const dati = { nome, email, citta, sesso, codiceFiscale, dataNascita, telefono };
            if (password) dati.password = password;
            await api.aggiornaUtente(utenteInModifica.id, dati);
            resetFormUtente();
        } else {
            await api.creaUtente({ nome, email, citta, sesso, codiceFiscale, dataNascita, telefono, password });
            e.target.reset();
        }
        await caricaUtenti();
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
});

document.getElementById("form-post").addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = parseInt(document.getElementById("post-userId").value);
    const titolo = document.getElementById("post-titolo").value.trim();
    const corpo = document.getElementById("post-corpo").value.trim();

    try {
        await api.creaPost({ userId, titolo, corpo });
        e.target.reset();
        // Mantieni il userId pre-compilato se in drill-down
        if (utenteSelezionato) {
            document.getElementById("post-userId").value = utenteSelezionato.id;
        }
        await caricaPost(utenteSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
});

document.getElementById("form-commento").addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = parseInt(document.getElementById("commento-postId").value);
    const nome = document.getElementById("commento-nome").value.trim();
    const email = document.getElementById("commento-email").value.trim();
    const corpo = document.getElementById("commento-corpo").value.trim();

    try {
        await api.creaCommento({ postId, nome, email, corpo });
        e.target.reset();
        // Mantieni il postId pre-compilato se in drill-down
        if (postSelezionato) {
            document.getElementById("commento-postId").value = postSelezionato.id;
        }
        await caricaCommenti(postSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.commenti);
    }
});

// ============================================================
// Avvio — Carica la lista utenti all'apertura
// ============================================================

// ============================================================
// Filtro ricerca utenti
// ============================================================
// Ascolta ogni tasto che l'utente digita nel campo ricerca.
// Non fa fetch all'API — filtra le card già presenti nel DOM.

document.getElementById("ricerca-utenti").addEventListener("input", (e) => {
    const testo = e.target.value.toLowerCase(); // testo digitato in minuscolo

    // querySelectorAll seleziona TUTTE le card utente nella lista
    const cards = document.querySelectorAll("#lista-utenti .card");

    cards.forEach(card => {
        const contenuto = card.textContent.toLowerCase(); // tutto il testo della card
        // se il testo digitato è contenuto nella card → mostra, altrimenti nascondi
        card.style.display = contenuto.includes(testo) ? "" : "none";
    });
});

document.getElementById("annulla-modifica").addEventListener("click", () => {
    resetFormUtente();
});

document.getElementById("btn-precedente").addEventListener("click", () => {
    if (paginaCorrente > 1) caricaPost(undefined, paginaCorrente - 1);
});

document.getElementById("btn-successiva").addEventListener("click", () => {
    caricaPost(undefined, paginaCorrente + 1);
});

// ============================================================
// Autenticazione — login / logout
// ============================================================

function aggiornaStatoLogin() {
    const utente = JSON.parse(localStorage.getItem("utente") || "null");
    document.getElementById("stato-login").textContent = utente
        ? `Loggato come ${utente.nome}`
        : "Non sei autenticato";
}

function mostraApp() {
    document.getElementById("sezione-login").classList.add("nascosta");
    aggiornaStatoLogin();
}

function mostraLogin() {
    document.getElementById("sezione-login").classList.remove("nascosta");
    for (const sezione of Object.values(sezioni)) {
        sezione.classList.add("nascosta");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("utente");
    document.getElementById("form-login").reset();
    aggiornaStatoLogin();
    mostraLogin();
}

document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    try {
        const { token, utente } = await api.login(email, password);
        localStorage.setItem("token", token);
        localStorage.setItem("utente", JSON.stringify(utente));
        mostraApp();
        mostraSezione("utenti");
        await caricaUtenti();
        await aggiornaStatistiche();
    } catch (errore) {
        document.getElementById("stato-login").textContent = `Errore: ${errore.message}`;
    }
});

document.getElementById("nav-log").addEventListener("click", logout);

// ============================================================
// Avvio — controlla se già autenticato
// ============================================================

if (localStorage.getItem("token")) {
    mostraApp();
    mostraSezione("utenti");
    aggiornaStatistiche();
    caricaUtenti();
} else {
    mostraLogin();
}
