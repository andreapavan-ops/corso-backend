export function isPari(n) {
  return n % 2 === 0;
}

export function fattoriale(n) {
  if (n <= 1) return 1;
  return n * fattoriale(n - 1);
}

export function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, n);
}
