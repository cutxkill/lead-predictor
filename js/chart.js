import { campaignMonths, monthlyBreakdown } from './calculator.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const H = 360;
const M = { top: 12, right: 24, bottom: 40, left: 44 };

const container = document.getElementById('chart');
const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
tooltip.hidden = true;
container.appendChild(tooltip);

let labels = { months: 'Months', people: (n) => `${n} people`, tooltip: null };

export function setChartLabels(next) {
  labels = { ...labels, ...next };
}

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function niceStep(max, maxTicks = 7) {
  const raw = max / maxTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw || 1));
  for (const factor of [1, 2, 2.5, 5, 10]) {
    if (factor * magnitude >= raw) return factor * magnitude;
  }
  return 10 * magnitude;
}

function defaultTooltip(row) {
  return [`Month #${row.month}`, `Prospects: ${row.prospects}`, `Leads: ${row.leads}`, `Customers: ${row.customers}`];
}

function showTooltip(event, row) {
  const lines = (labels.tooltip || defaultTooltip)(row);
  tooltip.replaceChildren(...lines.map((line) => {
    const div = document.createElement('div');
    div.textContent = line;
    return div;
  }));
  tooltip.hidden = false;
  const box = container.getBoundingClientRect();
  tooltip.style.left = `${event.clientX - box.left + 14}px`;
  tooltip.style.top = `${event.clientY - box.top + 14}px`;
}

export function renderChart(funnel, state) {
  const W = Math.max(container.clientWidth, 320);
  const months = campaignMonths(state.start, state.end);
  const rows = monthlyBreakdown(funnel, months);
  const max = Math.max(funnel.prospects, 1);
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;
  const rowH = innerH / months;
  const barH = rowH * 0.78;
  const x = (value) => M.left + (value / max) * innerW;

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'chart-svg', 'aria-hidden': 'true' });

  const step = niceStep(max);
  for (let tick = 0; tick <= max; tick += step) {
    const tx = x(tick);
    svg.append(
      el('line', { class: 'grid', x1: tx, x2: tx, y1: M.top, y2: M.top + innerH }),
      el('text', { x: tx, y: M.top + innerH + 16, 'text-anchor': 'middle' }, labels.people(Math.round(tick * 100) / 100)),
    );
  }

  svg.append(el('text', {
    transform: `translate(12 ${M.top + innerH / 2}) rotate(-90)`,
    'text-anchor': 'middle',
  }, labels.months));

  rows.forEach((row, index) => {
    const y = M.top + index * rowH + (rowH - barH) / 2;
    const group = el('g', { class: 'row' });
    group.append(
      el('text', { x: M.left - 8, y: y + barH / 2 + 3, 'text-anchor': 'end' }, String(row.month)),
      el('rect', { class: 'seg-prospects', x: M.left, y, width: Math.max(x(row.prospects) - M.left, 0), height: barH }),
      el('rect', { class: 'seg-leads', x: M.left, y, width: Math.max(x(row.leads) - M.left, 0), height: barH }),
      el('rect', { class: 'seg-customers', x: M.left, y, width: Math.max(x(row.customers) - M.left, 0), height: barH }),
      el('rect', { x: M.left, y: M.top + index * rowH, width: innerW, height: rowH, fill: 'transparent' }),
    );
    group.addEventListener('mousemove', (event) => showTooltip(event, row));
    group.addEventListener('mouseleave', () => { tooltip.hidden = true; });
    svg.append(group);
  });

  container.querySelector('svg')?.remove();
  container.prepend(svg);
}

let lastRender = null;

document.addEventListener('funnel:updated', (event) => {
  lastRender = event.detail;
  renderChart(lastRender.funnel, lastRender.state);
});

window.addEventListener('resize', () => {
  if (lastRender) renderChart(lastRender.funnel, lastRender.state);
});
