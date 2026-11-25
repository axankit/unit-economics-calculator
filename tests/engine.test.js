// Checks the engine against the hand-worked sample cases in docs/MANUAL-CHECKS.md.
// Run with: npm test   (Node 18+, no dependencies)
const test = require('node:test');
const assert = require('node:assert/strict');
const UE = require('../js/engine.js');

const near = (actual, expected, msg) => assert.ok(Math.abs(actual - expected) < 0.01, `${msg}: expected ${expected}, got ${actual}`);

test('Education sample: ₹25,000 course, 30 learners', () => {
  const r = UE.calc.education(UE.DEFAULTS.education);
  near(r.collections, 885000, 'collections');
  near(r.outputGst, 135000, 'GST');
  near(r.netRevenue, 750000, 'net revenue');
  near(r.directTotal, 247500, 'direct costs');
  near(r.grossProfit, 502500, 'gross profit');
  near(r.contribution, 277500, 'contribution');
  near(r.contributionPerUnit, 9250, 'contribution per student');
  near(r.operatingProfit, 227500, 'operating profit');
  near(r.netProfit, 170625, 'net profit');
  near(r.cpl, 500, 'CPL');
  near(r.cac, 5000, 'CAC');
  assert.equal(r.breakEven, 6);
});

test('Real estate sample: 2% brokerage on ₹60 lakh, 3 closed deals', () => {
  const r = UE.calc.realestate(UE.DEFAULTS.realestate);
  near(r.units, 3, 'closed deals');
  near(r.revenuePerDeal, 120000, 'revenue per deal (brokerage, not property value)');
  near(r.netRevenue, 360000, 'net revenue');
  near(r.contribution, 241500, 'contribution');
  near(r.operatingProfit, 91500, 'period profit');
  near(r.cpl, 200, 'CPL');
  near(r.costPerSiteVisit, 4000, 'cost per site visit');
  near(r.leadToClose, 0.01, 'lead-to-close');
  near(r.cac, 20000, 'CAC per closed deal');
  assert.equal(r.breakEven, 2);
});

test('Travel sample: ₹35,000 package, 20 travellers, gross revenue', () => {
  const r = UE.calc.travel(UE.DEFAULTS.travel);
  near(r.netRevenue, 700000, 'net revenue');
  near(r.outputGst, 35000, 'GST at 5%');
  near(r.directTotal, 540000, 'fulfilment');
  near(r.marketing, 70800, 'ads incl. non-recoverable GST');
  near(r.operatingProfit, 49200, 'trip profit');
  near(r.cac, 7080, 'CAC per booking');
  assert.equal(r.breakEven, 9);
});

test('Travel commission-only keeps profit but shrinks revenue', () => {
  const r = UE.calc.travel({ ...UE.DEFAULTS.travel, recognition: 'commission' });
  near(r.netRevenue, 200000, 'commission revenue');
  near(r.operatingProfit, 49200, 'same profit');
});

test('GST-inclusive price is grossed down', () => {
  const r = UE.calc.education({ ...UE.DEFAULTS.education, feeInclGst: true });
  near(r.netRevenue, 25000 / 1.18 * 30, 'net revenue');
});

test('Zero volume never divides by zero', () => {
  const r = UE.calc.education({ ...UE.DEFAULTS.education, enrollments: 0, leads: 0 });
  assert.equal(r.cpl, null);
  assert.equal(r.cac, null);
  assert.equal(r.breakEven, null);
});

test('Negative contribution means break-even is not reachable', () => {
  const r = UE.calc.education({ ...UE.DEFAULTS.education, fee: 10000 });
  assert.ok(r.contributionPerUnit < 0);
  assert.equal(r.breakEven, null);
  assert.ok(UE.alerts(r).some(([type]) => type === 'bad'));
});

test('No income tax on a loss', () => {
  const r = UE.calc.education({ ...UE.DEFAULTS.education, enrollments: 2 });
  assert.ok(r.pbt < 0);
  assert.equal(r.incomeTax, 0);
});

test('Scenarios: worst and best for education', () => {
  const base = UE.DEFAULTS.education;
  const worst = UE.calc.education(UE.scenario('education', base, 0.8, 1.2));
  const best = UE.calc.education(UE.scenario('education', base, 1.2, 0.8));
  near(worst.operatingProfit, 148000, 'worst profit');
  near(best.operatingProfit, 319000, 'best profit');
  assert.equal(worst.breakEven, 7);
  assert.equal(best.breakEven, 5);
});

test('CAC +20% what-if', () => {
  const r = UE.calc.education({ ...UE.DEFAULTS.education, adSpend: 180000 });
  near(r.operatingProfit, 197500, 'profit');
  assert.equal(r.breakEven, 7);
});
