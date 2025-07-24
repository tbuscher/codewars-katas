export interface SwapAction {
  i: number;
  j: number;
}

export function quicksort(arr: number[]): SwapAction[] {
  const actions: SwapAction[] = [];
  function swap(i: number, j: number) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    actions.push({ i, j });
  }
  function partition(lo: number, hi: number): number {
    const pivot = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (arr[j] < pivot) {
        swap(i, j);
        i++;
      }
    }
    swap(i, hi);
    return i;
  }
  function qs(lo: number, hi: number) {
    if (lo < hi) {
      const p = partition(lo, hi);
      qs(lo, p - 1);
      qs(p + 1, hi);
    }
  }
  qs(0, arr.length - 1);
  return actions;
}
