export type Action =
  | { type: 'swap'; i: number; j: number }
  | { type: 'range'; lo: number; hi: number }
  | { type: 'pointer'; name: 'i' | 'j'; index: number };

export function quicksort(arr: number[]): Action[] {
  const actions: Action[] = [];

  function recordPointer(name: 'i' | 'j', index: number) {
    actions.push({ type: 'pointer', name, index });
  }

  function setRange(lo: number, hi: number) {
    actions.push({ type: 'range', lo, hi });
  }

  function swap(i: number, j: number) {
    if (i === j) return; // avoid self swaps
    [arr[i], arr[j]] = [arr[j], arr[i]];
    actions.push({ type: 'swap', i, j });
  }

  function partition(lo: number, hi: number): number {
    setRange(lo, hi);
    const pivot = arr[hi];
    let i = lo;
    recordPointer('i', i);
    for (let j = lo; j < hi; j++) {
      recordPointer('j', j);
      if (arr[j] < pivot) {
        swap(i, j);
        i++;
        recordPointer('i', i);
      }
    }
    recordPointer('j', hi);
    swap(i, hi);
    return i;
  }

  function qs(lo: number, hi: number) {
    if (lo < hi) {
      const p = partition(lo, hi);
      qs(lo, p - 1);
      qs(p + 1, hi);
    } else if (lo <= hi) {
      setRange(lo, hi);
    }
  }

  qs(0, arr.length - 1);
  setRange(0, -1); // clear highlight
  return actions;
}
