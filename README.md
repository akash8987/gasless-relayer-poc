# Gasless Relayer PoC

This repository demonstrates a complete end-to-end flow for **Meta-Transactions** using EIP-712. In this model, a user signs a structured message (a "permit" or "request") off-chain, and a Relayer submits that signature to the blockchain, paying the gas fees on the user's behalf.

## Features
* **EIP-712 Compliance**: Secure, typed data signing.
* **Minimalist Architecture**: All core logic contained in a flat directory for easy auditing.
* **OpenZeppelin Integration**: Leverages industry-standard security headers.

## Quick Start
1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Run the relayer simulation: `npx hardhat run relayer_script.js`
