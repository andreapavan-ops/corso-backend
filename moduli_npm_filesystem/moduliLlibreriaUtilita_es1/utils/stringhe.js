export function capitalizza(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function inverti(str) {
  return str.split("").reverse().join("");
}

export function contaVocali(str) {
  return str.match(/[aeiou]/gi)?.length || 0;
}
