import { capitalizza, inverti, contaVocali } from "./utils/stringhe.js";
import { isPari, fattoriale, fibonacci } from "./utils/numeri.js";
import { media, massimo, minimo, unicizzaArray } from "./utils/array.js";

console.log("=== Test Modulo Stringhe ===");
console.log(`capitalizza("buongiorno") → "${capitalizza("buongiorno")}"`);
console.log(`inverti("Andrea") → "${inverti("Andrea")}"`);
console.log(`contaVocali("programmazione") → ${contaVocali("programmazione")}`);

console.log("\n=== Test Modulo Numeri ===");
console.log(`isPari(7) → ${isPari(7)}`);
console.log(`fattoriale(5) → ${fattoriale(5)}`);
console.log(`fibonacci(8) → [${fibonacci(8).join(", ")}]`);

console.log("\n=== Test Modulo Array ===");
const arr = [4, 8, 15, 16, 23, 42];
console.log(`media([${arr}]) → ${media(arr)}`);
console.log(`massimo([${arr}]) → ${massimo(arr)}`);
console.log(`minimo([${arr}]) → ${minimo(arr)}`);
const dup = [1, 2, 2, 3, 3, 3];
console.log(`unicizzaArray([${dup}]) → [${unicizzaArray(dup).join(", ")}]`);
