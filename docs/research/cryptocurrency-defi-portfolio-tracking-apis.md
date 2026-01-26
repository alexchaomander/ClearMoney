# Cryptocurrency and DeFi Portfolio Tracking APIs Research

**Research Date:** January 2026
**Purpose:** Comprehensive analysis of APIs and data sources for cryptocurrency and DeFi portfolio tracking

---

## Executive Summary

This document provides a comprehensive overview of APIs and data sources available for building cryptocurrency and DeFi portfolio tracking functionality. The research covers centralized exchange (CEX) APIs, DeFi aggregation platforms, on-chain data providers, multi-chain tracking solutions, tax reporting integrations, and NFT portfolio tracking.

### Key Findings

1. **CEX APIs** are mature with standardized read-only access patterns across major exchanges
2. **DeFi aggregators** (Zerion, Zapper, DeBank) provide the most comprehensive multi-protocol position tracking
3. **2025 IRS regulations** require per-wallet cost basis tracking, significantly impacting tax software requirements
4. **SimpleHash shutdown** (March 2025) and **Reservoir API wind-down** (October 2025) have consolidated the NFT API market
5. **Multi-chain tracking** requires aggregation across 50+ chains, with L2s (Arbitrum, Base, Optimism) dominating activity

---

## 1. Centralized Exchange (CEX) APIs

### 1.1 Coinbase

**Documentation:** [Coinbase Developer Documentation](https://docs.cdp.coinbase.com/)

**Key Features:**
- OAuth-based portfolio access with granular permissions
- Portfolio-level authorization for V3 endpoints
- Read-only API key permissions available for portfolio tracking

**API Endpoints:**
- `GET /portfolios` - List all portfolios
- `GET /accounts` - List accounts with balances
- Transaction history with full trade details

**Security Model:**
- API keys are portfolio-specific (one key per portfolio)
- OAuth connections respect portfolio account-level access
- Read-only permissions prevent trades and withdrawals

**2025 Update:** Starting May 13, 2025, Advanced Trade API respects portfolio account-level access set by users using OAuth connections. OAuth connections must specify portfolio ID when submitting orders.

**Rate Limits:** Standard rate limiting applies; check documentation for current limits

**Sources:**
- [OAuth Portfolio Access - Coinbase Developer Documentation](https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/oauth-access)
- [Get user portfolio | Coinbase Developer Documentation](https://docs.cdp.coinbase.com/intx/reference/getportfolio)

---

### 1.2 Kraken

**Documentation:** [Kraken API Center](https://docs.kraken.com/)

**Key Features:**
- REST API and WebSocket support
- Extended balance endpoint with credits and held amounts
- Trade balance with collateral and margin data

**API Endpoints:**
- `GET /0/private/Balance` - Get account balance (cash balances, net of pending withdrawals)
- `GET /0/private/TradeBalance` - Get trade balance (collateral, margin, equity)
- `GET /0/private/ExtendedBalance` - Extended balances including credits and holds

**Balance Calculation:**
```
available_balance = balance + credit - credit_used - hold_trade
```

**2025 Update:** Kraken has migrated assets from legacy Staking to new Earn system. Certain assets appear in balances as "read-only" - interact via base asset (e.g., USDT for USDT.F balances).

**Authentication:** API key + secret key required

**Sources:**
- [Get Account Balance | Kraken API Center](https://docs.kraken.com/api/docs/rest-api/get-account-balance/)
- [Get Extended Balance | Kraken API Center](https://docs.kraken.com/api/docs/rest-api/get-extended-balance/)
- [Get Trade Balance | Kraken API Center](https://docs.kraken.com/api/docs/rest-api/get-trade-balance/)

---

### 1.3 Binance / Binance.US

**Documentation:** [Binance.US API Documentation](https://docs.binance.us/)

**Key Features:**
- Default read-only API restrictions
- IP whitelisting support
- Automatic permission reset for inactive keys

**Security Model:**
- API keys default to "Enable Read" (read-only)
- IP restriction highly recommended
- Keys unused for 90 days without IP whitelisting are reset to read-only

**API Key Types (Binance.US):**
1. Exchange API Keys
2. Custodial Solution API Keys
3. Credit Line API Keys

**Requirements:**
- KYC/Basic Verification required for API access
- Read-only access sufficient for portfolio tracking and tax reporting

**Best Practice:** Only grant "Read" access for portfolio tracking - never enable Spot Trading or Withdrawals for third-party apps.

**Sources:**
- [How to create an API key on Binance.US](https://support.binance.us/en/articles/9842800-how-to-create-an-api-key-on-binance-us)
- [Binance.US API keys: Best practices & safety tips](https://support.binance.us/en/articles/9842812-binance-us-api-keys-best-practices-safety-tips)
- [Get API Key Permission | Binance Open Platform](https://developers.binance.com/docs/wallet/account/api-key-permission)

---

### 1.4 Gemini

**Documentation:** [Gemini Crypto Exchange: Build on Gemini](https://docs.gemini.com/)

**Key Features:**
- Role-based API keys (Trader, Auditor)
- WebSocket API for real-time updates
- REST API for order status and portfolio data

**API Key Roles:**
- **Trader:** Execute orders
- **Auditor:** Read-only access for balance checks and data analysis

**API Endpoints:**
- `POST /v1/order/status` - Single order status
- `POST /v1/orders` - Active orders list
- `POST /v1/balances` - Account balances

**Rate Limits:**
- Public endpoints: 120 requests/minute
- Private endpoints: 600 requests/minute

**Tax Reporting (2025):** Gemini reports to IRS via Form 1099-MISC, 1099-B, and starting 2025, 1099-DA.

**Sources:**
- [Market Data - REST API - Gemini Crypto Exchange](https://docs.gemini.com/rest/market-data)
- [Gemini API Endpoint URLs: Complete Developer Guide 2025](https://www.byteplus.com/en/topic/552126)
- [How to do your Gemini taxes with CoinTracker](https://www.cointracker.io/integrations/gemini)

---

## 2. DeFi Aggregation APIs

### 2.1 Zerion

**Website:** [Zerion API](https://www.zerion.io/api)

**Overview:**
Zerion provides comprehensive onchain wallet data with 8,000+ DeFi protocols tracked, real-time updates, and enterprise-grade reliability across 38+ blockchains.

**Key Features:**
- Full portfolio (tokens, DeFi, NFTs) from one endpoint
- Real-time data with sub-second latency
- Unified schema across all EVM chains
- LP positions, staked tokens, rewards tracking

**Coverage:**
- 38+ blockchains (Ethereum, major EVM networks, Solana)
- 8,000+ DeFi protocols
- NFT collections and metadata

**Use Cases:**
- Wallets and portfolio apps
- Tax software
- Analytics dashboards
- AI agents

**Pricing:**
- Free tier available for development
- Usage-based scaling
- Enterprise plans with custom rate limits
- All paid plans include commercial usage rights

**Notable Clients:**
- Uniswap Wallet (using multichain positions, custom labels, EIP-7702 batching)
- Waltio (crypto tax software - DeFi positions from multiple chains in single call)
- CMT Digital (VC firm - complex positions endpoint for investment decisions)

**Data Quality:**
- Enriched data with context, not just raw blockchain data
- 99.9% uptime SLA with up to 1,000 RPS

**Sources:**
- [Zerion API for Wallet Portfolio Data, Transactions, DeFi Positions, PnL, and More](https://www.zerion.io/api)
- [DeFi Positions API: Easy Way to Get Multichain Protocol Data](https://zerion.io/blog/how-to-fetch-multichain-defi-positions-for-wallet-with-zerion-api/)
- [Best Crypto Wallet Data APIs | 2025 Update](https://zerion.io/blog/top-10-crypto-wallet-data-apis-2025-guide/)

---

### 2.2 Zapper

**Website:** [Zapper Protocol](https://protocol.zapper.xyz)

**Overview:**
Enterprise-grade onchain data API with 50+ chain support via a single GraphQL API.

**Key Features:**
- Complete tracking with USD values for tokens, NFTs, and DeFi positions
- Human-friendly transaction descriptions
- Asset deltas and metadata
- NFT collection metadata with holders and USD valuations
- Support for EOAs and smart contract wallets

**Multi-Chain Support:**
- Ethereum, Arbitrum, Optimism, Polygon, Avalanche
- Solana, Bitcoin
- 50+ total chains

**API Architecture:**
- GraphQL API at `https://public.zapper.xyz/graphql`
- Developer Assistant Mode and Autonomous Agent Mode
- Sandbox environments available

**Use Cases:**
- DeFi dashboards
- Analytics platforms
- Portfolio trackers
- NFT marketplaces

**Competitive Position:**
- Social feed feature differentiates from competitors
- Real-time tracking with social activity feed
- Supports 11+ EVM chains for assets, debts, liquidity pools, staking, and yield farming

**Sources:**
- [Zapper Protocol](https://protocol.zapper.xyz)
- [Zapper Fi Review - Best DeFi Portfolio Dashboard 2025](https://whisperui.com/cryptocoins/zapper-fi)
- [How Zapper Streamlines Web3 Portfolio Management and Discovery | CoinGecko API](https://www.coingecko.com/learn/zapper-case-study)

---

### 2.3 DeBank

**Website:** [DeBank](https://debank.com/)

**Overview:**
Comprehensive DeFi portfolio tracking, wallet analytics, and Web3 social interaction platform supporting 35+ blockchains and 1,300+ protocols.

**Key Features:**
- Token balances across supported chains
- Protocol positions (staking, lending, LP holdings)
- NFT holdings and collection data
- Net worth calculation with pricing
- Transaction history and protocol activity
- Multi-signature wallet tracking
- Treasury management dashboards

**API Capabilities:**
- REST API endpoints for users, chains, protocols, tokens
- TVL data and user metrics
- Protocol metadata for 1,300+ protocols

**2025 Developments:**
- DeBank Chain mainnet launched
- Q1 2025: Hundreds of thousands of unique wallet addresses
- Daily active users exceeding tens of thousands
- Expanded to full Web3 ecosystem platform

**Business Model:**
- Premium subscriptions
- API services for enterprises
- DeBank Chain ecosystem

**Sources:**
- [DeBank | Your go-to portfolio tracker for Ethereum and EVM](https://debank.com/)
- [DeBank API - DeBank | Web3Connect](https://web3connect.com/product/debank-api-debank)
- [DeBank Ecosystem Deep Dive | Web3 Gate](https://web3.gate.com/learn/articles/debank-ecosystem-deep-dive-a-comprehensive-overview-of-web3-asset-tracking-and-portfolio-management/15564)

---

## 3. On-Chain Data APIs

### 3.1 Etherscan API V2

**Documentation:** [Etherscan APIs](https://etherscan.io/apis)

**Overview:**
Leading blockchain explorer with unified API across 60+ supported chains under single account and API key system.

**Key Features:**
- Multichain portfolio tracking
- Token and native balances
- Transaction history
- Analytics and historical data
- Contract verification
- Gas tracker with real-time fee estimates

**API V2 Updates (2025):**
- Single API key for all 60+ chains
- Consolidated API Pro subscriptions into Etherscan accounts (January 2025)
- Solscan acquisition brings Solana data (2024)

**Token Standards Supported:**
- ERC-20
- ERC-721 (NFTs)
- ERC-1155 (Multi-token)

**Building Portfolio Tracker:**
```javascript
// Example: Use array of chain IDs
const chainIds = [1, 137, 42161, 10]; // ETH, Polygon, Arbitrum, Optimism
// Query balances across chains with single API key
```

**Sources:**
- [Etherscan Information Center | Building a Multichain Portfolio Tracker with Etherscan API](https://info.etherscan.com/multichain-porfolio-tracker-api/)
- [Etherscan Information Center | Etherscan API V2: Multichain](https://info.etherscan.com/etherscan-api-v2-multichain/)
- [What is Etherscan?: Beginner's Guide 2026 | CoinLedger](https://coinledger.io/learn/what-is-etherscan)

---

### 3.2 Alchemy

**Documentation:** [Alchemy Docs](https://www.alchemy.com/docs/reference/api-overview)

**Overview:**
Enterprise-grade blockchain development platform supporting 45+ chains with Portfolio APIs for multi-chain data.

**Portfolio APIs:**
- Multi-chain token balances in single request
- Native, ERC-20, and SPL token support
- NFT metadata and ownership
- Transaction histories and enriched transfers

**Key Features:**
- Sub-50ms response times (2025 Cortex engine)
- 99.99% uptime across 50+ chains
- Embedded wallet solutions
- Data API for NFT metadata, balances, histories

**Token Balances Endpoint:**
- Supports Ethereum, Solana, and 30+ EVM chains
- Returns tokens with balances for each wallet/network combination

**2025 Updates:**
- Cortex blockchain engine launched summer 2025
- SimpleHash migration support offered

**Sources:**
- [Portfolio APIs | Alchemy Docs](https://www.alchemy.com/docs/reference/portfolio-apis)
- [Token Balances By Wallet | Alchemy Docs](https://www.alchemy.com/docs/data/portfolio-apis/portfolio-api-endpoints/portfolio-api-endpoints/get-token-balances-by-address)
- [The Best Blockchain APIs for Onchain Apps - Alchemy](https://www.alchemy.com/overviews/best-blockchain-apis-for-building-onchain-applications)

---

### 3.3 Helius (Solana)

**Website:** [Helius](https://www.helius.dev)

**Overview:**
Solana's leading RPC and API platform with comprehensive token tracking, DAS API, and real-time monitoring.

**Key Features:**
- Token metadata for all Solana tokens
- Token balances, stats, and transaction histories
- DAS API (Digital Asset Standard) for NFTs and tokens
- WebSocket for real-time monitoring
- Webhook support

**DAS API Methods:**
- `getAssetsByOwner()` - All NFTs and fungible tokens for a wallet
- `searchAssets()` - Flexible token data queries
- Supports fungible tokens, NFTs, and compressed NFTs

**Portfolio Data Available:**
- Account balance
- Program address
- Associated token address
- Total supply in circulation
- Price data

**2025 Updates:**
- "Orb" blockchain explorer launched with AI explanations
- Features: Time Machine search, token trading history, heatmaps, fund flow tracking

**Infrastructure:**
- SOC 2 certification
- Redundant node clusters
- Global endpoints across multiple continents
- Notable users: Backpack, Phantom, Crossmint, Zeta Markets, Chainalysis

**Pricing:**
- Free tier: 1M credits, no credit card required
- Direct support for paid plans

**Sources:**
- [Helius - Solana's Leading RPC and API Platform](https://www.helius.dev)
- [Solana Token APIs - Holders, Metadata, and Balances](https://www.helius.dev/solana-token-apis)
- [How to build a Solana Portfolio Viewer with Next.js](https://www.helius.dev/blog/build-a-solana-portfolio-viewer)

---

### 3.4 Bitcoin APIs

**Key Providers:**

#### Bitquery
- GraphQL APIs with WebSocket integration
- 40+ blockchains including Bitcoin
- Historical and real-time indexed data
- UTXO tracking, address balances, inputs/outputs

**Source:** [Bitcoin API - Balances, Inputs, Outputs, Transactions - Bitquery](https://bitquery.io/blockchains/bitcoin-blockchain-api)

#### Blockchain.com
- REST API for real-time market data
- Balance information
- Payment processing API
- Wallet service for send/receive
- JSON data for blocks and transactions

**Source:** [Blockchain Developer APIs](https://www.blockchain.com/api)

#### QuickNode
- BTC Blockbook JSON-RPC Add-On
- Methods for address/XPub balance, transactions, UTXOs
- Balance, total received, total sent, transaction IDs

**Source:** [Look Up the Address Balance for a Wallet for Bitcoin on Quicknode](https://www.quicknode.com/guides/quicknode-products/apis/look-up-the-address-balance-for-a-wallet-for-bitcoin-on-quicknode)

#### Blockdaemon Ubiquity API
- Single common data standard across 12+ blockchains
- Query transactions and wallet balances
- Independent, verifiable source of truth

**Source:** [Blockchain API: Querying Crypto Transactions & Balances](https://www.blockdaemon.com/blog/how-to-query-your-crypto-transactions-and-wallet-account-balances-with-a-blockchain-api)

---

### 3.5 Moralis

**Website:** [Moralis](https://moralis.com/)

**Overview:**
Enterprise-grade Web3 APIs supporting 30+ networks with portfolio, NFT, and DeFi data.

**Key Features:**
- Native, ERC-20, and NFT balances with prices and metadata in single call
- DeFi positions including TVL, unclaimed rewards, total rewards claimed
- NFT metadata, traits, attributes, transfer history
- Cross-chain compatible APIs

**DeFi Data:**
```javascript
// Single endpoint for DeFi positions
// Returns: TVL, unclaimed rewards, rewards claimed, protocol data
```

**2025 Updates:**
- Positioned as top SimpleHash alternative after shutdown
- SOC 2 Type 2 certified (only Web3 infra provider)
- 30+ networks supported

**Developer Benefits:**
- 75% development time reduction reported
- ~$4,000/month per chain in infrastructure cost savings vs. building in-house

**Sources:**
- [Moralis | Enterprise-Grade Web3 APIs](https://moralis.com/)
- [DeFi Solutions - Moralis for Developers](https://moralis.com/solutions/defi/)
- [Top SimpleHash Alternative 2025](https://moralis.com/top-simplehash-alternative-2025-best-cross-chain-option-to-simplehash-api/)

---

### 3.6 Covalent GoldRush

**Website:** [GoldRush](https://goldrush.dev/)

**Overview:**
Foundational data APIs for Web3 supporting 100+ blockchain networks with wallet, transaction, and NFT data.

**Key Features:**
- Multi-chain support across 100+ networks
- ERC20, NFT, and native token balances
- Transaction histories with decoded event logs
- Real-time and historical token prices with fiat conversion
- Cached NFT assets for fast portfolio rendering

**Key Endpoints:**
- `Get wallet activity` - Token balances across all 100 chains
- `Get balances for address` - Detailed token holdings
- `Get transactions for address` - Transaction history

**SDKs Available:**
- TypeScript
- Python
- Go
- React components (ready-to-use)

**2025 Updates:**
- Q2 2025: 471M API calls processed
- Cumulative: 17 billion+ API calls
- 95%+ calls are paid/revenue generating
- GoldRush Streaming API (public beta) - sub-second updates via GraphQL

**Notable Users:**
- MEXC (centralized exchange)
- Bubblemaps
- Temple Wallet
- Symphony (DeFi data platform)

**Sources:**
- [GoldRush | Foundational Data APIs for Web3](https://goldrush.dev/)
- [Building a Web3 Portfolio Tracker with the GoldRush API](https://goldrush.dev/guides/building-a-web3-portfolio-tracker-with-the-covalent-api/)
- [Covalent Q2 2025: Built for Speed, Structured to Scale](https://www.covalenthq.com/blog/covalent-q2-2025-built-for-speed-structured-to-scale/)

---

## 4. Multi-Chain Tracking

### 4.1 L2 Landscape (2025)

**Market Dominance:**
- Arbitrum, Optimism, and Base process ~90% of L2 transactions
- Value transferred: Base (55%), Arbitrum (35%), Optimism (distant third)

**TVL Distribution:**
- Base: $3.1B → $5.6B peak (46.6% of L2 DeFi TVL)
- Arbitrum: ~$2.8B stable (31%+ of L2 DeFi TVL)

**Sources:**
- [Base, Arbitrum lead L2 activity and revenue generation in 2025](https://www.mitrade.com/insights/news/live-news/article-3-713082-20250322)
- [2026 Layer 2 Outlook | The Block](https://www.theblock.co/post/383329/2026-layer-2-outlook)

### 4.2 Multi-Chain Tracking Challenges

**Key Challenges:**
1. **Blockchain Fragmentation:** Assets distributed across L1s, L2s, sidechains
2. **Diverse Asset Classes:** DeFi positions, NFTs, tokens with different standards
3. **No Universal APIs:** Complex data collection per chain
4. **Real-Time Data:** Need for immediate updates across all chains

### 4.3 Multi-Chain Solutions

| Provider | Chains Supported | Key Strengths |
|----------|-----------------|---------------|
| Zerion | 38+ | DeFi positions, real-time |
| Zapper | 50+ | GraphQL, social features |
| DeBank | 35+ | 1,300+ protocols |
| Alchemy | 45+ | Enterprise reliability |
| Covalent | 100+ | Widest chain coverage |
| Nansen | 47+ | 400+ protocols, non-EVM |

**Nansen Portfolio Coverage:**
- EVM chains: Ethereum, Arbitrum, Polygon
- Non-EVM: Cosmos, Solana, Osmosis, Bitcoin

**Sources:**
- [The Best Tools to Track Your Crypto Portfolio Across Multiple Chains in 2025 | Nansen](https://www.nansen.ai/post/the-best-tools-to-track-your-crypto-portfolio-across-multiple-chains-in-2025)
- [Multi-Chain Crypto Portfolio Tracking: Challenges & Solutions | Nansen](https://www.nansen.ai/post/multi-chain-crypto-portfolio-tracking-challenges-solutions)

---

## 5. Tax Tracking APIs

### 5.1 Critical 2025 IRS Changes

**Per-Wallet Cost Basis Requirement:**
Starting January 1, 2025, the IRS mandates "per-wallet tracking" - calculating cost basis separately for each wallet/exchange, tied directly to specific assets in the account used for buying/selling.

**Approved Cost Basis Methods:**
1. **FIFO (First-In, First-Out)** - Default if Specific ID not used
2. **Specific Identification** - Includes LIFO and HIFO

**New Reporting Requirements:**
- Brokers must report crypto transactions to IRS starting 2025
- 1099-DA forms required for 2026 reporting (sales from 2025)
- Basis reporting begins for covered transactions in 2026

**Sources:**
- [Crypto Cost Basis Per Wallet: 2025 IRS Rules Explained](https://www.cryptoworth.com/blog/cost-basis-per-wallet-crypto)
- [US Crypto Tax Cost Basis Methods [IRS 2025]](https://www.blockpit.io/en-us/tax-guides/crypto-cost-basis-methods)

---

### 5.2 CoinTracker

**Website:** [CoinTracker](https://www.cointracker.io/)

**Overview:**
Trusted by 3M+ users, $50B+ in crypto assets tracked. Exclusive cryptocurrency tax partner for Coinbase and TurboTax.

**Key Features:**
- 500+ wallet and exchange integrations
- Automatic capital gains/losses calculation
- IRS-compliant forms (Form 8949)
- Multiple cost-basis methods (FIFO, LIFO, Specific ID)
- 50,000+ DeFi smart contracts supported

**API Capabilities:**
- Read-only wallet access
- Exchange API integration
- CSV import support
- Custom API access available

**2025 Compliance:**
- Full per-wallet cost basis tracking support
- Technology restructured around Rev. Proc. 2024-28
- Broker Tax Compliance Suite launched October 2025
- Automated 1099-DA reporting for brokers

**Notable:** Coinbase selected CoinTracker for Broker Tax Compliance Tools.

**Sources:**
- [Crypto tax software to save you time and money | CoinTracker](https://www.cointracker.io/)
- [Crypto tracking and tax reporting features](https://www.cointracker.io/features)
- [CoinTracker Unveils Crypto Broker Tax Compliance Suite](https://www.cpapracticeadvisor.com/2025/10/29/cointracker-unveils-crypto-broker-tax-compliance-suite/171895/)

---

### 5.3 Koinly

**Website:** [Koinly](https://koinly.io/)

**Overview:**
Comprehensive crypto tax software with 400+ exchange/wallet integrations and AI-powered transfer detection.

**Key Features:**
- API and CSV import support
- Read-only API keys (no transaction capability)
- Automatic sync with configurable time periods
- AI transfer detection between own wallets
- Cost basis preserved across transfers

**Cost Basis Methods:**
- FIFO, LIFO, HIFO
- Average Cost
- Jurisdiction-specific compliance engine

**DeFi & NFT Support:**
- Staking on Solana, lending on Curve, LPs on Polygon
- NFT recognition from OpenSea, Foundation, SuperRare
- Ethereum, Polygon, Solana NFT networks

**Pricing:**
- $49/year: Up to 100 transactions
- $99/year: Up to 1,000 transactions
- Higher tiers available

**2025 Update:** Working on per-wallet tracking support for new US regulations.

**Sources:**
- [Koinly: Free Crypto Tax Software](https://koinly.io/)
- [Tax Plans and Pricing | Koinly](https://koinly.io/pricing/)
- [New 2025 US Tax Regulations - Universal to Per-Wallet Cost Basis Transition - Koinly Support](https://discuss.koinly.io/t/new-2025-us-tax-regulations-universal-to-per-wallet-cost-basis-transition/22508)

---

### 5.4 TaxBit

**Website:** [TaxBit](https://www.taxbit.com/)

**Overview:**
Enterprise-focused unified compliance platform for tax information reporting and crypto accounting.

**Important Note:** TaxBit discontinued individual consumer service in 2023 to focus on institutional and government clients.

**Features (Enterprise/Government):**
- 2,500+ cryptocurrencies supported
- API-powered single system of record
- Multi-currency, multi-entity support (140 countries)
- FASB and IFRS compliant
- 1099 reporting, Form 8949 generation

**Notable:**
- IRS selected TaxBit as partner for crypto-auditing platform
- Major exchanges like Coinbase, Binance, Kraken integration

**For Individual Users:** Consider alternatives like TokenTax, Koinly, or CoinTracker.

**Sources:**
- [Unified Enterprise Compliance Platform for Tax Information Reporting and Crypto Accounting - Taxbit](https://www.taxbit.com/)
- [TaxBit Review 2025: Crypto Tax Software Guide](https://www.cryptovantage.com/best-crypto-tax-software/taxbit/)

---

### 5.5 TokenTax

**Website:** [TokenTax](https://tokentax.co/)

**Overview:**
Crypto tax software platform and full-service accounting firm for individuals and institutions.

**Key Features:**
- API integration with major exchanges (Binance, Coinbase, BitMEX)
- Wallet integration (MetaMask, Phantom)
- Manual CSV import support
- Auto-fills Form 8949
- Mining, staking, airdrop income tracking

**Services:**
- Automated transaction tracking
- Tax form generation
- Premium tiers include CPA assistance
- Full tax preparation service
- Audit assistance

**Best For:** High-volume traders needing automation + CPA assistance

**Pricing Note:** Add 20,000 transactions for $199 if limit exceeded; 10% discount for multi-year payment.

**Sources:**
- [TokenTax - Crypto Tax Software the Pros Use](https://tokentax.co/)
- [TokenTax Review 2025: Crypto Tax Features And Pricing](https://milkroad.com/reviews/tokentax/)

---

## 6. NFT Portfolio Tracking

### 6.1 Market Changes (2025)

**SimpleHash Shutdown:**
- Acquired by Phantom (February 2025)
- Services ceased March 27, 2025
- Developers migrating to Moralis, Alchemy alternatives

**Reservoir API Wind-Down:**
- Announced wind-down by October 2025
- Focusing entirely on Relay protocol (liquidity layer)
- Previously aggregated OpenSea, Blur, X2Y2, LooksRare orders

**Sources:**
- [The Rise and Fall of SimpleHash | Messari](https://messari.io/copilot/share/the-rise-and-fall-of-simplehash-523f1a96-694a-4b3f-8d70-aeb27e199ea1)
- [Top NFT APIs in 2025: Reservoir vs. SimpleHash](https://nftpricefloor.com/blog/top-nft-api-2025)
- [Migrating from SimpleHash to Alchemy](https://www.alchemy.com/blog/migrating-from-simplehash-to-alchemy)

### 6.2 OpenSea API

**Documentation:** [OpenSea Developer Documentation](https://docs.opensea.io/)

**Features:**
- ERC721 and ERC1155 metadata
- NFTs by collection, contract, or owner address
- Marketplace data and pricing

**Source:** [Overview | OpenSea API](https://docs.opensea.io/reference/api-overview)

### 6.3 NFT Price Floor

**Website:** [NFT Price Floor](https://nftpricefloor.com/)

**Overview:**
Proprietary API infrastructure built on 4 years of floor price tracking experience.

**Positioning:** Rising contender filling gap left by SimpleHash/Reservoir shutdowns.

**Source:** [Top NFT APIs in 2025](https://nftpricefloor.com/blog/top-nft-api-2025)

### 6.4 Alternative NFT Tracking Solutions

| Provider | NFT Features |
|----------|-------------|
| Zerion | NFT portfolio with DeFi integration |
| Alchemy | NFT metadata, ownership, transfers |
| Moralis | Cross-chain NFT data, traits, attributes |
| Covalent | NFT balances across 100+ chains |
| CoinStats | 20,000+ crypto + NFT tracking |

---

## 7. DeFi Position Tracking

### 7.1 Position Types

**Staking:**
- Native staking rewards
- Liquid staking (stETH, rETH)
- Restaking protocols

**Lending:**
- Supplied assets
- Borrowed assets
- Interest accrued

**Liquidity Pools:**
- LP token value
- Impermanent loss tracking
- Fee earnings

**Yield Farming:**
- Farm positions
- Pending rewards
- APY/APR data

### 7.2 DeFi Tracking APIs

**Staking Rewards API:**
- Protocol name, deposited wallets, USD balance
- Vault/lending options array
- Asset slugs, chain info, APR rates

**Source:** [DeFi Lending API | Staking Data](https://docs.stakingrewards.com/staking-data/sr-adapter/defi-lending-api)

**DefiLlama:**
- TVL across all chains
- Stablecoins market cap
- DEX volumes, perps volumes
- Yield rankings by APY/TVL

**Source:** [DefiLlama - DeFi Dashboard](https://defillama.com)

**Revert Finance:**
- AMM LP analytics
- Uniswap, Sushiswap, Curve, Balancer support
- Actionable analytics for LPs

**Source:** [Revert - Actionable analytics for AMM liquidity providers](https://revert.finance/)

### 7.3 Mobile DeFi Trackers (2025)

| App | Platforms | Key Features |
|-----|-----------|--------------|
| Zerion | iOS, Android | Real-time sync, widgets, in-app trading |
| Zapper | iOS, Android | Yield opportunities, network buckets |
| DFox | Mobile-first | Multi-wallet, LP/staking tracking, encrypted |
| Yieldwatch | Web/Mobile | BSC yield farming dashboard |
| Step Finance | Web | Solana-specific, LP management |

### 7.4 2025 DeFi Market Context

- DeFi lending: $78B+ TVL (50% of all DeFi activity)
- Growth drivers: Institutional inflows, high-yield strategies, multi-chain deployments

**Source:** [What Are the Top 10 DeFi Lending Protocols to Watch in 2026?](https://bingx.com/en/learn/article/what-are-the-top-defi-lending-protocols-to-watch)

---

## 8. API Pricing Comparison

### 8.1 Free Tier Comparison

| Provider | Free Tier | Rate Limits | Notes |
|----------|-----------|-------------|-------|
| CoinGecko | 10,000/month | 30 calls/min | Latest data only |
| CoinMarketCap | Basic tier | Varies | No historical on free |
| CoinPaprika | Top 2,000 tokens | - | No credit card |
| Helius | 1M credits | - | No credit card |
| Alchemy | Generous | - | SOC 2 Type 2 |
| Moralis | Development tier | - | SOC 2 Type 2 |
| Zerion | Development | - | Commercial on paid |

### 8.2 Paid Pricing

| Provider | Starting Price | Enterprise |
|----------|---------------|------------|
| EODHD | $19.99/month | $99.99/month |
| CoinAPI | $79/month | $599/month |
| Token Metrics | $19.99/month | $299.99/month |

### 8.3 Common Restrictions

- Rate limits (requests/minute or month)
- Data freshness delays on free tiers
- Commercial usage restrictions
- Limited/no technical support
- Advanced features require paid plans

**Sources:**
- [Top 5 Cryptocurrency Data APIs: Comprehensive Comparison (2025)](https://medium.com/coinmonks/top-5-cryptocurrency-data-apis-comprehensive-comparison-2025-626450b7ff7b)
- [Best Crypto APIs for Developers in 2025](https://dev.to/supratipb/best-crypto-apis-for-developers-in-2025-25lh)
- [Crypto Data API | CoinGecko API](https://www.coingecko.com/en/api)

---

## 9. Implementation Recommendations

### 9.1 For Self-Custody Wallet Tracking

**Recommended Stack:**
1. **Primary:** Zerion or DeBank API for comprehensive DeFi positions
2. **Supplementary:** Alchemy or Covalent for raw blockchain data
3. **Solana:** Helius for best Solana coverage
4. **Bitcoin:** QuickNode or Bitquery

### 9.2 For CEX Integration

**Approach:**
- Implement read-only API connections for each exchange
- Store encrypted API keys securely
- Use OAuth where available (Coinbase)
- Implement automatic sync with rate limit handling

### 9.3 For Tax Compliance

**2025 Requirements:**
- Track cost basis per-wallet (not universal)
- Support FIFO and Specific Identification
- Generate Form 8949 compatible data
- Handle 1099-DA reconciliation

**Recommended Integration:** CoinTracker or Koinly API for automated compliance

### 9.4 For NFT Tracking

**Post-2025 Shutdowns:**
- Primary: Alchemy or Moralis NFT APIs
- Alternative: OpenSea API for marketplace data
- Floor pricing: NFT Price Floor

### 9.5 Multi-Chain Architecture

```
User Request
     │
     ▼
┌─────────────────┐
│  API Gateway    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ EVM   │ │Non-EVM│
│Chains │ │Chains │
└───┬───┘ └───┬───┘
    │         │
┌───┴───┐ ┌───┴───┐
│Zerion │ │Helius │  (Solana)
│Alchemy│ │Bitquery│ (Bitcoin)
│Covalent│└───────┘
└───────┘
```

### 9.6 Data Freshness Requirements

| Use Case | Freshness | Recommended API |
|----------|-----------|-----------------|
| Portfolio view | Real-time | Zerion, Zapper |
| Tax reporting | Daily | Koinly, CoinTracker |
| Trading signals | Sub-second | Covalent Streaming |
| Historical analysis | Archival | Etherscan, Bitquery |

---

## 10. Security Considerations

### 10.1 API Key Management

- Use read-only permissions exclusively
- Never enable trading or withdrawal permissions
- Implement IP whitelisting where available
- Rotate keys periodically
- Store keys encrypted at rest

### 10.2 User Data Protection

- End-to-end encryption for wallet addresses
- Token-based authentication
- No plaintext storage of sensitive data
- Comply with data retention requirements

### 10.3 Rate Limiting and Caching

- Implement aggressive caching for price data
- Respect rate limits to avoid service disruption
- Use webhooks where available instead of polling
- Batch requests to minimize API calls

---

## Appendix: Quick Reference

### A. CEX API Summary

| Exchange | Auth Method | Read-Only Support | Rate Limits |
|----------|-------------|-------------------|-------------|
| Coinbase | OAuth/API Key | Yes | Portfolio-level |
| Kraken | API Key | Yes | Standard |
| Binance | API Key | Default | IP-based |
| Gemini | API Key (roles) | Yes (Auditor) | 120-600 req/min |

### B. DeFi Aggregator Comparison

| Provider | Chains | Protocols | Pricing | Best For |
|----------|--------|-----------|---------|----------|
| Zerion | 38+ | 8,000+ | Free tier + paid | Production apps |
| Zapper | 50+ | Many | Contact | Social features |
| DeBank | 35+ | 1,300+ | Premium + API | Comprehensive tracking |

### C. Blockchain Data Providers

| Provider | Chains | Specialty | Free Tier |
|----------|--------|-----------|-----------|
| Etherscan | 60+ | EVM explorer | Yes |
| Alchemy | 45+ | Enterprise | Generous |
| Covalent | 100+ | Wide coverage | Yes |
| Helius | Solana | Solana-specific | 1M credits |

### D. Tax Software API Features

| Provider | Individual | Enterprise | Per-Wallet (2025) | DeFi Support |
|----------|------------|------------|-------------------|--------------|
| CoinTracker | Yes | Yes | Yes | 50,000+ contracts |
| Koinly | Yes | - | In progress | Yes |
| TaxBit | No (discontinued) | Yes | Yes | Yes |
| TokenTax | Yes | Yes | Yes | Yes |

---

*Last Updated: January 2026*
*Research conducted for ClearMoney platform development*
