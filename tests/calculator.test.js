import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFunnel,
  funnelPercentages,
  campaignMonths,
  monthlyBreakdown,
} from '../js/calculator.js';

const sample = { revenue: 10000, aov: 1000, leadRate: 40, prospectRate: 20 };

test('calculates customers, leads and prospects from the reference values', () => {
  assert.deepEqual(calculateFunnel(sample), { customers: 10, leads: 25, prospects: 125 });
});

test('returns zeros for invalid or empty input', () => {
  assert.deepEqual(calculateFunnel({ ...sample, aov: 0 }), { customers: 0, leads: 0, prospects: 0 });
  assert.deepEqual(calculateFunnel({ ...sample, leadRate: '' }), { customers: 0, leads: 0, prospects: 0 });
});

test('rounds people up to whole numbers', () => {
  const result = calculateFunnel({ revenue: 10000, aov: 3000, leadRate: 33, prospectRate: 17 });
  assert.equal(result.customers, 4);
  assert.equal(result.leads, 13);
  assert.equal(result.prospects, 77);
});

test('percentages are relative to prospects', () => {
  assert.deepEqual(funnelPercentages({ customers: 10, leads: 25, prospects: 125 }), {
    prospects: 100,
    leads: 20,
    customers: 8,
  });
});

test('campaign from 08-May-2026 to 04-Nov-2026 lasts 6 months', () => {
  assert.equal(campaignMonths('2026-05-08', '2026-11-04'), 6);
  assert.equal(campaignMonths('2026-05-08', '2026-05-01'), 1);
});

test('monthly breakdown matches the reference tooltip for month 3', () => {
  const rows = monthlyBreakdown({ customers: 10, leads: 25, prospects: 125 }, 6);
  assert.equal(rows.length, 6);
  assert.deepEqual(rows[2], { month: 3, prospects: 63, leads: 13, customers: 5 });
  assert.deepEqual(rows[5], { month: 6, prospects: 125, leads: 25, customers: 10 });
});
