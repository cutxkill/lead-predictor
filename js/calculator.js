const DAY_MS = 24 * 60 * 60 * 1000;
const AVG_DAYS_IN_MONTH = 30.4375;

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * Formula 01: customers = revenue / average order value
 * Formula 02: leads = customers * 100 / lead response rate
 * Formula 03: prospects = leads * 100 / prospect response rate
 * Rates are percentages (0-100). Results are whole people, rounded up.
 */
export function calculateFunnel({ revenue, aov, leadRate, prospectRate }) {
  const rev = toNumber(revenue);
  const order = toNumber(aov);
  const lr = toNumber(leadRate);
  const pr = toNumber(prospectRate);

  if (!rev || !order || !lr || !pr) {
    return { customers: 0, leads: 0, prospects: 0 };
  }

  const customers = Math.ceil(rev / order);
  const leads = Math.ceil((customers * 100) / lr);
  const prospects = Math.ceil((leads * 100) / pr);

  return { customers, leads, prospects };
}

/** Share of every stage relative to the prospects (the widest part of the funnel). */
export function funnelPercentages({ customers, leads, prospects }) {
  if (!prospects) return { prospects: 0, leads: 0, customers: 0 };
  return {
    prospects: 100,
    leads: Math.round((leads / prospects) * 100),
    customers: Math.round((customers / prospects) * 100),
  };
}

/** Number of campaign months between two ISO dates (at least 1). */
export function campaignMonths(start, end) {
  const from = new Date(start);
  const to = new Date(end);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) return 1;
  return Math.max(1, Math.round((to - from) / DAY_MS / AVG_DAYS_IN_MONTH));
}

/** Cumulative funnel numbers at the end of each campaign month. */
export function monthlyBreakdown(funnel, months) {
  const rows = [];
  for (let month = 1; month <= months; month += 1) {
    const share = month / months;
    rows.push({
      month,
      prospects: Math.round(funnel.prospects * share),
      leads: Math.round(funnel.leads * share),
      customers: Math.round(funnel.customers * share),
    });
  }
  return rows;
}
