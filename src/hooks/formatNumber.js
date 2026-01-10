// Simple number formatter: 1234 -> 1.2K, 1000000 -> 1M, 10000000 -> 10M
export default function formatNumber(value) {
  if (value === null || value === undefined) return '';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);

  const finx = Math.abs(n);
  if (finx >= 1.0e9) {
    return `${+(n / 1.0e9).toFixed(finx % 1.0e9 === 0 ? 0 : 1)} B`;
  }
  if (finx >= 1.0e6) {
    return `${+(n / 1.0e6).toFixed(finx % 1.0e6 === 0 ? 0 : 1)} M`;
  }
  if (finx >= 1.0e3) {
    return `${+(n / 1.0e3).toFixed(finx % 1.0e3 === 0 ? 0 : 1)} K`;
  }
  return String(n);
}
