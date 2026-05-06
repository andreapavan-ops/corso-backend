const API_URL = "http://localhost:3000";

// Riferimenti agli elementi HTML
const listaUtenti    = document.getElementById("lista-utenti");
const listaPost      = document.getElementById("lista-post");
const titoloPost     = document.getElementById("titolo-post");
const listaCommenti  = document.getElementById("lista-commenti");
const titoloCommenti = document.getElementById("titolo-commenti");

// Tiene traccia della riga selezionata in ciascuna colonna
let rigaUtenteAttiva = null;
let rigaPostAttiva   = null;

function mostraErrore(messaggio) {
    const divErrore = document.getElementById ("errore")
    if (divErrore) {
        divErrore.textContent = messaggio
    }

}


async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (errore) {
    mostraErrore("Impossibile connettersi al server. Avvia il backend!");
    return null;
    }
}




// ============================================================
// Livello 1 — Carica e mostra la lista degli utenti
// ============================================================

// Non possiamo usare await fuori da una funzione async,
// quindi avvolgiamo il codice iniziale in una funzione e la chiamiamo subito
async function init() {
    const data = await fetchJSON(`${API_URL}/api/utenti`);
    if (!data) return;

    data.forEach(utente => {
        const div = document.createElement("div");
        div.className = "riga";
        div.innerHTML = `
            <div class="nome">${utente.nome}</div>
            <div class="dettaglio">${utente.citta}</div>
            <div class="azione">
                <a href="utente.html?id=${utente.id}">Dettaglio &rarr;</a>
            </div>
        `;

        const btnElimina = document.createElement("button");
        btnElimina.innerText = "🗑️";
        btnElimina.classList.add("btn-delete");

        btnElimina.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
            const response = await fetch(`${API_URL}/api/utenti/${utente.id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                div.remove();
            } else {
                mostraErrore("Errore durante l'eliminazione.");
            }
        });

        div.querySelector(".azione").appendChild(btnElimina);

        const btnModifica = document.createElement("button");
        btnModifica.innerText = "✏️";
        btnModifica.classList.add("btn-edit");

        btnModifica.addEventListener("click", async (e) => {
            e.stopPropagation();

            const divNome  = div.querySelector(".nome");
            const divCitta = div.querySelector(".dettaglio");

            // Modalità MODIFICA — mostra gli input
            if (btnModifica.innerText === "✏️") {
                const inputNome  = document.createElement("input");
                inputNome.value  = divNome.textContent;
                const inputCitta = document.createElement("input");
                inputCitta.value = divCitta.textContent;

                divNome.innerHTML  = "";
                divNome.appendChild(inputNome);
                divCitta.innerHTML = "";
                divCitta.appendChild(inputCitta);

                btnModifica.innerText = "💾";

            // Modalità SALVA — invia al server
            } else {
                const nuovoNome  = divNome.querySelector("input").value;
                const nuovaCitta = divCitta.querySelector("input").value;

                const response = await fetch(`${API_URL}/api/utenti/${utente.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome: nuovoNome, citta: nuovaCitta })
                });

                if (response.ok) {
                    divNome.textContent  = nuovoNome;
                    divCitta.textContent = nuovaCitta;
                    btnModifica.innerText = "✏️";
                } else {
                    mostraErrore("Errore durante la modifica.");
                }
            }
        });

        div.querySelector(".azione").appendChild(btnModifica);


        div.addEventListener("click", () => {
            if (rigaUtenteAttiva) rigaUtenteAttiva.classList.remove("attivo");
            div.classList.add("attivo");
            rigaUtenteAttiva = div;

            caricaPost(utente.id, utente.nome);
        });
        listaUtenti.appendChild(div);
    });
}

// ============================================================
// Livello 2 — Carica e mostra i post di un utente
// ============================================================

async function caricaPost(userId, nomeUtente) {
    titoloPost.textContent = `Post di ${nomeUtente}`;
    listaPost.innerHTML = "";

    // Resettiamo la colonna commenti
    titoloCommenti.textContent = "Commenti";
    listaCommenti.innerHTML = `<p class="placeholder">Seleziona un post</p>`;
    rigaPostAttiva = null;

    const data = await fetchJSON(`${API_URL}/api/post?userId=${userId}`);
    if (!data) return;

    data.forEach(post => {
        const div = document.createElement("div");
        div.className = "riga";
        div.innerHTML = `<div class="nome">${post.titolo}</div>`;
        div.addEventListener("click", () => {
            if (rigaPostAttiva) rigaPostAttiva.classList.remove("attivo");
            div.classList.add("attivo");
            rigaPostAttiva = div;

            caricaCommenti(post.id);
        });
        listaPost.appendChild(div);
    });
}

// ============================================================
// Livello 3 — Carica e mostra i commenti di un post
// ============================================================

async function caricaCommenti(postId) {
    titoloCommenti.textContent = "Commenti";
    listaCommenti.innerHTML = "";

    const data = await fetchJSON(`${API_URL}/api/commenti?postId=${postId}`);
    if (!data) return;

    data.forEach(commento => {
        const div = document.createElement("div");
        div.className = "riga";
        div.innerHTML = `
            <div class="autore">${commento.nome}</div>
            <div class="testo">${commento.corpo}</div>
        `;
        listaCommenti.appendChild(div);
    });
}

// Avviamo l'app
init();

document.getElementById("btn-aggiungi").addEventListener("click", aggiungiUtente);


async function aggiungiUtente() {
    // leggi i valori dagli input
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const citta = document.getElementById('citta').value;

    if (!nome || !email) {
    mostraErrore("Nome e email sono obbligatori!");
    return;
}


    // console.log per verificare
    console.log("Dati recuperati dagli input:");
    console.log("Nome:", nome);
    console.log("Email:", email);
    console.log("Città:", citta);


    const res = await fetch(`${API_URL}/api/utenti`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, citta })
});

    if (res.ok) {
        console.log("Utente salvato!");
        listaUtenti.innerHTML = "";
        await init();
        document.getElementById("nome").value = "";
        document.getElementById("email").value = "";
        document.getElementById("citta").value = "";
    } else {
        const errore = await res.json();
        mostraErrore(errore.errore);
    }



}
