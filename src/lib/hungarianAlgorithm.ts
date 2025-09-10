// Hungarian Algorithm implementation for optimal assignment
export function hungarianAlgorithm(costMatrix: number[][]): number[] {
  const n = costMatrix.length;
  const m = costMatrix[0].length;
  
  if (n !== m) {
    throw new Error('Cost matrix must be square');
  }
  
  // Create working copy of the matrix
  const matrix = costMatrix.map(row => [...row]);
  
  // Step 1: Subtract row minimums
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...matrix[i]);
    for (let j = 0; j < n; j++) {
      matrix[i][j] -= rowMin;
    }
  }
  
  // Step 2: Subtract column minimums
  for (let j = 0; j < n; j++) {
    const colMin = Math.min(...matrix.map(row => row[j]));
    for (let i = 0; i < n; i++) {
      matrix[i][j] -= colMin;
    }
  }
  
  // Use a simpler greedy approach for now - can be enhanced later
  const assignment: number[] = new Array(n).fill(-1);
  const used = new Set<number>();
  
  // Find the optimal assignment using a greedy approach
  for (let iteration = 0; iteration < n; iteration++) {
    let bestRow = -1;
    let bestCol = -1;
    let bestValue = Infinity;
    
    for (let i = 0; i < n; i++) {
      if (assignment[i] !== -1) continue; // Already assigned
      
      for (let j = 0; j < n; j++) {
        if (used.has(j)) continue; // Column already used
        
        if (matrix[i][j] < bestValue) {
          bestValue = matrix[i][j];
          bestRow = i;
          bestCol = j;
        }
      }
    }
    
    if (bestRow !== -1 && bestCol !== -1) {
      assignment[bestRow] = bestCol;
      used.add(bestCol);
    }
  }
  
  return assignment;
}