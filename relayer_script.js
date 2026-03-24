const hre = require("hardhat");

async function main() {
  const [relayer, user] = await hre.ethers.getSigners();
  
  // Deploy Contract
  const GaslessToken = await hre.ethers.getContractFactory("GaslessToken");
  const token = await GaslessToken.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  
  console.log(`Token deployed at: ${tokenAddr}`);
  console.log(`Relayer address (paying gas): ${relayer.address}`);

  // Define Meta-Transaction Data
  const amount = hre.ethers.parseEther("100");
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const nonce = await token.nonces(user.address);

  // EIP-712 Domain
  const domain = {
    name: "GaslessToken",
    version: "1",
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    verifyingContract: tokenAddr
  };

  // Types
  const types = {
    Execute: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const value = {
    owner: user.address,
    spender: relayer.address,
    value: amount,
    nonce: nonce,
    deadline: deadline
  };

  // User signs the message (no gas cost)
  const signature = await user.signTypedData(domain, types, value);
  const sig = hre.ethers.Signature.from(signature);

  // Relayer submits the transaction (pays gas)
  console.log("Relayer submitting transaction...");
  const tx = await token.connect(relayer).executeMetaTransaction(
    user.address,
    relayer.address,
    amount,
    deadline,
    sig.v,
    sig.r,
    sig.s
  );

  await tx.wait();
  console.log("Meta-transaction successful! Allowance updated.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
