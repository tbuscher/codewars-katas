import './style.css';
import { quicksort, Action } from './quicksort';

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
let highlightEl: HTMLDivElement;
let iLabel: HTMLDivElement;
let jLabel: HTMLDivElement;

const CELL_WIDTH = 32; // px - wider cells
const GAP = 4; // space between cells
const ARRAY_SIZE = 30;
const TICK = 1000; // ms

function generateArray(): number[] {
  return Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 101));
}

function renderArray(values: number[], cells: HTMLDivElement[]) {
  const totalWidth = ARRAY_SIZE * CELL_WIDTH + (ARRAY_SIZE - 1) * GAP;
  arrayContainer.style.width = `${totalWidth}px`;
  arrayContainer.innerHTML = '';

  highlightEl = document.createElement('div');
  highlightEl.className = 'absolute top-0 h-8 bg-yellow-200 opacity-50 rounded';
  highlightEl.style.transition = `left ${TICK}ms ease, width ${TICK}ms ease`;
  highlightEl.style.width = '0px';
  arrayContainer.appendChild(highlightEl);

  for (let i = 0; i < values.length; i++) {
    const cell = document.createElement('div');
    cell.textContent = String(values[i]);
    cell.className = 'absolute border text-center text-xs flex items-center justify-center bg-white';
    cell.style.width = `${CELL_WIDTH - 2}px`;
    cell.style.height = '24px';
    cell.style.left = `${i * (CELL_WIDTH + GAP)}px`;
    cells[i] = cell;
    arrayContainer.appendChild(cell);
  }

  iLabel = document.createElement('div');
  iLabel.textContent = 'i';
  iLabel.className = 'absolute text-xs font-bold text-red-600';
  iLabel.style.top = '24px';
  iLabel.style.transition = `left ${TICK}ms ease`;
  arrayContainer.appendChild(iLabel);

  jLabel = document.createElement('div');
  jLabel.textContent = 'j';
  jLabel.className = 'absolute text-xs font-bold text-blue-600';
  jLabel.style.top = '36px';
  jLabel.style.transition = `left ${TICK}ms ease`;
  arrayContainer.appendChild(jLabel);
}

async function animateSwap(cells: HTMLDivElement[], i: number, j: number): Promise<void> {
  const a = cells[i];
  const b = cells[j];
  const dx = (j - i) * (CELL_WIDTH + GAP);

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

  a.style.left = `${j * (CELL_WIDTH + GAP)}px`;
  b.style.left = `${i * (CELL_WIDTH + GAP)}px`;
  cells[i] = b;
  cells[j] = a;
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processActions(actions: Action[], cells: HTMLDivElement[]) {
  for (const act of actions) {
    if (act.type === 'swap') {
      await animateSwap(cells, act.i, act.j);
    } else if (act.type === 'pointer') {
      const label = act.name === 'i' ? iLabel : jLabel;
      label.style.left = `${act.index * (CELL_WIDTH + GAP)}px`;
      await wait(TICK);
    } else if (act.type === 'range') {
      if (act.hi < act.lo) {
        highlightEl.style.width = '0px';
      } else {
        highlightEl.style.left = `${act.lo * (CELL_WIDTH + GAP)}px`;
        highlightEl.style.width = `${(act.hi - act.lo + 1) * (CELL_WIDTH + GAP) - GAP}px`;
      }
      await wait(TICK);
    }
  }
}

async function visualize() {
  runBtn.disabled = true;
  statusEl.textContent = '';
  const values = generateArray();
  const cells: HTMLDivElement[] = new Array(values.length);
  renderArray(values, cells);
  const actions = quicksort([...values]);
  await processActions(actions, cells);
  statusEl.textContent = 'Sorted';
  runBtn.disabled = false;
}

runBtn.addEventListener('click', () => {
  void visualize();
});
