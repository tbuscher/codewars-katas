export type Action =
  | { type: 'swap'; i: number; j: number }
  | { type: 'level'; lo: number; hi: number; level: number }
  | { type: 'pointer'; name: 'i' | 'j' | 'p'; index: number; level: number }
  | { type: 'prepare'; pivot: number }
  | { type: 'collapse'; level: number };

export function quicksort(arr: number[]): Action[] {
  const actions: Action[] = [];
  let maxLevel = 0;

  function recordPointer(name: 'i' | 'j' | 'p', index: number, level: number) {
    actions.push({ type: 'pointer', name, index, level });
  }

  function setLevel(lo: number, hi: number, level: number) {
    if (hi < lo) return;
    if (level > maxLevel) maxLevel = level;
    actions.push({ type: 'level', lo, hi, level });
  }

  function swap(i: number, j: number) {
    if (i === j) return; // avoid self swaps
    [arr[i], arr[j]] = [arr[j], arr[i]];
    actions.push({ type: 'swap', i, j });
  }

  function partition(lo: number, hi: number, level: number): number {
    const pivot = arr[hi];
    recordPointer('p', hi, level);
    let i = lo;
    recordPointer('i', i, level);
    for (let j = lo; j < hi; j++) {
      recordPointer('j', j, level);
      if (arr[j] < pivot) {
        swap(i, j);
        i++;
        recordPointer('i', i, level);
      }
    }
    recordPointer('j', hi, level);
    swap(i, hi);
    recordPointer('p', i, level);
    return i;
  }

  function qs(lo: number, hi: number, level: number) {
    if (lo > hi) return;
    setLevel(lo, hi, level);
    if (lo < hi) {
      const p = partition(lo, hi, level);
      actions.push({ type: 'prepare', pivot: p });
      qs(lo, p - 1, level + 1);
      actions.push({ type: 'prepare', pivot: p });
      qs(p + 1, hi, level + 1);
    }
  }

  qs(0, arr.length - 1, 0);
  for (let l = maxLevel; l >= 1; l--) {
    actions.push({ type: 'collapse', level: l });
  }
  return actions;
}
