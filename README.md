# CrowdLift

A complete **Stellar Testnet Crowdfunding dApp** built with Next.js, Tailwind CSS, StellarWalletsKit, and Soroban (Rust).

## Features
- Connect to Stellar wallets (Freighter, xBull)
- View connected wallet address and XLM balance
- Donate XLM to a crowdfunding campaign
- See campaign progress and total donations in real-time
- View recent donation events
- Modern Apple-inspired UI design

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS v4, Lucide Icons
- **Blockchain**: Stellar Testnet, Soroban Smart Contracts (Rust)
- **SDKs**: `@stellar/stellar-sdk`, `@creit-tech/stellar-wallets-kit`

## Setup & Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   Copy `.env.local.example` to `.env.local` and add your contract ID:
   ```
   NEXT_PUBLIC_CONTRACT_ID=YOUR_DEPLOYED_CONTRACT_ID
   NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Stellar Wallet Setup

To test the application, you need a Stellar wallet browser extension:
1. Install [Freighter](https://www.freighter.app/) or [xBull](https://xbull.app/).
2. Switch your wallet network to **Testnet**.
3. Fund your testnet wallet using the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test).

## Smart Contract (Soroban)

The smart contract is written in Rust and handles the crowdfunding logic (goal, donations, totals).

### Prerequisites
- Install [Rust](https://www.rust-lang.org/tools/install)
- Add the WASM target: `rustup target add wasm32v1-none`
- Install [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup)

### Build & Deploy

1. Build the contract:
   ```bash
   cd contracts/crowdfund
   stellar contract build
   ```

2. Generate a deployer identity and fund it:
   ```bash
   stellar keys generate --global crowdlift-deployer --network testnet
   ```

3. Deploy the contract:
   ```bash
   stellar contract deploy --wasm contracts/crowdfund/target/wasm32v1-none/release/crowdfund.wasm --network testnet --source crowdlift-deployer
   ```
   *Note the returned Contract ID and add it to your `.env.local` file.*

4. Initialize the campaign (Goal: 1000 XLM = 10,000,000,000 stroops):
   ```bash
   stellar contract invoke --id <CONTRACT_ID> --network testnet --source crowdlift-deployer -- initialize --admin $(stellar keys address crowdlift-deployer) --goal 10000000000
   ```

## Vercel Deployment

This project is ready to be deployed to Vercel:
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the environment variables from `.env.local` in the Vercel dashboard.
4. Deploy!
