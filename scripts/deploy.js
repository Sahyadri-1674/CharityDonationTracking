const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Charity = await ethers.getContractFactory("CharityDonationSystem");
  const charity = await Charity.deploy(); // Deploy the contract

  await charity.waitForDeployment(); // Newer way to wait for deployment

  console.log("Contract address:", await charity.getAddress()); // Use getAddress()

  // Optional: Save contract address
  fs.writeFileSync(".env", `CONTRACT_ADDRESS=${await charity.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
