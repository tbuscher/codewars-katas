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
    const pivotIndex = lo;
    const pivot = arr[pivotIndex];
    recordPointer('p', pivotIndex, level);
    let i = lo + 1;
    let j = hi;
    recordPointer('i', i, level);
    recordPointer('j', j, level);

    while (true) {
      while (i <= hi && arr[i] <= pivot) {
        recordPointer('i', i, level);
        i++;
      }
      recordPointer('i', i, level);

      while (j >= lo + 1 && arr[j] >= pivot) {
        recordPointer('j', j, level);
        j--;
      }
      recordPointer('j', j, level);

      if (i >= j) break;

      swap(i, j);
      i++;
      j--;
      recordPointer('i', i, level);
      recordPointer('j', j, level);
    }

    swap(pivotIndex, j);
    recordPointer('p', j, level);
    return j;
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
