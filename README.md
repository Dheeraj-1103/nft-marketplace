# 🖼️ NFT Marketplace

A full-stack decentralized NFT Marketplace built with **Solidity**, **Hardhat**, **Next.js**, **Ethers.js**, and **Tailwind CSS**. Users can mint, buy, sell, and resell NFTs — with metadata stored on **IPFS** via **Pinata**.

![Solidity](https://img.shields.io/badge/Solidity-0.8.4-363636?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-11-black?logo=next.js)
![Hardhat](https://img.shields.io/badge/Hardhat-2.8-yellow?logo=hardhat)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-2.2-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Mint NFTs** — Upload images to IPFS and mint ERC-721 tokens on-chain
- **Buy NFTs** — Browse the marketplace and purchase listed NFTs
- **Resell NFTs** — Relist purchased NFTs at a new price
- **Creator Dashboard** — View all NFTs you've listed for sale
- **My NFTs** — View all NFTs you currently own
- **Duplicate Detection** — Smart contract prevents duplicate image minting (SHA-256 hash-based)
- **Listing Fee** — Configurable listing fee (default: 0.025 ETH) collected by the contract owner

---

## 🛠️ Tech Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| **Smart Contract** | Solidity, OpenZeppelin (ERC721URIStorage, Ownable, Counters) |
| **Blockchain**     | Hardhat (local), Polygon Mumbai / Mainnet (production)       |
| **Frontend**       | Next.js 11, React 17, Tailwind CSS                           |
| **Web3**           | Ethers.js v5, Web3Modal                                      |
| **Storage**        | IPFS via Pinata                                               |
| **Testing**        | Hardhat + Waffle + Chai                                       |

---

## 📁 Project Structure

```
├── contracts/
│   └── NFTMarketplace.sol      # Main smart contract (ERC-721 + marketplace)
├── scripts/
│   └── deploy.js               # Deployment script
├── test/
│   └── sample-test.js          # Contract tests
├── pages/
│   ├── index.js                # Home — browse & buy NFTs
│   ├── create-nft.js           # Mint new NFTs
│   ├── my-nfts.js              # View owned NFTs
│   ├── resell-nft.js           # Resell an owned NFT
│   ├── dashboard.js            # Creator dashboard — listed NFTs
│   └── _app.js                 # App layout & navigation
├── styles/
│   ├── globals.css             # Tailwind imports
│   └── Home.module.css         # Page-specific styles
├── config.js                   # Deployed contract address
├── hardhat.config.js           # Hardhat configuration
├── tailwind.config.js          # Tailwind configuration
├── .env.example                # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [MetaMask](https://metamask.io/) browser extension
- [Pinata](https://app.pinata.cloud/) account (for IPFS uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/Dheeraj-1103/nft-marketplace.git
cd nft-marketplace
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
NEXT_PUBLIC_WORKSPACE_URL="http://127.0.0.1:8545"
NEXT_PUBLIC_PINATA_API_KEY="your_pinata_api_key"
PINATA_SECRET_KEY="your_pinata_secret_key"
INFURA_PROJECT_ID="your_infura_project_id"
```

### 4. Start the Local Blockchain

```bash
npx hardhat node
```

### 5. Deploy the Smart Contract

In a new terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will deploy the contract and update `config.js` with the contract address.

### 6. Configure MetaMask

1. Open MetaMask → **Add Network**
2. Network Name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Currency Symbol: `ETH`
6. Import a Hardhat test account using one of the private keys printed by `npx hardhat node`

### 7. Start the Frontend

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

```bash
npx hardhat test
```

---

## 📜 Smart Contract Overview

The `NFTMarketplace` contract ([`contracts/NFTMarketplace.sol`](contracts/NFTMarketplace.sol)) extends OpenZeppelin's `ERC721URIStorage` and `Ownable`:

| Function               | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `createToken()`        | Mints a new NFT and lists it on the marketplace        |
| `createMarketSale()`   | Buys a listed NFT, transferring ownership and funds     |
| `resellToken()`        | Relists an owned NFT at a new price                    |
| `fetchMarketItems()`   | Returns all unsold marketplace items                   |
| `fetchMyNFTs()`        | Returns NFTs owned by the caller                       |
| `fetchItemsListed()`   | Returns NFTs listed by the caller                      |
| `isContentOwned()`     | Checks if an image has already been minted             |
| `updateListingPrice()` | Owner can update the listing fee                       |
| `withdraw()`           | Owner can withdraw collected listing fees              |

---

## 🌐 Deploying to Polygon

To deploy to **Polygon Mumbai** testnet or **Polygon Mainnet**:

1. Get an [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/) API key
2. Add your credentials to `.env`
3. Uncomment the desired network in [`hardhat.config.js`](hardhat.config.js)
4. Deploy:

```bash
npx hardhat run scripts/deploy.js --network mumbai
# or
npx hardhat run scripts/deploy.js --network matic
```

5. Update the RPC URL in [`pages/index.js`](pages/index.js) to point to your provider instead of `localhost`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) — Secure smart contract libraries
- [Hardhat](https://hardhat.org/) — Ethereum development environment
- [Pinata](https://www.pinata.cloud/) — IPFS pinning service
- [Web3Modal](https://github.com/Web3Modal/web3modal) — Wallet connection library

