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
    id: "equity-compensation",
    name: "Equity & Compensation",
    shortName: "Compensation",
    description:
      "Compare offers, evaluate equity grants, and understand your total compensation.",
    icon: "💼",
    href: "/equity-compensation",
    color: "sky",
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
  {
    id: "equity-compensation",
    name: "Equity & Compensation",
    shortName: "Equity",
    description:
      "Tools for stock options, equity compensation, and tax-aware decision making.",
    icon: "💼",
    href: "/equity-compensation",
    color: "amber",
  },
  {
    id: "charitable-giving",
    name: "Charitable Giving",
    shortName: "Giving",
    description:
      "Give more effectively with tools for stock donations, DAFs, and tax-smart generosity.",
    icon: "🤝",
    href: "/charitable-giving",
    color: "emerald",
  },
  {
    id: "credit-building",
    name: "Credit Building",
    shortName: "Credit",
    description:
      "Understand and improve your credit score. Simulators and education without the sales pitch.",
    icon: "📊",
    href: "/credit-building",
    color: "purple",
  },
];

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  categoryId: string;
  status: "live" | "coming-soon" | "beta";
  // Enhanced fields for app gallery
  primaryColor?: string;
  designStyle?: "analytical" | "playful" | "minimal" | "serious" | "comparison";
  inspiredBy?: string[];
  featured?: boolean;
  thumbnail?: string;
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
    primaryColor: "#000000",
    designStyle: "analytical",
    featured: true,
  },
  {
    id: "annual-fee-analyzer",
    name: "Annual Fee Analyzer",
    description:
      "Calculate if any annual fee card is worth it for your spending.",
    href: "/tools/annual-fee-analyzer",
    categoryId: "credit-cards",
    status: "live",
    primaryColor: "#22c55e",
    designStyle: "analytical",
    inspiredBy: ["The Points Guy (counter)"],
    featured: true,
  },
  {
    id: "chase-trifecta",
    name: "Chase Trifecta Calculator",
    description:
      "Optimize your Chase card combination for maximum rewards",
    href: "/tools/chase-trifecta",
    categoryId: "credit-cards",
    status: "live",
    primaryColor: "#005EB8",
    designStyle: "analytical",
    inspiredBy: ["Humphrey Yang"],
    featured: true,
  },
  {
    id: "amex-comparison",
    name: "Amex Gold vs Platinum",
    description:
      "Compare Amex Gold vs Platinum to see which is right for you",
    href: "/tools/amex-comparison",
    categoryId: "credit-cards",
    status: "live",
    primaryColor: "#d4a017",
    designStyle: "analytical",
    inspiredBy: ["The Points Guy (counter)"],
    featured: true,
  },
  {
    id: "points-valuation",
    name: "Points Valuation Dashboard",
    description:
      "Our transparent, methodology-backed valuations for major points currencies",
    href: "/tools/points-valuation",
    categoryId: "credit-cards",
    status: "live",
    primaryColor: "#3b82f6",
    designStyle: "analytical",
    inspiredBy: ["The Points Guy (counter)"],
    featured: false,
  },
  {
    id: "tpg-transparency",
    name: "TPG Transparency Tool",
    description:
      "See how affiliate incentives might influence credit card recommendations.",
    href: "/tools/tpg-transparency",
    categoryId: "credit-cards",
    status: "live",
    primaryColor: "#22c55e",
    designStyle: "analytical",
    inspiredBy: ["US Credit Card Guide", "Accountable US"],
    featured: true,
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
    id: "roth-vs-traditional",
    name: "Roth vs Traditional Calculator",
    description:
      "Compare Roth vs Traditional IRA to see which saves you more in taxes",
    href: "/tools/roth-vs-traditional",
    categoryId: "investing",
    status: "live",
    primaryColor: "#a855f7",
    designStyle: "analytical",
    inspiredBy: ["FIRE Movement"],
    featured: true,
  },
  {
    id: "mega-backdoor-roth",
    name: "Mega Backdoor Roth Calculator",
    description: "Discover if you can contribute $46,000+ extra to Roth accounts annually",
    href: "/tools/mega-backdoor-roth",
    categoryId: "investing",
    status: "live",
    primaryColor: "#8b5cf6",
    designStyle: "analytical",
  },
  {
    id: "fire-calculator",
    name: "FIRE Calculator",
    description:
      "Calculate when you can reach financial independence based on your savings rate",
    href: "/tools/fire-calculator",
    categoryId: "investing",
    status: "live",
    primaryColor: "#f59e0b",
    designStyle: "analytical",
    inspiredBy: ["Mr. Money Mustache", "FIRE Movement"],
    featured: true,
  },
  {
    id: "equity-concentration",
    name: "Equity Concentration Risk",
    description: "Assess the risk of holding too much company stock",
    href: "/tools/equity-concentration",
    categoryId: "investing",
    status: "live",
    primaryColor: "#ef4444",
    designStyle: "serious",
  },
  {
    id: "dividend-tracker",
    name: "Dividend Income Tracker",
    description:
      "Visualize your dividend income and project when it covers your expenses.",
    href: "/tools/dividend-tracker",
    categoryId: "investing",
    status: "live",
    primaryColor: "#22c55e",
    designStyle: "analytical",
    inspiredBy: ["Andrei Jikh"],
    featured: false,
  },
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
  // Equity & Compensation
  {
    id: "total-compensation",
    name: "Total Compensation Calculator",
    description: "Understand your true total comp—base, bonus, RSUs, and benefits",
    href: "/tools/total-compensation",
    categoryId: "equity-compensation",
    status: "live",
    primaryColor: "#3b82f6",
    designStyle: "analytical",
    inspiredBy: ["FAANG FIRE", "levels.fyi"],
    featured: true,
  },
  // Budgeting
  {
    id: "emergency-fund",
    name: "Emergency Fund Planner",
    description:
      "Calculate your personalized emergency fund target based on your risk factors.",
    href: "/tools/emergency-fund",
    categoryId: "budgeting",
    status: "live",
    primaryColor: "#3b82f6",
    designStyle: "minimal",
    inspiredBy: ["Dave Ramsey"],
    featured: true,
  },
  {
    id: "conscious-spending",
    name: "Conscious Spending Planner",
    description:
      "Build a guilt-free spending plan using Ramit Sethi's framework",
    href: "/tools/conscious-spending",
    categoryId: "budgeting",
    status: "live",
    primaryColor: "#10b981",
    designStyle: "playful",
    inspiredBy: ["Ramit Sethi"],
    featured: false,
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
    id: "debt-destroyer",
    name: "Debt Destroyer",
    description:
      "Compare snowball vs avalanche debt payoff strategies side-by-side",
    href: "/tools/debt-destroyer",
    categoryId: "debt",
    status: "live",
    primaryColor: "#ef4444",
    designStyle: "serious",
    inspiredBy: ["Dave Ramsey"],
    featured: true,
  },
  // Credit Building
  {
    id: "credit-score-simulator",
    name: "Credit Score Simulator",
    description:
      "Simulate how different actions might affect your credit score.",
    href: "/tools/credit-score-simulator",
    categoryId: "credit-building",
    status: "live",
    primaryColor: "#8b5cf6",
    designStyle: "analytical",
    inspiredBy: ["Humphrey Yang"],
    featured: true,
  },
  // Charitable Giving
  {
    id: "appreciated-stock-donation",
    name: "Appreciated Stock Donation Calculator",
    description:
      "See how much you save by donating appreciated stock instead of cash",
    href: "/tools/appreciated-stock-donation",
    categoryId: "charitable-giving",
    status: "live",
    primaryColor: "#22c55e",
    designStyle: "comparison",
    inspiredBy: ["Fidelity Charitable", "DAFgiving360"],
    featured: true,
  },
  // Taxes
  {
    id: "rsu-tax-calculator",
    name: "RSU Tax Calculator",
    description:
      "Calculate the tax gap between RSU withholding and actual liability",
    href: "/tools/rsu-tax-calculator",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#0ea5e9",
    designStyle: "analytical",
  },
  {
    id: "backdoor-roth",
    name: "Backdoor Roth IRA Guide",
    description:
      "Step-by-step guide to the backdoor Roth strategy for high earners",
    href: "/tools/backdoor-roth",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#10b981",
    designStyle: "analytical",
    inspiredBy: ["Mad Fientist", "White Coat Investor"],
    featured: true,
  },
  {
    id: "obbb-tax-optimizer",
    name: "OBBB Tax Savings Calculator",
    description:
      "Calculate your tax savings from the new 2025 deductions (senior, tips, overtime, car loan, SALT)",
    href: "/tools/obbb-tax-optimizer",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#10b981",
    designStyle: "analytical",
    inspiredBy: ["One Big Beautiful Bill Act 2025"],
    featured: true,
  },
  {
    id: "stock-option-exercise",
    name: "Stock Option Exercise Decision Tool",
    description:
      "Model ISO/NSO exercise scenarios—AMT impact, taxes, and optimal timing",
    href: "/tools/stock-option-exercise",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#f59e0b",
    designStyle: "analytical",
    inspiredBy: ["Secfi", "Compound Planning"],
    featured: true,
  },
  {
    id: "tax-bracket-optimizer",
    name: "Tax Bracket Optimizer",
    description: "Visualize your tax brackets and find opportunities to optimize",
    href: "/tools/tax-bracket-optimizer",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#14b8a6",
    designStyle: "analytical",
    inspiredBy: ["Mad Fientist", "Money Guy Show"],
    featured: true,
  },
  {
    id: "estate-tax",
    name: "Estate Tax Exposure Calculator",
    description: "Plan for the 2026 estate tax exemption sunset",
    href: "/tools/estate-tax",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#6366f1",
    designStyle: "serious",
  },
  {
    id: "hsa-maximization",
    name: "HSA Maximization Tool",
    description:
      "Unlock the triple tax advantage—use your HSA as a stealth retirement account.",
    href: "/tools/hsa-maximization",
    categoryId: "taxes",
    status: "live",
    primaryColor: "#06b6d4",
    designStyle: "analytical",
    inspiredBy: ["Mad Fientist", "Money Guy Show"],
    featured: true,
  },
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

export function getFeaturedTools(): Tool[] {
  return tools.filter((tool) => tool.featured && tool.status === "live");
}

export function getToolById(toolId: string): Tool | undefined {
  return tools.find((tool) => tool.id === toolId);
}
