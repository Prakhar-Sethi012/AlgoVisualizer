/**
 * Master Theorem Solver for Divide-and-Conquer Recurrences
 * 
 * Evaluates recurrences of the form:
 * T(n) = a * T(n / b) + O(n^d)
 * 
 * Case 1: log_b(a) > d  =>  O(n^(log_b(a)))   (Leaves Dominate)
 * Case 2: log_b(a) == d =>  O(n^d * log n)    (Balanced Work Across Levels)
 * Case 3: log_b(a) < d  =>  O(n^d)            (Root Dominates)
 */

export function solveRecurrence(inputString) {
  if (!inputString || typeof inputString !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a valid recurrence relation string (e.g., T(n) = 2T(n/2) + O(n)).'
    };
  }

  // Normalize input: strip out T(n) = or t(n) = and outer whitespace
  let clean = inputString.trim();
  clean = clean.replace(/^[Tt]\s*\(\s*[Nn]\s*\)\s*=\s*/, '');

  // 1. Regex to extract: a * T(n / b)
  // Matches: 2T(n/2), T(n/2), 4 * T(n/4), 8T(n/2)
  const recursiveRegex = /([0-9]*\.?[0-9]*)\s*\*?\s*[Tt]\s*\(\s*[Nn]\s*[\/÷]\s*([0-9]+(?:\.[0-9]+)?)\s*\)/i;
  const matchRecursive = clean.match(recursiveRegex);

  if (!matchRecursive) {
    return {
      isValid: false,
      error: 'Could not parse recursive term. Expected form: aT(n/b) (e.g., 2T(n/2)).'
    };
  }

  // Parse a (default 1 if empty)
  const aRaw = matchRecursive[1].trim();
  const a = aRaw === '' ? 1 : parseFloat(aRaw);

  // Parse b
  const b = parseFloat(matchRecursive[2]);

  if (isNaN(a) || a < 1) {
    return {
      isValid: false,
      error: `Invalid value for 'a' (${a}). In Master Theorem, 'a' must be >= 1 (number of subproblems).`
    };
  }

  if (isNaN(b) || b <= 1) {
    return {
      isValid: false,
      error: `Invalid value for 'b' (${b}). In Master Theorem, 'b' must be > 1 (subproblem divisor).`
    };
  }

  // 2. Extract non-recursive work term f(n)
  // Remainder of the string after the recursive term
  const afterRecursive = clean.substring(matchRecursive.index + matchRecursive[0].length).trim();
  const workTerm = afterRecursive.replace(/^[+]\s*/, '').trim();

  let d = 1; // default to O(n)
  let logPower = 0; // for O(n^d log^k n) if present

  if (!workTerm || workTerm === '0') {
    d = 0;
  } else {
    // Check for O(1) or constant numbers
    if (/^(?:[Oo]\s*\(\s*1\s*\)|1|[Cc](?:onst)?)$/i.test(workTerm)) {
      d = 0;
    }
    // Check for O(n^k) or n^k
    else if (/[Nn]\s*\^\s*([0-9]+(?:\.[0-9]+)?)/i.test(workTerm)) {
      const expMatch = workTerm.match(/[Nn]\s*\^\s*([0-9]+(?:\.[0-9]+)?)/i);
      d = parseFloat(expMatch[1]);
    }
    // Check for plain n, O(n)
    else if (/[Nn]/i.test(workTerm)) {
      d = 1;
    } else {
      // Numerical constant fallback
      const num = parseFloat(workTerm);
      if (!isNaN(num)) {
        d = 0;
      }
    }

    // Check if log n is in work term
    if (/log/i.test(workTerm)) {
      logPower = 1;
    }
  }

  // 3. Mathematical Calculations
  const logb_a = Math.log(a) / Math.log(b);
  const roundedLogb_a = Math.round(logb_a * 1000) / 1000;
  const isLogExactInt = Math.abs(logb_a - Math.round(logb_a)) < 1e-6;
  const logDisplay = isLogExactInt ? Math.round(logb_a).toString() : roundedLogb_a.toFixed(2);

  const epsilon = 1e-6;
  const diff = logb_a - d;

  let caseNumber = 2;
  let complexity = '';
  let complexityFormatted = '';
  let interpretation = '';
  let explanation = '';
  let beginnerExplanation = '';

  // Case 1: log_b(a) > d  =>  O(n^(log_b a))
  if (diff > epsilon) {
    caseNumber = 1;
    if (isLogExactInt) {
      const exp = Math.round(logb_a);
      complexity = exp === 1 ? 'O(n)' : exp === 0 ? 'O(1)' : `O(n^${exp})`;
      complexityFormatted = exp === 1 ? 'O(n)' : exp === 0 ? 'O(1)' : `O(n<sup>${exp}</sup>)`;
    } else {
      complexity = `O(n^${logDisplay})`;
      complexityFormatted = `O(n<sup>${logDisplay}</sup>) [O(n<sup>log_${b}(${a})</sup>)]`;
    }
    interpretation = 'Leaves Dominate (Bottom-heavy)';
    beginnerExplanation = 'The problem multiplies so fast that most of the work happens at the very bottom of the tree. Think of it like a pyramid scheme: the people at the bottom are doing all the heavy lifting.';
    explanation = `Since log_${b}(${a}) ≈ ${logDisplay} is strictly greater than d (${d}), the subproblem leaves dominate the computation cost. By Case 1 of the Master Theorem, the overall runtime is determined by the total number of leaves: T(n) = Θ(n^(log_${b}(${a}))) = ${complexity}.`;
  }
  // Case 2: log_b(a) == d  =>  O(n^d * log n)
  else if (Math.abs(diff) <= epsilon) {
    caseNumber = 2;
    if (d === 0) {
      complexity = 'O(log n)';
      complexityFormatted = 'O(log n)';
    } else if (d === 1) {
      complexity = 'O(n log n)';
      complexityFormatted = 'O(n log n)';
    } else {
      complexity = `O(n^${d} log n)`;
      complexityFormatted = `O(n<sup>${d}</sup> log n)`;
    }
    interpretation = 'Balanced Work (Equal work across all tree levels)';
    beginnerExplanation = 'Cutting the problem in half saves you time, but having to solve both halves cancels out the savings. The work is perfectly balanced across every step, so we just multiply the work per step by the number of steps.';
    explanation = `Since log_${b}(${a}) ≈ ${logDisplay} equals d (${d}), the non-recursive work performed at every level of the recursion tree is identical (each level costs Θ(n^${d})). Since there are log_${b}(n) levels in the tree, by Case 2 of the Master Theorem: T(n) = Θ(n^${d} log n) = ${complexity}.`;
  }
  // Case 3: log_b(a) < d  =>  O(n^d)
  else {
    caseNumber = 3;
    if (d === 0) {
      complexity = 'O(1)';
      complexityFormatted = 'O(1)';
    } else if (d === 1) {
      complexity = 'O(n)';
      complexityFormatted = 'O(n)';
    } else {
      complexity = `O(n^${d})`;
      complexityFormatted = `O(n<sup>${d}</sup>)`;
    }
    interpretation = 'Root Dominates (Top-heavy)';
    beginnerExplanation = 'The problem shrinks so quickly that the very first step takes the most effort. Think of it like chopping down a tree: the first cut is massive, but chopping the branches gets easier and easier.';
    explanation = `Since log_${b}(${a}) ≈ ${logDisplay} is strictly less than d (${d}), the root node division/combination cost dwarfs the work done in subproblems. By Case 3 of the Master Theorem, the top-level work dominates: T(n) = Θ(n^${d}) = ${complexity}.`;
  }

  // 4. Generate Recursion Tree Structure Breakdown
  const levelRatio = a / Math.pow(b, d);
  const recursionTree = [
    {
      level: 0,
      nodes: '1',
      subproblemSize: 'n',
      workPerNode: d === 0 ? 'c' : d === 1 ? 'c · n' : `c · n^${d}`,
      totalLevelWork: d === 0 ? 'c' : d === 1 ? 'c · n' : `c · n^${d}`
    },
    {
      level: 1,
      nodes: `${a}`,
      subproblemSize: `n/${b}`,
      workPerNode: d === 0 ? 'c' : d === 1 ? `c · (n/${b})` : `c · (n/${b})^${d}`,
      totalLevelWork: `${levelRatio === 1 ? 'c · n^' + d : (levelRatio).toFixed(2) + ' · c · n^' + d}`
    },
    {
      level: 2,
      nodes: `${a * a}`,
      subproblemSize: `n/${b * b}`,
      workPerNode: d === 0 ? 'c' : d === 1 ? `c · (n/${b * b})` : `c · (n/${b * b})^${d}`,
      totalLevelWork: `${levelRatio === 1 ? 'c · n^' + d : (levelRatio * levelRatio).toFixed(2) + ' · c · n^' + d}`
    },
    {
      level: 'k = log_' + b + '(n)',
      nodes: `a^(log_${b} n) = n^${logDisplay}`,
      subproblemSize: '1 (Base Case)',
      workPerNode: 'Θ(1)',
      totalLevelWork: `Θ(n^${logDisplay}) leaf work`
    }
  ];

  return {
    isValid: true,
    input: inputString,
    a,
    b,
    d,
    logb_a: roundedLogb_a,
    logb_a_display: logDisplay,
    caseNumber,
    caseName: `Case ${caseNumber}`,
    complexity,
    complexityFormatted,
    interpretation,
    beginnerExplanation,
    explanation,
    levelRatio: Number(levelRatio.toFixed(3)),
    recursionTree
  };
}
