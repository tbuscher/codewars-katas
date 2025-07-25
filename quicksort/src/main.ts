import './style.css';
import { quicksort, Action } from './quicksort';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="flex flex-col items-center space-y-8">
    <h1 class="text-2xl font-bold">Quicksort Visualizer</h1>
    <div class="flex items-center space-x-4">
      <button id="runBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Show Quicksort</button>
      <input id="tickSlider" type="range" min="0" max="1" step="0.01" value="1" class="w-32" />
    </div>
    <div id="arrayContainer" class="relative h-80"></div>
  </div>
`;

const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const arrayContainer = document.getElementById('arrayContainer') as HTMLDivElement;
const tickSlider = document.getElementById('tickSlider') as HTMLInputElement;
let iLabel: HTMLDivElement;
let jLabel: HTMLDivElement;
let pLabel: HTMLDivElement;

const CELL_WIDTH = 32; // px - wider cells
const GAP = 4; // space between cells
const ARRAY_SIZE = 30;
let tickMs = 1000; // default tick length

function computeTickMs() {
  const sliderVal = parseFloat(tickSlider.value);
  return (0.2 + sliderVal * 0.8) * 1000;
}
tickMs = computeTickMs();
tickSlider.addEventListener('input', () => {
  tickMs = computeTickMs();
});
const LEVEL_OFFSET = 32; // vertical offset per recursion level
const POINTER_BASES = { i: 24, j: 36, p: 48 } as const;

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

  iLabel = document.createElement('div');
  iLabel.textContent = 'i';
  iLabel.className = 'absolute text-xs font-bold text-red-600';
  iLabel.style.top = '24px';
  iLabel.style.transform = 'translateX(-50%)';
  iLabel.style.transition = `left ${tickMs * 0.5}ms ease, top ${tickMs * 0.5}ms ease`;
  arrayContainer.appendChild(iLabel);

  jLabel = document.createElement('div');
  jLabel.textContent = 'j';
  jLabel.className = 'absolute text-xs font-bold text-blue-600';
  jLabel.style.top = '36px';
  jLabel.style.transform = 'translateX(-50%)';
  jLabel.style.transition = `left ${tickMs * 0.5}ms ease, top ${tickMs * 0.5}ms ease`;
  arrayContainer.appendChild(jLabel);

  pLabel = document.createElement('div');
  pLabel.textContent = 'p';
  pLabel.className = 'absolute text-xs font-bold text-purple-600';
  pLabel.style.top = '48px';
  pLabel.style.transform = 'translateX(-50%)';
  pLabel.style.transition = `left ${tickMs * 0.5}ms ease, top ${tickMs * 0.5}ms ease`;
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
  for (const act of actions) {
    tickMs = computeTickMs();
    if (act.type === 'swap') {
      await animateSwap(cells, act.i, act.j);
    } else if (act.type === 'pointer') {
      const label = act.name === 'i' ? iLabel : act.name === 'j' ? jLabel : pLabel;
      label.style.transition = `left ${tickMs * 0.5}ms ease, top ${tickMs * 0.5}ms ease`;
      if (act.name === 'p') {
        iLabel.style.visibility = 'hidden';
        jLabel.style.visibility = 'hidden';
      } else {
        iLabel.style.visibility = 'visible';
        jLabel.style.visibility = 'visible';
      }
      label.style.left = `${act.index * (CELL_WIDTH + GAP) + CELL_WIDTH / 2}px`;
      const base = POINTER_BASES[act.name];
      label.style.top = `${base + act.level * LEVEL_OFFSET}px`;
      await wait(tickMs / 2);
    }
    else if (act.type === 'level') {
      for (let idx = act.lo; idx <= act.hi; idx++) {
        cells[idx].style.transition = `top ${tickMs}ms ease`;
        cells[idx].style.top = `${act.level * LEVEL_OFFSET}px`;
      }
      await wait(tickMs);
    }
  }
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
  iLabel.remove();
  jLabel.remove();
  pLabel.remove();
  runBtn.textContent = 'Show Quicksort';
  runBtn.classList.remove('cursor-not-allowed');
  runBtn.disabled = false;
}

runBtn.addEventListener('click', () => {
  void visualize();
});
