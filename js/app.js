import { calculateFunnel, funnelPercentages } from './calculator.js';
import { setChartLabels } from './chart.js';
import { translations, currencies } from './i18n.js';

const $ = (id) => document.getElementById(id);

const inputs = {
  revenue: $('revenue'),
  aov: $('aov'),
  leadRate: $('lead-rate'),
  prospectRate: $('prospect-rate'),
};

let t = translations.en;

function applyLanguage(code) {
  t = translations[code] || translations.en;
  document.documentElement.lang = code;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t[node.dataset.i18n];
  });
  setChartLabels({
    months: t.months,
    people: t.people,
    tooltip: (row) => [
      `${t.month} #${row.month}`,
      `${t.prospects}: ${row.prospects}`,
      `${t.leads}: ${row.leads}`,
      `${t.customers}: ${row.customers}`,
    ],
  });
}

function applyCurrency(code) {
  document.querySelectorAll('[data-currency-sign]').forEach((node) => {
    node.textContent = currencies[code] || '$';
  });
}

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
    $(`${key}-count`).textContent = funnel[key].toLocaleString(t.locale);
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

$('language').addEventListener('change', (event) => {
  applyLanguage(event.target.value);
  render();
});

$('currency').addEventListener('change', (event) => applyCurrency(event.target.value));

document.addEventListener('input', render);
applyLanguage($('language').value);
applyCurrency($('currency').value);
render();
