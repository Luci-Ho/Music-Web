/**
 * formatTimes
 * Convert seconds (or milliseconds) into a D:H:M:S string like `D:0 H:0 M:03 S:05`.
 *
 * @param {number|string} input - time value in seconds (default) or milliseconds when unit='ms'
 * @param {{unit?: 's'|'ms'}} options
 * @returns {string} formatted string `D:<days> H:<hours> M:<minutes> S:<seconds>`
 */
export default function formatTimes(input = 0, { unit = 's' } = {}) {
  let totalSeconds = Number(input) || 0;
  if (unit === 'ms') totalSeconds = Math.floor(totalSeconds / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const two = (n) => (n < 10 ? `0${n}` : `${n}`);

  return `D:${days} H:${hours} M:${two(minutes)} S:${two(seconds)}`;
}

export { formatTimes };
