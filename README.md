# 🐙 IKA Dashboard

**IKA Network** is a high-performance, zero-trust Multi-Party Computation (MPC) network built on the Sui blockchain. It delivers sub-second latency, supports thousands of signer nodes, and can process up to 10,000 threshold signatures per second—enabling secure, real-time, cross-chain functionality without relying on bridges or wrapped tokens

At its core, IKA is powered by its novel **2PC-MPC** (two-party ECDSA plus MPC) protocol, which ensures non-collusive, cryptographically enforced signing where the user always participates, while hundreds of nodes collectively contribute to the signature process

### Why IKA Matters

- **Native Cross-Chain Control**: Sui smart contracts can directly manage assets on chains like Bitcoin and Ethereum through programmable wallets (dWallets), eliminating bridging risks
- **Unmatched Speed & Scale**: Achieves sub-second latency and handles thousands of signatures per second across hundreds of nodes
- **Zero-Trust Architecture**: No single node holds full control; every signature requires explicit user participation

### This Repository

This repository implements the **IKA Network’s SDK** and wraps it into an interactive **dashboard**, empowering developers to easily learn, experiment, and test cross-chain interactions using IKA.

#### Features

- Visual dashboard for interacting with IKA’s dWallets and 2PC-MPC flows  
- Example workflows for cross-chain asset control (e.g. signing transactions for Bitcoin, Ethereum)  
- Real-time status and metrics of IKA network operations  

### Getting Started

To add the IKA SDK to your own project, choose your preferred package manager:

```bash
# npm
npm install @ika.xyz/sdk

# pnpm
pnpm add @ika.xyz/sdk

# bun
bun add @ika.xyz/sdk

# yarn
yarn add @ika.xyz/sdk
