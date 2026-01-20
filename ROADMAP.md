# Project Roadmap: The Anti-Points Guy

## Vision Statement

**Democratize financial literacy in the credit card and points space.**

The points and miles industry has been captured by corporate interests. Sites like The Points Guy exist to serve credit card issuers, not consumers. They're paid to make cards look good, inflate point valuations, and bury the real math under 3,000 words of SEO filler.

We're building something different: **a platform that serves people, not corporations.**

We believe everyone deserves access to the same analytical tools and honest information that finance professionals use. No gatekeeping. No hidden agendas. No manipulation.

**Our Promise:**
- We will never recommend a card because it pays us well
- We will always show our math so you can verify our claims
- We will tell you when a card is bad, even if it's popular
- We will respect your time and intelligence
- We will remain independent from corporate influence

---

## Mission: Financial Literacy for Everyone

### The Problem

The average American makes credit card decisions based on:
- Influencer recommendations (often paid)
- Affiliate-driven "reviews" disguised as journalism
- Word of mouth from friends who don't know the math
- Marketing from the card issuers themselves

This information asymmetry costs regular people **thousands of dollars per year** in:
- Annual fees for cards that don't fit their spending
- Missed rewards from suboptimal card choices
- Points devaluations they didn't see coming
- Complexity designed to confuse, not inform

### Our Solution

**Give people the tools to make their own informed decisions.**

Not "trust us, this card is great." Instead: "Here's the math. Here are your numbers. Here's what makes sense for YOU."

We don't want followers. We want people who understand their own finances.

---

## Why The Points Guy is the Problem

### Who TPG Actually Serves

TPG was acquired by Red Ventures (now Bankrate) in 2012. Red Ventures is a **$4 billion marketing company** that makes money by driving credit card applications. TPG is not a media company—it's a lead generation machine disguised as journalism.

**Follow the money:**
- TPG earns $200-$500+ per approved credit card application
- Higher-fee cards typically pay higher commissions
- TPG's "valuations" make expensive cards look better
- Content is optimized for affiliate clicks, not reader value

### TPG's Specific Failures

| What They Do | Why It Hurts Consumers |
|--------------|------------------------|
| Inflate point valuations (2.0cpp for Chase UR) | Makes annual fees seem more justified than they are |
| 3,000+ word articles for simple questions | Wastes your time; exists for SEO, not education |
| "Best cards" lists dominated by affiliate cards | Excludes great cards that don't pay commissions |
| Autoplay videos, pop-ups, ad clutter | Prioritizes ad revenue over user experience |
| Hedge language ("it depends", "could be worth it") | Avoids taking stances that might reduce conversions |
| Complex jargon without explanation | Gatekeeps knowledge to seem authoritative |

### Our Counter-Position

| TPG Approach | Our Approach |
|--------------|--------------|
| Serve the advertisers | **Serve the reader** |
| Maximize affiliate revenue | **Maximize reader outcomes** |
| Inflate valuations | **Use conservative, defensible math** |
| Hide methodology | **Open-source our calculations** |
| Content bloat | **Respect people's time** |
| Avoid controversy | **Take clear, honest positions** |

---

## Brand Identity

### Name Candidates
- **PointsLab** - Tools/calculators focus, scientific credibility
- **CardMath** - Analytical, no-BS positioning, educational
- **HonestPoints** - Trust-first, anti-corporate messaging
- **Point Blank** - Direct, honest opinions, no hedging
- **The Real Points Guy** - Cheeky, confrontational (legal risk?)
- **Points for People** - Populist, accessibility-focused

### Brand Pillars

1. **Financial Empowerment** - We exist to help you make better decisions, not to make money off your confusion
2. **Radical Transparency** - We show our math, disclose our revenue, and explain our methodology
3. **Intellectual Honesty** - We take real stances and admit when we're wrong
4. **Respect** - We don't waste your time with filler content or manipulative design
5. **Independence** - We are not beholden to card issuers or affiliate networks

### Brand Voice

**We sound like:**
- A smart friend who happens to know a lot about credit cards
- Someone who respects your intelligence
- A teacher who wants you to understand, not just follow advice
- An advocate who's on your side against corporate complexity

**We don't sound like:**
- A salesperson trying to close a deal
- A corporate blog optimized for SEO
- An elitist gatekeeping "insider knowledge"
- A hedge-everything-to-avoid-liability lawyer

**Example Voice:**

❌ TPG style: "The Chase Sapphire Reserve could potentially be a solid choice for some travelers who value premium benefits and don't mind paying a higher annual fee for the right card that fits their lifestyle needs."

✅ Our style: "The Chase Sapphire Reserve costs $550/year. If you don't spend at least $4,000 on travel and dining annually, it's not worth it. Here's the math."

### Visual Identity
- Minimal, tool-focused aesthetic (like Linear, Vercel, Stripe)
- Dark mode default—modern, focused, easy on the eyes
- Data visualization forward—charts and numbers, not stock photos
- No images of:
  - People holding credit cards on beaches
  - "Luxury travel" lifestyle porn
  - Generic diverse-hands-around-a-table corporate imagery
- Typography that's readable, not flashy
- Color palette that conveys trust and clarity, not excitement and urgency

---

## Phase 1: Foundation (Months 1-3)

### 1.1 Platform Architecture

**Goal:** Transform from single app to multi-tool platform

```
/                           → Landing page + tool directory
/tools/bilt-calculator      → Current Bilt 2.0 calculator (migrated)
/tools/[tool-slug]          → Future calculators
/blog/[post-slug]           → Opinion content
/valuations                 → Live points valuations dashboard
/compare                    → Card comparison tool
```

**Tech Stack:**
- **Framework:** Next.js 15 (App Router) - current preference per CLAUDE.md
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** PostgreSQL (Supabase/Neon) for user data, valuations
- **CMS:** MDX for blog content (version controlled, no CMS lock-in)
- **Analytics:** Plausible (privacy-first)
- **Deployment:** Vercel

**Migration Tasks:**
- [ ] Create new Next.js project with proper routing
- [ ] Migrate Bilt calculator to `/tools/bilt-calculator`
- [ ] Create shared component library (sliders, cards, charts)
- [ ] Set up MDX blog infrastructure
- [ ] Design and build landing page
- [ ] Set up CI/CD pipeline

### 1.2 Core Tools to Build

**Priority 1: Decision Calculators**
| Tool | Description | Complexity |
|------|-------------|------------|
| Bilt 2.0 Calculator | Already built - migrate | Done |
| Annual Fee Worth It? | Generic "is this AF card worth keeping" | Medium |
| Chase Trifecta Calculator | Sapphire + Freedom combo optimizer | Medium |
| Amex Gold vs Platinum | Common comparison, high search volume | Medium |
| Points Transfer Calculator | "Should I transfer to X partner?" | High |

**Priority 2: Reference Tools**
| Tool | Description | Complexity |
|------|-------------|------------|
| Live Valuations Dashboard | Our cpp estimates with methodology | Medium |
| Transfer Partner Matrix | Which points transfer where, at what ratio | Medium |
| Welcome Bonus Tracker | Current offers across all major cards | High (data) |

### 1.3 Content Strategy

**Content Philosophy:**

Our content exists to educate, not to sell. Every piece should leave the reader more capable of making their own decisions—not more dependent on us for answers.

**Content Types:**

1. **Financial Literacy Fundamentals**
   - "How Credit Card Rewards Actually Work" (the economics)
   - "Understanding Points Valuations (And Why They Vary)"
   - "Annual Fees: When They Make Sense and When They Don't"

2. **Tool Explainers**
   - Walkthroughs of our calculators
   - Explanation of the methodology behind each tool

3. **Honest Opinions**
   - Card reviews that take clear stances
   - "This card is bad" pieces (things TPG won't publish)
   - Industry criticism and consumer advocacy

4. **News Analysis**
   - Quick takes on program changes
   - "What this devaluation means for you"
   - Translation of corporate announcements into plain English

**Tone Guidelines:**
- Write like you're explaining to a smart friend
- Take clear positions; avoid hedge language ("it depends")
- Use numbers and calculations to support every opinion
- Keep it concise—800-1,200 words max (respect their time)
- No filler paragraphs for SEO (we'd rather rank lower than waste your time)
- Admit uncertainty when it exists; don't pretend to know everything
- Call out bad actors by name (issuers, other sites, policies)

**Initial Content Calendar (15 posts):**

*Manifesto & Foundation:*
1. "Why We Built This: A Manifesto for Honest Points Advice"
2. "How The Points Guy Makes Money (And Why It Matters)"
3. "Our Points Valuation Methodology (Open Source)"

*Financial Literacy:*
4. "Credit Card Rewards 101: How the Economics Actually Work"
5. "The Annual Fee Trap: Why Most Premium Cards Aren't Worth It"
6. "Points vs Cash Back: The Math Most People Get Wrong"

*Contrarian Takes:*
7. "The Amex Platinum is a Bad Card for Most People"
8. "Hotel Points Are Almost Always a Bad Deal—Here's Why"
9. "Why the Chase Sapphire Reserve Isn't Worth $550 Anymore"

*Practical Guides:*
10. "The Only 3 Credit Cards Most People Need"
11. "The Bilt 2.0 Decision Framework (With Calculator)"
12. "How to Actually Redeem Airline Miles Without Getting Screwed"

*Industry Criticism:*
13. "The Problem with Credit Card 'Best Of' Lists"
14. "Devaluation Watch: How Issuers Quietly Steal Your Points"
15. "The Affiliate Industrial Complex: Who's Really Writing Your Card Reviews"

---

## Phase 2: Growth Engine (Months 4-6)

### 2.1 SEO + Distribution

**SEO Strategy:**
- Target tool-based queries: "bilt card calculator", "is chase sapphire worth it calculator"
- Build topical authority around "credit card math"
- Internal linking between tools and related content
- Programmatic pages for card comparisons

**Social Distribution:**
- **Reddit:** Genuinely helpful comments on r/creditcards, r/churning, r/awardtravel
- **Twitter/X:** Quick takes, tool announcements, hot takes on news
- **YouTube (later):** Tool walkthroughs, opinion videos

**Community Building:**
- Respond to every Reddit mention
- Create tool embeds that others can share
- Build reputation as "the calculator people"

### 2.2 Advanced Tools

| Tool | Description | Value |
|------|-------------|-------|
| Card Recommendation Engine | "Based on your spend, here are your top 3 cards" | High |
| Points Portfolio Tracker | Track all your points/miles in one place | Very High |
| Redemption Finder | "I have 50k UR, show me best redemptions" | Very High |
| Downgrade Path Planner | "I want to cancel X, what should I downgrade to?" | Medium |

### 2.3 User Accounts (Optional)

**Purpose:** Save calculations, track portfolio, personalized recommendations

**Features:**
- Save tool inputs for recalculation
- Track points balances across programs
- Get alerts when valuations change significantly
- Personalized card recommendations based on history

**Consideration:** Accounts add friction. May want to keep tools anonymous-first with optional account for power users.

---

## Phase 3: Monetization (Months 6-9)

### 3.0 Editorial Independence Manifesto

Before discussing revenue, we need to establish inviolable principles. This is our constitution—the rules that cannot be broken regardless of financial pressure.

**The Independence Pledge:**

```
WE WILL NEVER:
1. Recommend a card because of its affiliate payout
2. Inflate point valuations to make cards look better
3. Suppress negative reviews of cards that pay us
4. Accept editorial input from card issuers
5. Hide affiliate relationships from readers
6. Prioritize revenue over reader outcomes

WE WILL ALWAYS:
1. Show our math so readers can verify our claims
2. Include non-affiliate options when they're better
3. Publish negative reviews even if it costs us money
4. Disclose exactly how we make money
5. Recommend AGAINST cards when appropriate
6. Update content when we're proven wrong
```

**Accountability Mechanism:**
- Publish an annual "Independence Report" showing:
  - Our affiliate revenue by card
  - Instances where we recommended against affiliate cards
  - Reader feedback and corrections we've made
  - Any pressure we've received from issuers

### 3.1 Revenue Streams (Ethical Framework)

**Tier 1: Affiliate Revenue (With Guardrails)**

Yes, we'll use affiliate links. Here's how we'll do it ethically:

| Guardrail | Implementation |
|-----------|----------------|
| Disclosure | Every page with affiliate links has clear, prominent disclosure |
| Comparison | We show affiliate AND non-affiliate options side by side |
| Math-first | Calculator recommendations are based on user inputs, not payouts |
| Negative reviews | We publish "don't get this card" content for bad affiliate cards |
| Payout transparency | We publish what we earn per card (radical transparency) |

**What we won't do:**
- "Best cards" lists ordered by payout
- Suppress reviews of cards that don't pay us
- Inflate valuations to justify high-fee affiliate cards
- Dark patterns to drive clicks

**Tier 2: Premium Tools (User-Aligned)**

Premium features should provide genuine value, not gate essential information.

| Free Forever | Premium ($8/mo) |
|--------------|-----------------|
| All calculators | Portfolio tracking across programs |
| All blog content | Personalized alerts (devaluations, bonus offers) |
| Methodology/math | Advanced redemption finder |
| Basic valuations | Historical valuation data |
| Card comparisons | API access |

**Principle:** If someone needs information to avoid losing money, it's free. Premium is for power users who want convenience and depth.

**Tier 3: Sponsorships (Selective)**

We will accept sponsorships under strict conditions:
- No editorial control—sponsor cannot review or modify content
- Clear "Sponsored" labeling, not hidden advertorials
- We can (and will) criticize sponsor products in other content
- No exclusivity agreements that limit our coverage

**Sponsors we'll reject:**
- Anyone requiring editorial approval
- Companies with predatory practices
- Payday lenders, high-interest cards targeting vulnerable populations

### 3.2 Revenue Transparency Page

We'll publish a live page showing:
- Monthly/quarterly affiliate revenue (aggregated)
- Which cards generate the most revenue for us
- Instances where our top recommendation ≠ highest-paying card
- Sponsorship relationships and terms

**Why:** If readers can see our incentives, they can judge our content accordingly. Hiding this information is what TPG does.

---

## Phase 4: Media Expansion (Months 9-12)

### 4.1 Video Content

**YouTube Strategy:**
- Tool walkthrough videos (screencast + voiceover)
- "Card Review in 5 Minutes" series
- News reaction videos
- "I Applied for X Card—Here's What Happened"

**Format:** Clean, fast-paced, no fluff. Aim for 5-8 minute videos.

### 4.2 Short-Form Content

**TikTok/Reels/Shorts Strategy:**

Short-form is where we reach people who've never questioned their card choices. This is financial literacy outreach, not just marketing.

**Content Pillars:**

1. **"They Don't Want You to Know"** - Exposing industry practices
   - "Why your 'travel rewards' card is actually terrible"
   - "The real reason TPG recommends this card"
   - "How credit card companies make money off confusion"

2. **Quick Math** - Visual breakdowns
   - "Is the Amex Platinum worth it? Let's do the math in 60 seconds"
   - "Your points just got devalued. Here's what you lost."
   - "Stop paying annual fees for cards you don't use"

3. **Myth Busting** - Correcting common misconceptions
   - "No, you don't need a 750 credit score for premium cards"
   - "Closing a credit card won't destroy your credit"
   - "Cash back usually beats points. Here's why."

4. **Tool Demos** - Show the calculators in action
   - "I built a calculator to figure out if Bilt 2.0 is worth it"
   - "Plug in your numbers and I'll tell you your best card"

5. **Industry Callouts** - Name names, create controversy
   - "Why I don't trust The Points Guy"
   - "This card is bad and everyone recommends it anyway"
   - "The affiliate industrial complex, explained"

**Tone:** Confident, slightly irreverent, never preachy. We're sharing knowledge, not lecturing.

### 4.3 Newsletter

**Weekly newsletter:**
- 1 featured tool or update
- 2-3 quick opinions on the week's news
- Best community questions/discussions
- No sponsorship in newsletter (trust-building)

---

## Phase 5: Platform Effects & Movement Building (Year 2+)

### 5.1 Community: Building a Movement

This isn't just a website—it's a movement for financial literacy and consumer advocacy in the rewards space.

**Community Principles:**
- **Peer education** - Users help each other, not just consume our content
- **Crowdsourced knowledge** - Community data improves our tools
- **Accountability** - Community holds us to our independence pledge
- **Advocacy** - Collective voice against predatory practices

**Community Features:**

| Feature | Purpose |
|---------|---------|
| Discord/Forum | Peer discussion, help, and knowledge sharing |
| Data point submissions | Crowdsource bonus approvals, redemption values |
| User reviews | Real experiences with cards and redemptions |
| Correction submissions | Community helps us fix errors |
| Independence watchdog | Users call us out if we stray from principles |

**Community-Sourced Content:**
- "Best redemption" stories submitted by users
- Data points on approval odds, credit limits
- Transfer partner sweet spot discoveries
- Devaluation alerts from the community

### 5.2 Consumer Advocacy

As we grow, we can use our platform for advocacy:

- **Devaluation tracking** - Public pressure on issuers who devalue
- **Fine print translation** - Explain what terms actually mean
- **Regulatory awareness** - Educate on CFPB actions, consumer rights
- **Industry reports** - Annual "State of Points" exposing trends

**Long-term vision:** Become a trusted consumer advocate that issuers actually have to listen to.

### 5.3 API/Embeds (Open Infrastructure)

Make our tools available to everyone:

- **Embed calculators** - Let personal finance sites embed our tools (with attribution)
- **Open API** - Free tier for valuations, transfer partners
- **Open source** - Consider open-sourcing calculator logic
- **Partner integrations** - Mint, YNAB, other PFM tools

**Philosophy:** The more people have access to good information, the better. We're not gatekeeping.

### 5.4 Expansion Verticals

Apply the same principles to adjacent spaces:

| Vertical | Approach |
|----------|----------|
| **Bank bonuses** | Same calculator-first, math-driven approach |
| **Brokerage bonuses** | Transfer bonus calculators |
| **International markets** | UK, Canada, Australia points ecosystems |
| **Credit building** | Financial literacy for credit newbies |
| **Travel booking** | Eventually, honest travel deal curation |

### 5.5 Long-Term Impact Goals

**In 5 years, we want to have:**
- Saved users millions in avoided annual fees and bad decisions
- Forced TPG and competitors to be more transparent
- Created a new standard for ethical affiliate content
- Built the largest independent community of informed points users
- Made "do the math" the default approach to card decisions

**Success isn't:**
- Maximizing our revenue
- Getting the most traffic
- Being acquired by Red Ventures

**Success is:**
- People making better financial decisions
- Industry practices improving due to our pressure
- Trust in financial content increasing

---

## Technical Architecture

### Shared Component Library

```typescript
// Reusable across all tools
components/
├── ui/
│   ├── Slider.tsx           // Tap-to-edit slider (from Bilt app)
│   ├── CardTile.tsx         // Result display card
│   ├── ComparisonChart.tsx  // Bar/comparison charts
│   ├── ValueBreakdown.tsx   // Line-item value breakdown
│   ├── MethodologyModal.tsx // Explains calculations
│   └── DisclaimerBanner.tsx // Affiliate/assumption disclaimers
├── calculators/
│   ├── useCalculation.ts    // Shared calculation hook pattern
│   ├── ValuationContext.tsx // Global points valuations
│   └── InputPresets.tsx     // Common spend profiles
└── layout/
    ├── ToolLayout.tsx       // Standard tool page wrapper
    ├── BlogLayout.tsx       // Article page wrapper
    └── Navigation.tsx       // Site-wide nav
```

### Data Architecture

```typescript
// Centralized valuations (database or config)
interface PointsProgram {
  id: string;
  name: string;
  baseValuation: number;      // Our conservative estimate
  tpgValuation: number;       // For comparison
  lastUpdated: Date;
  methodology: string;        // Link to explanation
  transferPartners: TransferPartner[];
}

interface CreditCard {
  id: string;
  issuer: string;
  name: string;
  annualFee: number;
  welcomeBonus: WelcomeBonus;
  earnRates: EarnRate[];
  credits: Credit[];
  affiliateUrl?: string;
  affiliatePayout?: number;   // Transparency
}

interface Calculator {
  id: string;
  slug: string;
  title: string;
  description: string;
  relatedCards: string[];
  relatedContent: string[];
}
```

### Content Architecture (MDX)

```
content/
├── blog/
│   ├── why-we-built-this.mdx
│   ├── our-valuation-methodology.mdx
│   └── ...
├── tools/
│   ├── bilt-calculator/
│   │   ├── page.tsx          // Tool component
│   │   └── explainer.mdx     // How to use guide
│   └── ...
└── data/
    ├── cards.json            // Card database
    ├── valuations.json       // Points valuations
    └── transfers.json        // Transfer partners
```

---

## Success Metrics

We measure success differently than a typical media company. Revenue matters, but impact matters more.

### Phase 1 (Foundation)

**Output Metrics:**
- [ ] Platform live with 3+ tools
- [ ] 15+ blog posts published
- [ ] Launch manifesto and methodology documentation

**Impact Metrics:**
- [ ] 1,000 monthly tool users
- [ ] Positive Reddit reception (not dismissed as "another affiliate site")
- [ ] At least 1 piece of content that challenges conventional wisdom

### Phase 2 (Growth)

**Output Metrics:**
- [ ] 7+ tools live
- [ ] Top 10 Google ranking for 5+ tool queries
- [ ] 1,000 Twitter/X followers
- [ ] Active Reddit presence

**Impact Metrics:**
- [ ] 10,000 monthly users
- [ ] User testimonials: "This changed how I think about cards"
- [ ] Community members helping each other (not just consuming)
- [ ] At least 1 "negative review" of a popular card that ranks well

### Phase 3 (Monetization)

**Output Metrics:**
- [ ] Affiliate revenue established
- [ ] Premium tier launched
- [ ] Transparency page live (showing our revenue sources)

**Impact Metrics:**
- [ ] Break-even on hosting costs
- [ ] Zero instances of recommending a card primarily for affiliate payout
- [ ] Published at least 3 "don't get this card" pieces for affiliate cards
- [ ] Independence Report published

### Phase 4 (Media)

**Output Metrics:**
- [ ] YouTube channel with 1,000 subscribers
- [ ] 10,000 newsletter subscribers
- [ ] Short-form content generating traffic

**Impact Metrics:**
- [ ] Short-form content reaching people outside the "points enthusiast" bubble
- [ ] Comments/feedback showing people learned something new
- [ ] Industry figures (TPG, etc.) responding to our criticism

### Year 2+

**Output Metrics:**
- [ ] 100,000 monthly users
- [ ] Sustainable profitability
- [ ] Community with active participation

**Impact Metrics:**
- [ ] Recognized as the "honest alternative" to TPG in community discussions
- [ ] Evidence of users making better decisions (testimonials, surveys)
- [ ] Other sites citing our methodology or adopting similar practices
- [ ] Card issuers aware of our platform (invitations to events, press inquiries)

---

## Immediate Next Steps

### This Week
1. [ ] Decide on brand name
2. [ ] Register domain
3. [ ] Create Next.js project with proper structure
4. [ ] Migrate Bilt calculator to new platform

### This Month
1. [ ] Build shared component library
2. [ ] Create 2 additional calculators
3. [ ] Write 3 launch blog posts
4. [ ] Design and build landing page
5. [ ] Set up analytics

### This Quarter
1. [ ] Launch publicly
2. [ ] Begin Reddit/Twitter presence
3. [ ] Build 5 total tools
4. [ ] Publish 12 blog posts
5. [ ] Establish content cadence

---

## Open Questions

1. **Brand name decision** - Need to pick and validate domain availability
2. **Solo vs team** - Can this scale with one person? When to bring on writers?
3. **Affiliate timing** - Start with affiliates or build trust first?
4. **User accounts** - Worth the complexity early on?
5. **Video priority** - When does video content make sense to start?

---

## Appendix: Tool Ideas Backlog

### High Value
- Credit card decision tree (guided questionnaire)
- "Should I cancel this card?" calculator
- Points vs cash back break-even calculator
- Transfer partner sweet spot finder
- Annual fee ROI tracker

### Medium Value
- Credit score impact estimator
- Velocity limits tracker
- Card application timeline planner
- Referral bonus optimizer
- Foreign transaction fee calculator

### Fun/Viral Potential
- "How much are your points worth?" total portfolio value
- "Which card personality are you?" quiz
- "Rate my wallet" - analyze someone's card setup
- "Points leaderboard" - anonymous community comparison

---

## The Bottom Line

We're not building a business that happens to be ethical. We're building an ethical platform that happens to be a business.

The credit card and points industry is worth billions, and almost all of that money flows from consumers to corporations. The "advice" ecosystem that's supposed to help consumers is captured by the same corporations it should be holding accountable.

We believe there's room for something different. Something that:
- Puts people first
- Shows its work
- Takes real stances
- Builds trust through transparency
- Empowers rather than exploits

If we do this right, we won't just build a successful platform. We'll help shift an entire industry toward honesty and accountability.

That's the mission. That's why we're doing this.

---

*Last updated: January 2026*
