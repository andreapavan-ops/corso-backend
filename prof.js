// pulisco argv dagli argomenti che non mi interessano
const args = process.argv.slice(2);
// estraggo il primo argomento
const num1 = args[0]
// estraggo l'operazione
const operazione = parseFloat(args[1])

const num2 = args[2]

console.log("Hai inserito il numero: ", num1, " con l'operazione ", operazione, " secondo numero: ", num2);

switch (operazione) {
    case "+":
        console.log("addizione");
    break;
    default:
        console.log("Nessun operazione selezionata")
    break;

    
}