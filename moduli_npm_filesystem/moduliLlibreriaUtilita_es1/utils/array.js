export function media(arr) {
  return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

export function massimo(arr) {
  return Math.max(...arr);
}

export function minimo(arr) {
  return Math.min(...arr);
}

export function unicizzaArray(arr) {
  return [...new Set(arr)];
}
