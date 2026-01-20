/**
 * Site Configuration
 * Central place for site-wide settings, categories, and navigation
 */

export const siteConfig = {
  name: "ClearMoney",
  tagline: "Financial literacy for everyone",
  description:
    "The honest alternative to corporate finance media. Interactive tools and unbiased advice to help you make smarter money decisions. No affiliate bias. No corporate influence.",
  url: "https://clearmoney.com",
};

export interface Category {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: "credit-cards",
    name: "Credit Cards & Points",
    shortName: "Credit Cards",
    description:
      "Calculators and honest reviews to find the right cards for your spending. No affiliate bias.",
    icon: "💳",
    href: "/credit-cards",
    color: "brand",
  },
  {
    id: "banking",
    name: "Banking & Savings",
    shortName: "Banking",
    description:
      "High-yield savings, checking accounts, and bank bonuses. Find the best rates.",
    icon: "🏦",
    href: "/banking",
    color: "emerald",
  },
  {
    id: "investing",
    name: "Investing & Retirement",
    shortName: "Investing",
    description:
      "401k, IRA, brokerage accounts, and investment strategies. Build long-term wealth.",
    icon: "📈",
    href: "/investing",
    color: "violet",
  },
  {
    id: "budgeting",
    name: "Budgeting & Saving",
    shortName: "Budgeting",
    description:
      "Tools and frameworks to track spending, build emergency funds, and reach your goals.",
    icon: "💰",
    href: "/budgeting",
    color: "amber",
  },
  {
    id: "debt",
    name: "Debt & Credit",
    shortName: "Debt",
    description:
      "Strategies for paying off debt, improving credit scores, and avoiding traps.",
    icon: "🎯",
    href: "/debt",
    color: "rose",
  },
  {
    id: "taxes",
    name: "Taxes & Planning",
    shortName: "Taxes",
    description:
      "Tax optimization, deductions, and year-round planning. Keep more of what you earn.",
    icon: "📋",
    href: "/taxes",
    color: "sky",
  },
];

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  categoryId: string;
  status: "live" | "coming-soon" | "beta";
}

export const tools: Tool[] = [
  // Credit Cards
  {
    id: "bilt-calculator",
    name: "Bilt 2.0 Calculator",
    description:
      "Figure out if the new Bilt Mastercard is worth it for your spending patterns.",
    href: "/tools/bilt-calculator",
    categoryId: "credit-cards",
    status: "live",
  },
  {
    id: "annual-fee-calculator",
    name: "Annual Fee Worth It?",
    description:
      "Calculate if your premium card's annual fee is justified by your usage.",
    href: "/tools/annual-fee-calculator",
    categoryId: "credit-cards",
    status: "coming-soon",
  },
  {
    id: "chase-trifecta",
    name: "Chase Trifecta Calculator",
    description:
      "Optimize your Chase Sapphire + Freedom combo for maximum rewards.",
    href: "/tools/chase-trifecta",
    categoryId: "credit-cards",
    status: "coming-soon",
  },
  {
    id: "points-valuations",
    name: "Points Valuation Dashboard",
    description:
      "Our honest, conservative valuations for all major points programs.",
    href: "/valuations",
    categoryId: "credit-cards",
    status: "coming-soon",
  },
  // Banking
  {
    id: "hysa-comparison",
    name: "High-Yield Savings Finder",
    description: "Compare the best high-yield savings account rates.",
    href: "/tools/hysa-comparison",
    categoryId: "banking",
    status: "coming-soon",
  },
  {
    id: "bank-bonus-calculator",
    name: "Bank Bonus Calculator",
    description:
      "Calculate if a bank bonus is worth the requirements and your time.",
    href: "/tools/bank-bonus-calculator",
    categoryId: "banking",
    status: "coming-soon",
  },
  // Investing
  {
    id: "compound-interest",
    name: "Compound Interest Calculator",
    description: "See how your money grows over time with compound interest.",
    href: "/tools/compound-interest",
    categoryId: "investing",
    status: "coming-soon",
  },
  {
    id: "401k-calculator",
    name: "401k Contribution Calculator",
    description: "Optimize your 401k contributions and employer matching.",
    href: "/tools/401k-calculator",
    categoryId: "investing",
    status: "coming-soon",
  },
  {
    id: "roth-vs-traditional",
    name: "Roth vs Traditional IRA",
    description: "Determine which IRA type is better for your situation.",
    href: "/tools/roth-vs-traditional",
    categoryId: "investing",
    status: "coming-soon",
  },
  // Budgeting
  {
    id: "emergency-fund",
    name: "Emergency Fund Calculator",
    description: "How much should you have saved? Calculate your target.",
    href: "/tools/emergency-fund",
    categoryId: "budgeting",
    status: "coming-soon",
  },
  {
    id: "savings-goal",
    name: "Savings Goal Planner",
    description: "Plan how to reach any savings goal with a timeline.",
    href: "/tools/savings-goal",
    categoryId: "budgeting",
    status: "coming-soon",
  },
  // Debt
  {
    id: "debt-payoff",
    name: "Debt Payoff Calculator",
    description:
      "Snowball vs avalanche: find the fastest way to pay off debt.",
    href: "/tools/debt-payoff",
    categoryId: "debt",
    status: "coming-soon",
  },
  {
    id: "credit-score-simulator",
    name: "Credit Score Simulator",
    description: "Understand what actions will help or hurt your credit score.",
    href: "/tools/credit-score-simulator",
    categoryId: "debt",
    status: "coming-soon",
  },
  // Taxes
  {
    id: "tax-bracket",
    name: "Tax Bracket Calculator",
    description: "Understand your marginal and effective tax rates.",
    href: "/tools/tax-bracket",
    categoryId: "taxes",
    status: "coming-soon",
  },
  {
    id: "paycheck-calculator",
    name: "Paycheck Calculator",
    description: "See your take-home pay after taxes and deductions.",
    href: "/tools/paycheck-calculator",
    categoryId: "taxes",
    status: "coming-soon",
  },
];

export function getToolsByCategory(categoryId: string): Tool[] {
  return tools.filter((tool) => tool.categoryId === categoryId);
}

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find((cat) => cat.id === categoryId);
}

export function getLiveTools(): Tool[] {
  return tools.filter((tool) => tool.status === "live");
}

export function getComingSoonTools(): Tool[] {
  return tools.filter((tool) => tool.status === "coming-soon");
}
