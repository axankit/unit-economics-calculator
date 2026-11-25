# Manual checks: one scenario per industry

Every figure below was worked out by hand and matches the app. The same values are asserted in [`tests/engine.test.js`](../tests/engine.test.js).

## Education: ₹25,000 course, 30 learners

| Step | Calculation | Amount |
| --- | --- | --- |
| Customer collections | 25,000 × 1.18 × 30 | ₹8,85,000 |
| GST to government | 25,000 × 18% × 30 | ₹1,35,000 |
| Net revenue | 25,000 × 30 | ₹7,50,000 |
| Direct costs | (2,500 + 750 + 5,000) × 30 | ₹2,47,500 |
| Gross profit | 7,50,000 − 2,47,500 | ₹5,02,500 (67.0%) |
| Sales + acquisition | 2,500 × 30 + 1,50,000 | ₹2,25,000 |
| Contribution | 5,02,500 − 2,25,000 | ₹2,77,500 (37.0%) |
| Contribution per student | 2,77,500 ÷ 30 | ₹9,250 |
| Operating profit | 2,77,500 − 50,000 | ₹2,27,500 |
| Income tax (25%) | 2,27,500 × 25% | ₹56,875 |
| Net profit | 2,27,500 − 56,875 | ₹1,70,625 |
| CPL / CAC | 1,50,000 ÷ 300 / 1,50,000 ÷ 30 | ₹500 / ₹5,000 |
| Break-even | CEILING(50,000 ÷ 9,250) | **6 students** |

**If CAC rises 20%:** ad spend ₹1,80,000, profit ₹1,97,500, break-even CEILING(50,000 ÷ 8,250) = 7.

## Real estate: 2% brokerage on ₹60 lakh (one month)

| Step | Calculation | Amount |
| --- | --- | --- |
| Closed deals | 4 booked × (1 − 25%) | 3 |
| Revenue per deal | 60,00,000 × 2% | ₹1,20,000 |
| Net revenue | 1,20,000 × 3 | ₹3,60,000 |
| Customer collections | 3,60,000 × 1.18 | ₹4,24,800 |
| Direct costs | 5,000 × 3 | ₹15,000 |
| Gross profit | 3,60,000 − 15,000 | ₹3,45,000 |
| Sales + acquisition | 10% × 3,60,000 + 500 × 15 + 60,000 | ₹1,03,500 |
| Contribution | 3,45,000 − 1,03,500 | ₹2,41,500 |
| Contribution per deal | 2,41,500 ÷ 3 | ₹80,500 |
| Period profit | 2,41,500 − 1,50,000 | ₹91,500 |
| Net profit | 91,500 − 22,875 | ₹68,625 |
| CPL / cost per site visit | 60,000 ÷ 300 / 60,000 ÷ 15 | ₹200 / ₹4,000 |
| Lead-to-close / CAC | 3 ÷ 300 / 60,000 ÷ 3 | 1.0% / ₹20,000 |
| Break-even | CEILING(1,50,000 ÷ 80,500) | **2 deals** |

## Travel agency: ₹35,000 package, 20 travellers (gross revenue)

| Step | Calculation | Amount |
| --- | --- | --- |
| Net revenue | 35,000 × 20 | ₹7,00,000 |
| Customer collections | 35,000 × 1.05 × 20 | ₹7,35,000 |
| Fulfilment cost | (25,000 + 2,000) × 20 | ₹5,40,000 |
| Gross profit | 7,00,000 − 5,40,000 | ₹1,60,000 |
| Marketing (no input credit) | 60,000 × 1.18 | ₹70,800 |
| Contribution | 1,60,000 − 70,800 | ₹89,200 |
| Contribution per traveller | 89,200 ÷ 20 | ₹4,460 |
| Trip profit | 89,200 − 40,000 | ₹49,200 (7.0%) |
| Net profit | 49,200 − 12,300 | ₹36,900 |
| CPL / CAC per booking | 70,800 ÷ 200 / 70,800 ÷ 10 | ₹354 / ₹7,080 |
| Break-even | CEILING(40,000 ÷ 4,460) | **9 travellers** |

**Commission-only:** revenue (35,000 − 25,000) × 20 = ₹2,00,000; profit is still ₹49,200, but the margin rises to 24.6%.
