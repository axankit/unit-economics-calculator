// Unit economics engine: explicit, deterministic formulas. No AI arithmetic.
const UE = (() => {
  const n = v => (Number.isFinite(+v) ? +v : 0);
  const pct = v => n(v) / 100;
  const div = (a, b) => (b > 0 ? a / b : null); // guarded division
  const breakEven = (fixed, cpu) => (cpu > 0 ? Math.ceil(fixed / cpu - 1e-9) : null);

  const DEFAULTS = {
    education: {
      fee: 25000, feeInclGst: false, gstRate: 18, discountPct: 0, enrollments: 30, refundPct: 0,
      leads: 300, lms: 2500, gateway: 750, trainer: 5000, sales: 2500, adSpend: 150000,
      overhead: 50000, itcClaimable: true, inputGstRate: 18, additional: 0, incomeTaxPct: 25
    },
    realestate: {
      revenueMode: 'brokerage', propertyValue: 6000000, brokeragePct: 2, revenuePerDeal: 150000,
      gstRate: 18, adSpend: 60000, leads: 300, qualified: 60, siteVisits: 15, booked: 4, cancellationPct: 25,
      servicing: 5000, siteVisitCost: 500, salesIncentivePct: 10, overhead: 150000,
      itcClaimable: true, inputGstRate: 18, additional: 0, incomeTaxPct: 25
    },
    travel: {
      recognition: 'gross', price: 35000, priceInclGst: false, gstBase: 'package', gstRate: 5,
      travelers: 20, travelersPerBooking: 2, cancellationPct: 0, cancelRetentionPct: 25,
      hotel: 15000, transport: 7000, meals: 3000, otherVariable: 2000,
      partnerCommissionPct: 0, gatewayPct: 0, adSpend: 60000, leads: 200, overhead: 40000,
      itcClaimable: false, inputGstRate: 18, additional: 0, incomeTaxPct: 25
    }
  };

  // Shared bottom half of the P&L.
  function finish(r, i, fixed, units) {
    r.grossProfit = r.netRevenue - r.directTotal;
    r.variableTotal = r.variableLines.reduce((s, l) => s + l.v, 0);
    r.contribution = r.grossProfit - r.variableTotal;
    r.overhead = n(i.overhead);
    r.operatingProfit = r.contribution - r.overhead;
    r.additional = n(i.additional);
    r.pbt = r.operatingProfit - r.additional;
    r.incomeTax = r.pbt > 0 ? r.pbt * pct(i.incomeTaxPct) : 0;
    r.netProfit = r.pbt - r.incomeTax;
    r.units = units;
    r.fixedTotal = fixed;
    r.contributionPerUnit = div(r.contribution, units);
    r.breakEven = r.contributionPerUnit !== null ? breakEven(fixed, r.contributionPerUnit) : null;
    r.grossMargin = div(r.grossProfit, r.netRevenue);
    r.contributionMargin = div(r.contribution, r.netRevenue);
    r.operatingMargin = div(r.operatingProfit, r.netRevenue);
    r.netMargin = div(r.netProfit, r.netRevenue);
    r.profitPerUnit = div(r.operatingProfit, units);
    r.costLines = [...r.directLines, ...r.variableLines, { k: 'Fixed overhead', v: r.overhead }]
      .concat(r.additional ? [{ k: 'Additional expenses', v: r.additional }] : [])
      .filter(l => l.v > 0);
    return r;
  }

  function education(i) {
    const g = pct(i.gstRate), itcMult = i.itcClaimable ? 1 : 1 + pct(i.inputGstRate);
    const priceEx = i.feeInclGst ? n(i.fee) / (1 + g) : n(i.fee);
    const netPrice = priceEx * (1 - pct(i.discountPct));
    const enrolled = n(i.enrollments);
    const paying = enrolled * (1 - pct(i.refundPct));
    const r = { unit: 'student', unitPlural: 'students' };
    r.netRevenue = netPrice * paying;
    r.collections = netPrice * (1 + g) * paying;
    r.outputGst = r.collections - r.netRevenue;
    r.directLines = [
      { k: 'LMS', v: n(i.lms) * itcMult * enrolled },
      { k: 'Payment gateway', v: n(i.gateway) * itcMult * enrolled },
      { k: 'Trainer', v: n(i.trainer) * enrolled }
    ];
    r.directTotal = r.directLines.reduce((s, l) => s + l.v, 0);
    const marketing = n(i.adSpend) * itcMult;
    r.variableLines = [
      { k: 'Sales commission', v: n(i.sales) * paying },
      { k: 'Marketing (ad spend)', v: marketing }
    ];
    r.marketing = marketing;
    r.cpl = div(marketing, n(i.leads));
    r.cac = div(marketing, paying);
    r.leadToSale = div(paying, n(i.leads));
    r.netRevenuePerUnit = div(r.netRevenue, enrolled);
    r.payingCustomers = paying;
    r.funnel = [['Leads', n(i.leads)], ['Enrolled', enrolled], ['Paying (after refunds)', paying]];
    return finish(r, i, n(i.overhead) + n(i.additional), enrolled);
  }

  function realestate(i) {
    const g = pct(i.gstRate), itcMult = i.itcClaimable ? 1 : 1 + pct(i.inputGstRate);
    const revPerDeal = i.revenueMode === 'fixed' ? n(i.revenuePerDeal) : n(i.propertyValue) * pct(i.brokeragePct);
    const closed = n(i.booked) * (1 - pct(i.cancellationPct));
    const r = { unit: 'deal', unitPlural: 'closed deals' };
    r.revenuePerDeal = revPerDeal;
    r.netRevenue = revPerDeal * closed;
    r.collections = r.netRevenue * (1 + g);
    r.outputGst = r.collections - r.netRevenue;
    r.directLines = [{ k: 'Deal servicing', v: n(i.servicing) * closed }];
    r.directTotal = r.directLines[0].v;
    const marketing = n(i.adSpend) * itcMult;
    r.variableLines = [
      { k: 'Sales incentive', v: r.netRevenue * pct(i.salesIncentivePct) },
      { k: 'Site visit logistics', v: n(i.siteVisitCost) * n(i.siteVisits) },
      { k: 'Marketing (ad spend)', v: marketing }
    ];
    r.marketing = marketing;
    r.cpl = div(marketing, n(i.leads));
    r.costPerSiteVisit = div(marketing, n(i.siteVisits));
    r.leadToClose = div(closed, n(i.leads));
    r.cac = div(marketing, closed);
    r.netRevenuePerUnit = closed > 0 ? revPerDeal : null;
    r.payingCustomers = closed;
    r.funnel = [['Leads', n(i.leads)], ['Qualified', n(i.qualified)], ['Site visits', n(i.siteVisits)], ['Booked', n(i.booked)], ['Closed (after cancellations)', closed]];
    return finish(r, i, n(i.overhead) + n(i.additional), closed);
  }

  function travel(i) {
    const g = pct(i.gstRate), itcMult = i.itcClaimable ? 1 : 1 + pct(i.inputGstRate);
    const supplier = n(i.hotel) + n(i.transport) + n(i.meals);
    const going = n(i.travelers) * (1 - pct(i.cancellationPct));
    const cancelled = n(i.travelers) - going;
    let priceEx, gstPer;
    if (i.gstBase === 'margin') {
      const marginIn = n(i.price) - supplier;
      const marginEx = i.priceInclGst ? marginIn / (1 + g) : marginIn;
      priceEx = supplier + marginEx; gstPer = marginEx * g;
    } else {
      priceEx = i.priceInclGst ? n(i.price) / (1 + g) : n(i.price); gstPer = priceEx * g;
    }
    const cancelFeeEx = cancelled * priceEx * pct(i.cancelRetentionPct);
    const r = { unit: 'traveller', unitPlural: 'travellers' };
    r.recognition = i.recognition;
    r.netRevenue = (i.recognition === 'commission' ? going * (priceEx - supplier) : going * priceEx) + cancelFeeEx;
    r.collections = going * (priceEx + gstPer) + cancelled * (priceEx + gstPer) * pct(i.cancelRetentionPct);
    r.outputGst = (going + cancelled * pct(i.cancelRetentionPct)) * gstPer;
    r.passThrough = i.recognition === 'commission' ? going * supplier : 0;
    r.directLines = i.recognition === 'commission'
      ? [{ k: 'Other variable trip costs', v: n(i.otherVariable) * going }]
      : [
          { k: 'Hotel', v: n(i.hotel) * going },
          { k: 'Transport', v: n(i.transport) * going },
          { k: 'Meals', v: n(i.meals) * going },
          { k: 'Other variable trip costs', v: n(i.otherVariable) * going }
        ];
    r.directTotal = r.directLines.reduce((s, l) => s + l.v, 0);
    const marketing = n(i.adSpend) * itcMult;
    r.variableLines = [
      { k: 'Partner commission', v: going * priceEx * pct(i.partnerCommissionPct) },
      { k: 'Payment gateway', v: r.collections * pct(i.gatewayPct) },
      { k: 'Marketing (ad spend)', v: marketing }
    ];
    r.marketing = marketing;
    const bookings = div(going, n(i.travelersPerBooking));
    r.bookings = bookings;
    r.fulfillmentPerUnit = supplier + n(i.otherVariable);
    r.cpl = div(marketing, n(i.leads));
    r.cac = bookings ? div(marketing, bookings) : null;
    r.netRevenuePerUnit = div(r.netRevenue, going);
    r.payingCustomers = going;
    r.funnel = [['Leads', n(i.leads)], ['Bookings', bookings || 0], ['Travellers booked', n(i.travelers)], ['Travelling (after cancellations)', going]];
    return finish(r, i, n(i.overhead) + n(i.additional), going);
  }

  const calc = { education, realestate, travel };

  // Fields that scale with volume, per industry (for scenarios).
  const VOLUME = {
    education: ['enrollments', 'leads'],
    realestate: ['booked', 'siteVisits', 'qualified', 'leads'],
    travel: ['travelers', 'leads']
  };

  // Scale volume by v and cost-per-acquisition by c; ad spend follows both.
  function scenario(ind, inputs, v, c) {
    const s = { ...inputs };
    VOLUME[ind].forEach(f => { s[f] = n(inputs[f]) * v; });
    if (ind === 'education') s.enrollments = Math.round(s.enrollments);
    if (ind === 'travel') s.travelers = Math.round(s.travelers);
    s.adSpend = n(inputs.adSpend) * v * c;
    return s;
  }

  function alerts(r) {
    const a = [];
    if (!(r.units > 0)) a.push(['bad', `No ${r.unitPlural} yet, so per-${r.unit} figures and CAC can't be calculated.`]);
    if (r.contributionPerUnit !== null && r.contributionPerUnit <= 0) a.push(['bad', `Each ${r.unit} loses money before overhead (contribution ₹${Math.round(r.contributionPerUnit).toLocaleString('en-IN')}), so no volume breaks even.`]);
    if (r.operatingProfit < 0) a.push(['bad', 'Operating loss at the current volume.']);
    if (r.breakEven !== null && r.units > 0 && r.breakEven > r.units) a.push(['warn', `Break-even needs ${r.breakEven} ${r.unitPlural}; you have ${+r.units.toFixed(1)}.`]);
    if (r.grossMargin !== null && r.grossMargin < 0.3 && r.recognition !== 'gross') a.push(['warn', `Gross margin is ${(r.grossMargin * 100).toFixed(1)}%, under 30%.`]);
    return a;
  }

  return { DEFAULTS, calc, scenario, alerts, VOLUME };
})();
if (typeof module !== 'undefined') module.exports = UE;
