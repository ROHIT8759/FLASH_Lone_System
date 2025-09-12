# LYNQ - Flash Loan DeFi Platform ⚡

A decentralized finance application that enables instant, collateral-free flash loans on the Ethereum blockchain. Built for traders, arbitrageurs, and DeFi enthusiasts seeking capital-efficient strategies.

![Flash Loan Platform](https://img.shields.io/badge/DeFi-Flash%20Loans-blue) ![React](https://img.shields.io/badge/React-18+-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6) ![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-627EEA)

## 🚀 Features

- **⚡ Flash Loans**: Borrow large amounts without collateral - repay in same transaction
- **🪙 Multi-Token Support**: ETH, USDC, USDT with automatic Wei conversion
- **🔐 Secure Web3 Integration**: MetaMask wallet connection with ethers.js v6
- **📝 Smart Validation**: Real-time hex bytes validation and error handling
- **💎 Modern UI**: Responsive design with Tailwind CSS and smooth animations
- **🔍 Transaction Tracking**: Real-time status updates and confirmation

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Blockchain**: ethers.js v6, Web3 integration
- **Smart Contract**: Solidity, deployed on Ethereum

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- MetaMask browser extension
- Ethereum testnet/mainnet access

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ROHIT8759/FLASH_Lone_System.git
cd LYNQ

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Select Loan Type**: Choose "Flash Loan" for instant borrowing
3. **Configure Parameters**:
   - Select token (ETH/USDC/USDT)
   - Enter loan amount
   - Provide execution data (hex bytes for your strategy)
4. **Submit Transaction**: Review and confirm in MetaMask
5. **Track Status**: Monitor transaction confirmation and results

## 🔧 Smart Contract

**Contract Address**: `0xd2a5bC10698FD955D1Fe6cb468a17809A08fd005`

### Key Functions:

- `requestFlashLoan(address token, uint256 amount, bytes params)` - Request flash loan
- `executeOperation(...)` - Callback for loan execution
- `withdraw(address token, uint256 amount)` - Withdraw funds

## 💡 Use Cases

- **Arbitrage Trading**: Exploit price differences across DEXs
- **Liquidation Bots**: Liquidate undercollateralized positions
- **Debt Refinancing**: Swap between lending protocols
- **Complex DeFi Strategies**: Multi-step transactions without capital

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

Built for DeFi innovation, enabling capital-efficient trading strategies through flash loans. Demonstrates advanced Web3 integration, smart contract interaction, and modern React development practices.

## ⚠️ Disclaimer

Flash loans are advanced DeFi tools. Always test on testnets first and understand the risks involved. This software is provided as-is for educational and development purposes.

---

**Made with ❤️ for the DeFi community**
