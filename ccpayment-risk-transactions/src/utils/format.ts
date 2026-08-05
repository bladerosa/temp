/** 从 `+ 13.988156 POL` 这类展示串里拆出数值与单位。 */
export function parseAmount(str: string): { n: number; unit: string } {
  const m = String(str).match(/([\d.]+)\s+(\S+)$/);
  return m ? { n: parseFloat(m[1]), unit: m[2] } : { n: 0, unit: '' };
}

/** 去掉浮点累加产生的尾数噪声（最多 8 位小数）。 */
export const trimNumber = (n: number) => parseFloat(n.toFixed(8)).toString();

/** 金额小计展示用，最多 6 位小数。 */
export const formatAmount = (n: number) => parseFloat(n.toFixed(6)).toString();

/** 去掉展示串前缀的 `+ ` / `- ` 符号。 */
export const stripSign = (str: string) => str.replace(/^[+-]\s/, '');

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
