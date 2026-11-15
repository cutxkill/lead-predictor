import { calculateFunnel, funnelPercentages } from './calculator.js';
import './chart.js';

const $ = (id) => document.getElementById(id);

const inputs = {
  revenue: $('revenue'),
  aov: $('aov'),
  leadRate: $('lead-rate'),
  prospectRate: $('prospect-rate'),
};

export function readState() {
  return {
    revenue: inputs.revenue.value,
    aov: inputs.aov.value,
    leadRate: inputs.leadRate.value,
    prospectRate: inputs.prospectRate.value,
    start: $('start').value,
    end: $('end').value,
  };
}

function updateSlider(input, output) {
  const min = Number(input.min);
  const max = Number(input.max);
  const pct = ((input.value - min) / (max - min)) * 100;
  input.style.setProperty('--pct', `${pct}%`);
  output.textContent = `${Number(input.value).toFixed(2)}%`;
}

function renderCards(funnel) {
  const pct = funnelPercentages(funnel);
  for (const key of ['prospects', 'leads', 'customers']) {
    $(`${key}-count`).textContent = funnel[key].toLocaleString('en-US');
    $(`${key}-pct`).textContent = `${pct[key]}%`;
    $(`${key}-bar`).style.width = `${pct[key]}%`;
  }
}

export function render() {
  updateSlider(inputs.leadRate, $('lead-rate-out'));
  updateSlider(inputs.prospectRate, $('prospect-rate-out'));

  const state = readState();
  const funnel = calculateFunnel(state);
  renderCards(funnel);
  document.dispatchEvent(new CustomEvent('funnel:updated', { detail: { funnel, state } }));
}

$('settings').addEventListener('submit', (event) => event.preventDefault());
document.addEventListener('input', render);
render();
