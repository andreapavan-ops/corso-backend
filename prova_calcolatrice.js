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

/*

MA QUINDI quando gli dico: node prova_calcolatrice.js 10 / 0
args0 è 10 args 1 è / e args 2 è 0 ...GIUSTO???
Esatto! Perfetto.


node prova_calcolatrice.js 10 / 0
                           ↑   ↑  ↑
                         args[0] args[1] args[2]
args[0] = '10' → parseFloat lo converte in numero 10
args[1] = '/' → rimane stringa, usata nello switch
args[2] = '0' → parseFloat lo converte in numero 0
Hai capito tutto!

*/

