export function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}

export function roundTo(num: number, precision: number) {
  const scale = 10 ** precision;
  return Math.round((num + Number.EPSILON) * scale) / scale;
}
