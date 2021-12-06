/**
 * get number from pct string
 */
export function getPctNum(str: string) {
  const exp = /([0-9]+)%/gi.exec(str);
  if (exp && exp[1]) {
    return Number.parseInt(exp[1]) || 0;
  }
  return 0;
}
