import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize stat (0–100 → 0–1)
export const norm = (val: any): number => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : Math.min(Math.max(n / 100, 0), 1);
};

// Pad rectangular matrix into square for Hungarian
export const padCostMatrixToSquare = (m: number[][], bigM = 1e6) => {
  const rows = m.length;
  const cols = m[0]?.length || 0;
  const n = Math.max(rows, cols);
  const mat = m.map((row) => row.concat(Array(n - cols).fill(bigM)));
  for (let r = rows; r < n; r++) {
    mat.push(Array(n).fill(bigM));
  }
  return { matrix: mat, rows, cols, bigM };
};
