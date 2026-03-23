// pulisco argv dagli argomenti che non mi interessano
const args = process.argv.slice(2);
console.log (args)

// estraggo il primo argomento
const num1 = parseFloat(args[0]);
// estraggo l'operazione
const operazione = args[1];

const num2 = parseFloat(args[2]);

console.log("Hai inserito il numero: ", num1, " con l'operazione ", operazione, " secondo numero: ", num2);

switch (operazione) {
    case '+':
        console.log('Risultato:', num1 + num2);
        break;
    case '-':
        console.log('Risultato:', num1 - num2);
        break;
    case 'x':
        console.log('Risultato:', num1 * num2);
        break;
    case '/':
    if (num2 === 0) {
        console.log('Errore: divisione per zero!');
    } else {
        console.log('Risultato:', num1 / num2);
    }
    break;
        
    default:
        console.log('Operazione non valida');
        break;
}

