import './style.css';
import { quicksort, Action } from './quicksort';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="flex flex-col items-center space-y-8">
    <h1 class="text-2xl font-bold">Quicksort Visualizer</h1>
    <div class="flex items-center space-x-4">
      <button id="runBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Show Quicksort</button>
      <input id="tickSlider" type="range" min="0" max="1" step="0.01" value="0" class="w-32" />
    </div>
    <div id="arrayContainer" class="relative h-80"></div>
  </div>
`;

const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const arrayContainer = document.getElementById('arrayContainer') as HTMLDivElement;
const tickSlider = document.getElementById('tickSlider') as HTMLInputElement;
let iLabel: HTMLDivElement | null = null;
let jLabel: HTMLDivElement | null = null;
let pLabel: HTMLDivElement | null = null;

const CELL_WIDTH = 32; // px - wider cells
const GAP = 4; // space between cells
const ARRAY_SIZE = 30;
let tickMs = 1000; // default tick length

function computeTickMs() {
  const sliderVal = parseFloat(tickSlider.value);
  return ((1 - sliderVal) * 0.8 + 0.2) * 1000;
}
tickMs = computeTickMs();
tickSlider.addEventListener('input', () => {
  tickMs = computeTickMs();
});
const LEVEL_OFFSET = 32; // vertical offset per recursion level
const POINTER_BASES = { i: 24, j: 36, p: 48 } as const;

function createPointer(name: 'i' | 'j' | 'p'): HTMLDivElement {
  const div = document.createElement('div');
  div.textContent = name;
  div.className =
    'absolute text-xs font-bold ' +
    (name === 'i'
      ? 'text-red-600'
      : name === 'j'
      ? 'text-blue-600'
      : 'text-purple-600');
  div.style.transform = 'translateX(-50%)';
  div.style.transition = `left ${tickMs * 0.5}ms ease, top ${tickMs * 0.5}ms ease, opacity ${tickMs * 0.5}ms`;
  return div;
}

function generateArray(): number[] {
  return Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 101));
}

function renderArray(values: number[], cells: HTMLDivElement[]) {
  const totalWidth = ARRAY_SIZE * CELL_WIDTH + (ARRAY_SIZE - 1) * GAP;
  arrayContainer.style.width = `${totalWidth}px`;
  arrayContainer.innerHTML = '';


  for (let i = 0; i < values.length; i++) {
    const cell = document.createElement('div');
    cell.textContent = String(values[i]);
    cell.className = 'absolute border text-center text-xs flex items-center justify-center bg-white';
    cell.style.width = `${CELL_WIDTH - 2}px`;
    cell.style.height = '24px';
    cell.style.left = `${i * (CELL_WIDTH + GAP)}px`;
    cell.style.top = '0px';
    cell.style.transition = `top ${tickMs}ms ease`;
    cells[i] = cell;
    arrayContainer.appendChild(cell);
  }

  iLabel = createPointer('i');
  iLabel.style.top = '24px';
  arrayContainer.appendChild(iLabel);

  jLabel = createPointer('j');
  jLabel.style.top = '36px';
  arrayContainer.appendChild(jLabel);

  pLabel = createPointer('p');
  pLabel.style.top = '48px';
  arrayContainer.appendChild(pLabel);
}

async function animateSwap(cells: HTMLDivElement[], i: number, j: number): Promise<void> {
  const a = cells[i];
  const b = cells[j];
  const dx = (j - i) * (CELL_WIDTH + GAP);
  tickMs = computeTickMs();

  const animA = a.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${dx / 2}px,-40px)` },
      { transform: `translate(${dx}px,0)` }
    ],
    { duration: tickMs, easing: 'ease-in-out' }
  );

  const animB = b.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${-dx / 2}px,40px)` },
      { transform: `translate(${-dx}px,0)` }
    ],
    { duration: tickMs, easing: 'ease-in-out' }
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
  const levels = new Array(cells.length).fill(0);
  for (const act of actions) {
    tickMs = computeTickMs();
    if (act.type === 'swap') {
      await animateSwap(cells, act.i, act.j);
    } else if (act.type === 'pointer') {
      let label: HTMLDivElement | null = null;
      if (act.name === 'i') {
        if (!iLabel) {
          iLabel = createPointer('i');
          arrayContainer.appendChild(iLabel);
        }
        label = iLabel;
      } else if (act.name === 'j') {
        if (!jLabel) {
          jLabel = createPointer('j');
          arrayContainer.appendChild(jLabel);
        }
        label = jLabel;
      } else {
        if (!pLabel) {
          pLabel = createPointer('p');
          arrayContainer.appendChild(pLabel);
        }
        label = pLabel;
      }
      label.style.transition = `left ${tickMs * 0.5}ms ease, top ${tickMs * 0.5}ms ease, opacity ${tickMs * 0.5}ms`;
      if (act.name === 'p') {
        if (iLabel) iLabel.style.visibility = 'hidden';
        if (jLabel) jLabel.style.visibility = 'hidden';
      } else {
        if (iLabel) iLabel.style.visibility = 'visible';
        if (jLabel) jLabel.style.visibility = 'visible';
      }
      label.style.opacity = '1';
      label.style.left = `${act.index * (CELL_WIDTH + GAP) + CELL_WIDTH / 2}px`;
      const base = POINTER_BASES[act.name];
      label.style.top = `${base + act.level * LEVEL_OFFSET}px`;
      await wait(tickMs / 2);
    }
    else if (act.type === 'level') {
      for (let idx = act.lo; idx <= act.hi; idx++) {
        cells[idx].style.transition = `top ${tickMs * 0.5}ms ease`;
        cells[idx].style.top = `${act.level * LEVEL_OFFSET}px`;
        levels[idx] = act.level;
      }
      await wait(tickMs / 2);
    } else if (act.type === 'prepare') {
      if (iLabel) iLabel.style.opacity = '0';
      if (jLabel) jLabel.style.opacity = '0';
      if (pLabel) pLabel.style.opacity = '0';
      await wait(tickMs);
      if (iLabel) { iLabel.remove(); iLabel = null; }
      if (jLabel) { jLabel.remove(); jLabel = null; }
      if (pLabel) { pLabel.remove(); pLabel = null; }
      cells[act.pivot].style.background = '#bfdbfe';
    } else if (act.type === 'collapse') {
      for (let idx = 0; idx < levels.length; idx++) {
        if (levels[idx] === act.level) {
          cells[idx].style.transition = `top ${tickMs}ms ease`;
          cells[idx].style.top = `${(act.level - 1) * LEVEL_OFFSET}px`;
          levels[idx] = act.level - 1;
        }
      }
      await wait(tickMs);
    }
  }

  for (const cell of cells) {
    if (cell.style.background) {
      cell.style.transition = `background-color ${tickMs * 2}ms ease`;
      cell.style.background = '';
    }
  }
  await wait(tickMs * 2);
}

async function visualize() {
  runBtn.disabled = true;
  runBtn.textContent = 'Sorting ...';
  runBtn.classList.add('cursor-not-allowed');
  tickMs = computeTickMs();
  const values = generateArray();
  const cells: HTMLDivElement[] = new Array(values.length);
  renderArray(values, cells);
  const actions = quicksort([...values]);
  await processActions(actions, cells);
  if (iLabel) { iLabel.remove(); iLabel = null; }
  if (jLabel) { jLabel.remove(); jLabel = null; }
  if (pLabel) { pLabel.remove(); pLabel = null; }
  runBtn.textContent = 'Show Quicksort';
  runBtn.classList.remove('cursor-not-allowed');
  runBtn.disabled = false;
}

runBtn.addEventListener('click', () => {
  void visualize();
});
