// tipi.js — JavaScript è JavaScript, ovunque giri

// Tipi primitivi
const nome = "Mario";          // string
const eta = 25;                 // number
const attivo = true;            // boolean
const niente = null;            // null
const nonDefinito = undefined;  // undefined

// Array
const linguaggi = ["Python", "Java", "JavaScript"];
const filtrati = linguaggi.filter(l => l.length > 4);
console.log("Linguaggi con più di 4 lettere:", filtrati);

// Oggetti
const studente = {
    nome: "Mario",
    eta: 25,
    linguaggi: ["Python", "Java"],
    saluta() {
        return `Ciao, sono ${this.nome}!`;
    }
};
console.log(studente.saluta());

// Destrutturazione
const { nome: n, eta: e } = studente;
console.log(`${n} ha ${e} anni`);

// Spread operator
const tuttiLinguaggi = [...studente.linguaggi, "JavaScript", "C#"];
console.log("Tutti:", tuttiLinguaggi);

// Map, filter, reduce
const numeri = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pariRaddoppiati = numeri
    .filter(n => n % 2 === 0)
    .map(n => n * 2);
console.log("Pari raddoppiati:", pariRaddoppiati);

const somma = numeri.reduce((acc, n) => acc + n, 0);
console.log("Somma:", somma);