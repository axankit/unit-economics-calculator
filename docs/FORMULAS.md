# Formulas and assumptions

Each formula is applied per **student** (education), **closed deal** (real estate) or **traveller** (travel; CAC per **booking**). Totals are per batch, month or trip. Code: [`js/engine.js`](../js/engine.js).

## Formulas

| Measure | Formula |
| --- | --- |
| Price excl. GST | If the price includes GST: price ÷ (1 + GST rate); otherwise the price as entered |
| Net revenue | Price excl. GST × (1 − discount) × paying units (refunds and cancellations removed) |
| Customer collections | Net revenue + GST charged (+ supplier pass-through in commission-only travel) |
| CPL | Marketing cost ÷ leads |
| Marketing CAC | Marketing cost ÷ attributed paying customers |
| Gross profit | Net revenue − direct service / fulfilment costs |
| Contribution | Gross profit − variable sales and acquisition costs |
| Operating profit | Total contribution − fixed period / batch overhead |
| Pre-tax profit | Operating profit − additional expenses |
| Estimated income tax | Tax rate × pre-tax profit, only if positive |
| Net profit | Pre-tax profit − estimated income tax |
| Break-even units | CEILING((overhead + additional expenses) ÷ contribution per unit), only when contribution > 0 |

## GST treatment

- **Output GST** (charged to customers) goes to the government. It is shown in collections, never as revenue or expense.
- **Input GST** on vendor bills (LMS, gateway, ads) is an expense only when input tax credit is not claimable. Recoverable GST stays out of expenses.
- Each industry has its own GST rate, input-credit toggle and (in travel) GST base, so no treatment is shared by default.

## Default assumptions

| | Education | Real Estate | Travel Agency |
| --- | --- | --- | --- |
| From the brief | ₹25,000 fee; 30 learners; per student ₹2,500 LMS, ₹750 gateway, ₹5,000 trainer, ₹2,500 sales, ₹5,000 marketing | ₹60 lakh property; 2% brokerage; ₹60,000 ads; 300 leads; 15 site visits; 3 closed deals | ₹35,000 package; 20 travellers; ₹25,000 supplier + ₹2,000 other variable each; ₹60,000 ads |
| Revenue recognised | Fee excl. GST, after discount and refunds | Brokerage only, never the property value (developer mode: fixed revenue per deal) | Gross by default; commission-only is available |
| GST on sales | 18% on top of the fee | 18% on brokerage | 5% on the full package (or GST on margin) |
| Input tax credit | Claimable | Claimable | Not claimable, so ad GST is a cost |
| Leads | 300 | 300 (60 qualified) | 200 |
| Volume detail | 0% refunds | 4 booked, 25% cancel = 3 closed | 2 travellers per booking; 0% cancel, 25% kept if cancelled |
| Other variable costs | Commission on paying students only | ₹5,000 servicing per deal, 10% sales incentive, ₹500 per site visit | Partner commission 0%, gateway 0% |
| Fixed overhead | ₹50,000 per batch | ₹1,50,000 per month | ₹40,000 per trip |
| Income tax | 25% | 25% | 25% |

## Guards

| Risk | Handling |
| --- | --- |
| Division by zero | Every ratio returns "—" when its denominator is 0 |
| Impossible break-even | Shown only when contribution per unit > 0; otherwise "Not reachable" with an alert |
| Double-counted CAC | Ad spend enters the P&L once, inside contribution; CPL and CAC are display ratios |
| Cancellations and refunds | Revenue only on units that stay; travel keeps a set cancellation fee |
| Negative inputs | Clamped to 0 |
| Tax on losses | None |

## Scenarios

Worst = volume −20% and CAC +20%. Best = volume +20% and CAC −20%. Ad spend scales with both.
