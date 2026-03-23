/*

### Esercizio 1 — Calcolatrice da terminale (⭐ facile)

Crea uno script `calcolatrice.js` che prende 3 argomenti da linea di comando: numero1, operazione, numero2.

```bash
node calcolatrice.js 10 + 5      # → Risultato: 15
node calcolatrice.js 20 x 3      # → Risultato: 60
node calcolatrice.js 100 / 4     # → Risultato: 25
node calcolatrice.js 15 - 8      # → Risultato: 7
```

**Suggerimenti:**

- Usa `process.argv.slice(2)` per prendere gli argomenti
- Converti i numeri con `parseFloat()`
- Usa uno `switch` sull'operazione
- Usa `x` per la moltiplicazione (l'asterisco  può creare problemi nel terminale)
- Gestisci la divisione per zero e le operazioni non valide

*/


// process.argv contiene tutti gli argomenti
// [0] = percorso di node
// [1] = percorso dello script
// [2], [3], [4] = i tuoi argomenti

const args = process.argv.slice(2);
console.log(args);

const num1 = parseFloat(args[0]);
const operazione = args[1];
const num2 = parseFloat(args[2]);

let risultato;

switch (operazione) {
    case '+':
        risultato = num1 + num2;
        break;
    case '-':
        risultato = num1 - num2;
        break;
    case 'x':
        risultato = num1 * num2;
        break;
    case '/':
        if (num2 === 0) {
            console.log('Errore: divisione per zero!');
        } else {
            risultato = num1 / num2;
        }
        break;
    default:
        console.log('Operazione non valida');
}

console.log('Risultato:', risultato);
