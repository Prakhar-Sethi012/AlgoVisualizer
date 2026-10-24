/**
 * Theoretical Curve-Fitting Engine
 * 
 * Bridges asymptotic Big-O theory with empirical physical hardware execution.
 * Fits theoretical growth curves: Time ≈ C * f(N)
 * The hardware constant C is derived from the largest sample size (N_max)
 * where CPU measurement jitter and initial noise are minimized.
 */

/**
 * Evaluates theoretical complexity function f(n)
 * @param {number} n - Dataset size
 * @param {string} complexityType - 'n^2', 'nlogn', 'n', 'logn', '1'
 * @returns {number}
 */
export function evaluateTheoreticalFunction(n, complexityType) {
  if (n <= 0) return 0;

  switch (complexityType.toLowerCase()) {
    case 'n^2':
    case 'o(n^2)':
    case 'quadratic':
      return n * n;

    case 'nlogn':
    case 'n_log_n':
    case 'o(nlogn)':
    case 'o(n log n)':
    case 'linearithmic':
      return n * Math.log2(n);

    case 'n':
    case 'o(n)':
    case 'linear':
      return n;

    case 'logn':
    case 'o(logn)':
    case 'logarithmic':
      return Math.log2(n);

    case '1':
    case 'o(1)':
    case 'constant':
      return 1;

    default:
      // Fallback: check if exponent specified like n^3
      if (complexityType.includes('^')) {
        const p = parseFloat(complexityType.split('^')[1]);
        if (!isNaN(p)) return Math.pow(n, p);
      }
      return n * Math.log2(n);
  }
}

/**
 * Generates theoretical curve values based on empirical benchmark samples.
 * 
 * @param {Array<{ size: number, time: number }>} empiricalData - Measured hardware samples
 * @param {string} complexityType - 'n^2', 'nlogn', or 'n'
 * @returns {Array<{ size: number, theoreticalTime: number, constantC: number }>}
 */
export function generateTheoreticalCurve(empiricalData, complexityType) {
  if (!empiricalData || !empiricalData.length) return [];

  // Filter valid data points
  const validPoints = empiricalData.filter(
    (d) => d && typeof d.size === 'number' && typeof d.time === 'number' && d.time >= 0
  );

  if (!validPoints.length) return [];

  // Grab the last data point (largest N, lowest relative measurement noise)
  const maxPoint = validPoints[validPoints.length - 1];
  const maxN = maxPoint.size;
  const maxTime = maxPoint.time;

  const f_maxN = evaluateTheoreticalFunction(maxN, complexityType);

  // Calculate scaling constant C = Time_max / f(N_max)
  const constantC = f_maxN > 0 ? maxTime / f_maxN : 0;

  // Map over empirical sizes to calculate theoretical curve points
  return empiricalData.map((point) => {
    const size = point.size;
    const f_n = evaluateTheoreticalFunction(size, complexityType);
    const theoreticalTime = Number((constantC * f_n).toFixed(3));

    return {
      size,
      time: point.time,
      theoreticalTime,
      constantC
    };
  });
}

/**
 * Enriches multi-algorithm benchmark results with corresponding theoretical curves.
 * 
 * Maps:
 * - bubble => O(n^2)
 * - quick  => O(n log n)
 * - merge  => O(n log n)
 * 
 * @param {Array<Object>} benchmarkResults - [{ size: 1000, bubble: 12.4, quick: 0.5, merge: 0.8 }, ...]
 * @param {string[]} algorithms - ['bubble', 'quick', 'merge']
 * @returns {Array<Object>} Enriched dataset containing [algo + '_theory'] fields
 */
export function enrichDatasetWithTheory(benchmarkResults, algorithms = ['bubble', 'quick', 'merge']) {
  if (!benchmarkResults || !benchmarkResults.length) return [];

  const algoComplexityMap = {
    bubble: 'n^2',
    quick: 'nlogn',
    merge: 'nlogn'
  };

  // Find scaling constant C for each requested algorithm using largest N
  const constants = {};
  const maxRow = benchmarkResults[benchmarkResults.length - 1];
  const maxN = maxRow ? maxRow.size : 0;

  algorithms.forEach((algo) => {
    const complexityType = algoComplexityMap[algo] || 'nlogn';
    const maxTime = maxRow && typeof maxRow[algo] === 'number' ? maxRow[algo] : 0;
    const f_maxN = evaluateTheoreticalFunction(maxN, complexityType);
    constants[algo] = f_maxN > 0 ? maxTime / f_maxN : 0;
  });

  // Return new array with theoretical points attached
  return benchmarkResults.map((row) => {
    const enrichedRow = { ...row };
    const size = row.size;

    algorithms.forEach((algo) => {
      if (typeof row[algo] === 'number') {
        const complexityType = algoComplexityMap[algo] || 'nlogn';
        const f_n = evaluateTheoreticalFunction(size, complexityType);
        const theoryVal = Number((constants[algo] * f_n).toFixed(3));
        enrichedRow[`${algo}_theory`] = theoryVal;
      }
    });

    return enrichedRow;
  });
}
