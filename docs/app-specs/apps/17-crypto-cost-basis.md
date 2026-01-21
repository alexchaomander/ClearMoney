# App Spec: Crypto Cost Basis Tracker & Tax Calculator

## Overview
- **One-line description:** Track cryptocurrency cost basis and calculate taxes under the new IRS wallet-by-wallet rules
- **Target user persona:** Crypto investors preparing for 2025-2026 tax changes, especially those with assets across multiple wallets/exchanges
- **Key problem it solves:** New IRS rules require wallet-by-wallet cost basis tracking (no more universal wallet method), and 1099-DA reporting begins in 2025

## Inspired By
- IRS Form 1099-DA requirements (effective 2025)
- The complexity of the new wallet-by-wallet method
- CoinTracker, Koinly, and other crypto tax tools

## Why This Matters Now
Major IRS changes for 2025-2026:
1. **Form 1099-DA** - Brokers must report crypto transactions starting Jan 1, 2025
2. **Wallet-by-Wallet Method** - No more universal wallet; must track each account separately
3. **Basis Reporting Mandatory** - Starting Jan 1, 2026 for "covered" assets
4. **Transitional Relief** - Rev. Proc. 2024-28 allows basis allocation as of Jan 1, 2025
5. **Default Method is FIFO** - Unless you specify otherwise

## Core Features
- [ ] Compare tax impact: FIFO vs LIFO vs Specific ID vs HIFO
- [ ] Wallet-by-wallet basis tracking simulation
- [ ] Calculate short-term vs long-term capital gains
- [ ] Estimate tax liability at different brackets
- [ ] Show impact of transitional relief election
- [ ] Educational content on new rules
- [ ] Generate tax lot selection recommendations

## User Inputs

| Input | Type | Default | Min | Max | Step |
|-------|------|---------|-----|-----|------|
| Number of Wallets/Exchanges | number | 3 | 1 | 20 | 1 |
| Total Crypto Holdings (USD) | slider | 50000 | 0 | 1000000 | 1000 |
| Total Cost Basis | slider | 30000 | 0 | 1000000 | 1000 |
| Unrealized Gain/Loss | calculated | - | - | - | - |
| Planned Sale Amount | slider | 10000 | 0 | 500000 | 500 |
| Holding Period Mix | slider | 50 | 0 | 100 | 5 |
| Ordinary Income | slider | 100000 | 0 | 1000000 | 5000 |
| Filing Status | select | single | - | - | - |
| State | select | - | - | - | - |

### Per-Wallet Input (for detailed mode)
| Input | Type | Default |
|-------|------|---------|
| Wallet Name | text | - |
| Current Value | number | - |
| Cost Basis | number | - |
| Avg Purchase Date | date | - |
| Lot Details | array | - |

## Calculation Logic

```typescript
interface CryptoLot {
  id: string;
  walletId: string;
  purchaseDate: Date;
  quantity: number;
  costBasis: number;
  costPerUnit: number;
}

interface Wallet {
  id: string;
  name: string;
  lots: CryptoLot[];
  totalValue: number;
  totalCostBasis: number;
}

interface CryptoInputs {
  wallets: Wallet[];
  plannedSaleAmount: number;
  ordinaryIncome: number;
  filingStatus: "single" | "married" | "head_of_household";
  state: string;
}

interface TaxMethodResult {
  method: string;
  lotsUsed: CryptoLot[];
  shortTermGain: number;
  longTermGain: number;
  totalGain: number;
  estimatedTax: number;
  effectiveRate: number;
}

interface CryptoResults {
  methodComparison: {
    fifo: TaxMethodResult;
    lifo: TaxMethodResult;
    hifo: TaxMethodResult;  // Highest In, First Out
    specificId: TaxMethodResult;
  };
  bestMethod: string;
  taxSavingsVsFIFO: number;
  walletByWalletImpact: {
    universalMethod: { totalTax: number };
    walletByWallet: { totalTax: number };
    difference: number;
    explanation: string;
  };
  recommendations: string[];
  warnings: string[];
}

// Tax rates
const STCG_RATE = 0.37; // Treated as ordinary income (max rate)
const LTCG_RATES = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.20 },
  ],
  married: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.20 },
  ],
};
const NIIT_RATE = 0.038;
const NIIT_THRESHOLD = { single: 200000, married: 250000 };

function isLongTerm(purchaseDate: Date): boolean {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return purchaseDate <= oneYearAgo;
}

function selectLotsFIFO(wallets: Wallet[], amountToSell: number): CryptoLot[] {
  // Sort all lots by purchase date (oldest first), respecting wallet boundaries
  const selected: CryptoLot[] = [];
  let remaining = amountToSell;

  for (const wallet of wallets) {
    const sortedLots = [...wallet.lots].sort(
      (a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime()
    );

    for (const lot of sortedLots) {
      if (remaining <= 0) break;
      const useAmount = Math.min(lot.quantity * getCurrentPrice(), remaining);
      selected.push({ ...lot, quantity: useAmount / getCurrentPrice() });
      remaining -= useAmount;
    }
  }

  return selected;
}

function selectLotsHIFO(wallets: Wallet[], amountToSell: number): CryptoLot[] {
  // Highest cost basis first (minimizes gain)
  const selected: CryptoLot[] = [];
  let remaining = amountToSell;

  for (const wallet of wallets) {
    const sortedLots = [...wallet.lots].sort(
      (a, b) => b.costPerUnit - a.costPerUnit
    );

    for (const lot of sortedLots) {
      if (remaining <= 0) break;
      const useAmount = Math.min(lot.quantity * getCurrentPrice(), remaining);
      selected.push({ ...lot, quantity: useAmount / getCurrentPrice() });
      remaining -= useAmount;
    }
  }

  return selected;
}

function calculateGains(lots: CryptoLot[], salePrice: number): { shortTerm: number; longTerm: number } {
  let shortTerm = 0;
  let longTerm = 0;

  for (const lot of lots) {
    const proceeds = lot.quantity * salePrice;
    const basis = lot.quantity * lot.costPerUnit;
    const gain = proceeds - basis;

    if (isLongTerm(lot.purchaseDate)) {
      longTerm += gain;
    } else {
      shortTerm += gain;
    }
  }

  return { shortTerm, longTerm };
}

function calculateTax(
  shortTermGain: number,
  longTermGain: number,
  ordinaryIncome: number,
  filingStatus: string,
  state: string
): number {
  // Short-term = ordinary income rate
  const marginalRate = getMarginalRate(ordinaryIncome, filingStatus);
  const shortTermTax = shortTermGain * marginalRate;

  // Long-term = preferential rates
  const ltcgRate = getLTCGRate(ordinaryIncome + longTermGain, filingStatus);
  const longTermTax = longTermGain * ltcgRate;

  // NIIT if applicable
  const niitThreshold = NIIT_THRESHOLD[filingStatus as keyof typeof NIIT_THRESHOLD];
  let niit = 0;
  if (ordinaryIncome + shortTermGain + longTermGain > niitThreshold) {
    const niitableGain = Math.min(
      shortTermGain + longTermGain,
      ordinaryIncome + shortTermGain + longTermGain - niitThreshold
    );
    niit = niitableGain * NIIT_RATE;
  }

  // State tax
  const stateRate = STATE_TAX_RATES[state] || 0.05;
  const stateTax = (shortTermGain + longTermGain) * stateRate;

  return shortTermTax + longTermTax + niit + stateTax;
}
```

## UI Components
- Wallet/exchange input cards (add/remove)
- Cost basis method selector with explanation
- Tax impact comparison chart
- Lot-level breakdown table
- Short-term vs long-term visualization
- Recommendation card with best strategy
- Warning banners for new IRS rules

## Design Direction
- **Primary Color:** `#f97316` (orange - crypto/tech)
- **Personality:** Technical, educational, empowering
- **Style:** Tables, comparison charts, lot visualizations
- **Visual emphasis:** Tax savings between methods, short vs long term split

## Agent Prompt

```markdown
# Agent Prompt: Crypto Cost Basis Tracker

## Context
You are building a crypto tax calculator for ClearMoney that helps investors understand the new IRS wallet-by-wallet cost basis rules and optimize their tax strategy.

## Project Location
- Repository: /Users/alexchao/projects/clearmoney
- Your app directory: /src/app/tools/crypto-cost-basis/
- Your calculator logic: /src/lib/calculators/crypto-cost-basis/

## Design Requirements
- Primary Color: #f97316 (orange)
- Mobile-first, dark mode base
- Clear method comparisons
- Educational tooltips for new rules

## Key IRS Rules (2025-2026)

### Form 1099-DA (Starting 2025)
- Brokers report gross proceeds starting Jan 1, 2025
- Basis reporting optional in 2025, mandatory for covered assets in 2026
- "Covered" = acquired in same broker account on/after Jan 1, 2026

### Wallet-by-Wallet Method (New!)
- Can no longer pool basis across all accounts
- Must calculate basis separately for each wallet/exchange
- FIFO is default unless you specify otherwise

### Transitional Relief (Rev. Proc. 2024-28)
- Can allocate unused basis to remaining assets as of Jan 1, 2025
- One-time opportunity to organize cost basis records

### Cost Basis Methods
- FIFO (First In, First Out) - IRS default
- LIFO (Last In, First Out)
- HIFO (Highest In, First Out) - Minimizes gains
- Specific ID - Maximum flexibility, more record-keeping

### Holding Period
- Short-term: Held ≤ 1 year = ordinary income rates
- Long-term: Held > 1 year = preferential rates (0/15/20%)

## Files to Create
1. `/src/app/tools/crypto-cost-basis/page.tsx`
2. `/src/app/tools/crypto-cost-basis/calculator.tsx`
3. `/src/lib/calculators/crypto-cost-basis/calculations.ts`
4. `/src/lib/calculators/crypto-cost-basis/constants.ts`
5. `/src/lib/calculators/crypto-cost-basis/types.ts`

## Registration
Add to `/src/lib/site-config.ts`:
```typescript
{
  id: "crypto-cost-basis",
  name: "Crypto Cost Basis Calculator",
  description: "Compare tax methods and navigate the new IRS wallet-by-wallet rules",
  href: "/tools/crypto-cost-basis",
  categoryId: "taxes",
  status: "live",
  primaryColor: "#f97316",
  designStyle: "analytical",
  inspiredBy: ["IRS Form 1099-DA", "CoinTracker"],
  featured: true,
}
```

## Testing Checklist
- [ ] FIFO/LIFO/HIFO/Specific ID all calculate correctly
- [ ] Short vs long term holding period works
- [ ] NIIT applies at correct thresholds
- [ ] Wallet-by-wallet vs universal comparison works
- [ ] Tax estimates include state tax
```

## Sources

### Primary Sources
1. **IRS: Digital Assets**
   https://www.irs.gov/filing/digital-assets

2. **IRS: Final Regulations on Digital Asset Reporting**
   https://www.irs.gov/newsroom/final-regulations-and-related-irs-guidance-for-reporting-by-brokers-on-sales-and-exchanges-of-digital-assets

3. **Camuso CPA: Form 1099-DA Guide**
   https://camusocpa.com/irs-form-1099-da-the-definitive-2025-2026-guide-to-crypto-tax-reporting-compliance-cost-basis-rules-for-taxpayers/

### Secondary Sources
4. **Fidelity: Crypto Tax Developments**
   https://www.fidelitydigitalassets.com/research-and-insights/crypto-tax-developments

5. **First Citizens: IRS Reporting Rules for Cryptocurrency**
   https://www.firstcitizens.com/wealth/insights/intel/irs-reporting-rules-cryptocurrency

6. **Keiter CPA: Digital Asset Cost Basis Changes 2026**
   https://keitercpa.com/blog/digital-asset-cost-basis-reporting-backup-withholding-what-investors-need-know/

7. **Coinbase: Guide to New Crypto Tax Regulations**
   https://www.coinbase.com/learn/crypto-taxes/whats-new-crypto-tax-regulation

8. **Yahoo Finance: Crypto Tax Guide**
   https://finance.yahoo.com/personal-finance/taxes/article/crypto-tax-180934692.html
