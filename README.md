# CrowdLift

CrowdLift is wallet-owned crowdfunding on Stellar. Creators publish campaigns with their connected wallet, supporters contribute directly to the creator, and campaign state remains publicly verifiable.

## Product routes

- `/` — product introduction
- `/campaigns` — public campaign discovery
- `/campaigns/new` — wallet-authorized campaign creation
- `/campaigns/[id]` — campaign details, contributions, and blockchain-verifiable activity history
- `/dashboard` — campaigns associated with the connected wallet
- `/dashboard/campaigns/[id]` — owner-only campaign editing and status controls

## Architecture

CrowdLift has no application database, custodial account system, or privileged platform administrator. The browser talks directly to Stellar services and the connected wallet:

```text
Browser UI -> Wallet authorization -> Soroban RPC
                                      |-> Campaign registry contract
                                      |-> Native asset token contract
                                      `-> Legacy campaign contract
```

The campaign registry stores campaign content, creator ownership, goals, totals, status, and per-wallet contribution records. Asset transfers settle directly from the supporter wallet to the creator wallet.

### Contracts

- Campaign registry: `CC5TW6SNJVV7FQ2FMDCWW2Y2AW66AK564QBLCMUZLLSV3NHWSEYHM6YK`
- Native asset token: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Legacy campaign: configured with `NEXT_PUBLIC_CONTRACT_ID`

The original single-campaign contract remains supported. New campaigns use the separate registry contract, so existing campaign state and contribution behavior are preserved.

## Local development

Requirements: Node.js 20+, npm, Rust, the `wasm32v1-none` target, and Stellar CLI.

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Configuration is read from these public environment variables:

- `NEXT_PUBLIC_CONTRACT_ID`
- `NEXT_PUBLIC_CAMPAIGN_REGISTRY_ID`
- `NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT_ID`
- `NEXT_PUBLIC_SOROBAN_RPC_URL`
- `NEXT_PUBLIC_HORIZON_URL`
- `NEXT_PUBLIC_NETWORK_PASSPHRASE`

## Verification

```bash
npm run lint
npm run build
cargo test --manifest-path contracts/campaign_registry/Cargo.toml
stellar contract build --manifest-path contracts/campaign_registry/Cargo.toml --locked
```

The UI deliberately avoids infrastructure labels that do not help contributors or creators. Developers can change the network endpoints and passphrase through environment configuration without changing the campaign model.
