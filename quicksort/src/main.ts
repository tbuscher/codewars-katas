import './style.css';
import { quicksort } from './quicksort';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="flex flex-col items-center space-y-4">
    <h1 class="text-2xl font-bold">Quicksort Visualizer</h1>
    <button id="runBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Run</button>
    <div id="arrayContainer" class="relative h-32 mt-4"></div>
    <div id="status" class="mt-4 text-xl font-bold text-green-700"></div>
  </div>
`;

const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const arrayContainer = document.getElementById('arrayContainer') as HTMLDivElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

const CELL_WIDTH = 24; // px
const ARRAY_SIZE = 50;
const TICK = 1000; // ms

function generateArray(): number[] {
  return Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 101));
}

function renderArray(values: number[], cells: HTMLDivElement[]) {
  arrayContainer.style.width = `${CELL_WIDTH * ARRAY_SIZE}px`;
  arrayContainer.innerHTML = '';
  for (let i = 0; i < values.length; i++) {
    const cell = document.createElement('div');
    cell.textContent = String(values[i]);
    cell.className = 'absolute border text-center text-xs flex items-center justify-center bg-white';
    cell.style.width = `${CELL_WIDTH - 2}px`;
    cell.style.height = '20px';
    cell.style.left = `${i * CELL_WIDTH}px`;
    cells[i] = cell;
    arrayContainer.appendChild(cell);
  }
}

async function animateSwap(cells: HTMLDivElement[], i: number, j: number): Promise<void> {
  const a = cells[i];
  const b = cells[j];
  const dx = (j - i) * CELL_WIDTH;

  const animA = a.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${dx / 2}px,-40px)` },
      { transform: `translate(${dx}px,0)` }
    ],
    { duration: TICK, easing: 'ease-in-out' }
  );

  const animB = b.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${-dx / 2}px,40px)` },
      { transform: `translate(${-dx}px,0)` }
    ],
    { duration: TICK, easing: 'ease-in-out' }
  );

  await Promise.all([animA.finished, animB.finished]);

  a.style.left = `${j * CELL_WIDTH}px`;
  b.style.left = `${i * CELL_WIDTH}px`;
  cells[i] = b;
  cells[j] = a;
}

async function visualize() {
  runBtn.disabled = true;
  statusEl.textContent = '';
  const values = generateArray();
  const cells: HTMLDivElement[] = new Array(values.length);
  renderArray(values, cells);
  const actions = quicksort([...values]);
  for (const { i, j } of actions) {
    await animateSwap(cells, i, j);
  }
  statusEl.textContent = 'Sorted';
  runBtn.disabled = false;
}

runBtn.addEventListener('click', () => {
  void visualize();
});
