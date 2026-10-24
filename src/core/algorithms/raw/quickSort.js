/**
 * Raw, Hyper-Optimized Quick Sort for Benchmarking
 * In-place divide-and-conquer using Lomuto partition with recursion.
 * 
 * @param {number[]} arr
 * @returns {number[]}
 */
export function rawQuickSort(arr) {
  function sort(low, high) {
    if (low >= high) return;

    // Median-of-three pivot selection to prevent worst-case O(n^2) on sorted data
    const mid = (low + high) >> 1;
    if (arr[mid] < arr[low]) {
      const t = arr[low]; arr[low] = arr[mid]; arr[mid] = t;
    }
    if (arr[high] < arr[low]) {
      const t = arr[low]; arr[low] = arr[high]; arr[high] = t;
    }
    if (arr[high] < arr[mid]) {
      const t = arr[mid]; arr[mid] = arr[high]; arr[high] = t;
    }

    // Place median pivot at high - 1
    const t = arr[mid]; arr[mid] = arr[high - 1]; arr[high - 1] = t;
    const pivot = arr[high - 1];

    if (high - low <= 2) return;

    let i = low;
    let j = high - 1;

    while (true) {
      while (arr[++i] < pivot) {}
      while (arr[--j] > pivot) {}
      if (i >= j) break;
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    const temp = arr[i];
    arr[i] = arr[high - 1];
    arr[high - 1] = temp;

    sort(low, i - 1);
    sort(i + 1, high);
  }

  if (arr.length <= 1) return arr;
  sort(0, arr.length - 1);
  return arr;
}
