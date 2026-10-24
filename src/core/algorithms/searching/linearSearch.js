/**
 * Linear Search Generator
 * Steps sequentially through the array comparing each element to the target.
 * 
 * @param {number[]} array
 * @param {number} target
 * @yields {{ array: number[], currentIndex: number, comparing: number[], target: number, foundIndex: number, found: boolean, comparisons: number, stepInfo: string }}
 */
export function* linearSearch(array, target) {
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0;

  yield {
    array: [...arr],
    currentIndex: -1,
    comparing: [],
    target,
    foundIndex: -1,
    found: false,
    comparisons: 0,
    stepInfo: `Ready to linear scan for target value ${target}.`
  };

  for (let i = 0; i < n; i++) {
    comparisons++;

    // Yield current inspection step
    yield {
      array: [...arr],
      currentIndex: i,
      comparing: [i],
      target,
      foundIndex: -1,
      found: false,
      comparisons,
      stepInfo: `Checking index ${i} (value: ${arr[i]}). Does ${arr[i]} === ${target}?`
    };

    if (arr[i] === target) {
      yield {
        array: [...arr],
        currentIndex: i,
        comparing: [i],
        target,
        foundIndex: i,
        found: true,
        comparisons,
        sortedIndices: [i],
        stepInfo: `Target ${target} found at index ${i} after ${comparisons} checks!`
      };
      return;
    }
  }

  yield {
    array: [...arr],
    currentIndex: -1,
    comparing: [],
    target,
    foundIndex: -1,
    found: false,
    comparisons,
    stepInfo: `Target ${target} was not found in the array after checking all ${n} elements.`
  };
}
