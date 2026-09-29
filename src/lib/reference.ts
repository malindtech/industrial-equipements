export function nextNumericRef(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let max = 1000;
  for (const ref of existing) {
    const m = ref.match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-${year}-${max + 1}`;
}
