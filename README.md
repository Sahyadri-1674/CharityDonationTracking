
## Project Overview
This is a Charity Donation Tracking dApp that enables users to create, donate, and track charity campaigns transparently on the Ethereum blockchain. The project is built using Solidity, Hardhat, React.js, and Pinata for IPFS storage.

Users can:
✅ Create charity campaigns with title, description, documents (images, PDFs, videos via IPFS), category, goal amount, and deadline.
✅ Donate to campaigns and leave a message.
✅ View donor details (address, amount, message) on campaign pages.
✅ Withdraw funds after the campaign deadline.
✅ Filter campaigns by category.

## Project Setup Guide
1. Clone the Repository
 ```shell
git clone https://github.com/CharityDonationTracking.git
cd CharityDonationTracking
```
3. Setup Ganache for Local Blockchain Testing
Ganache provides a personal Ethereum blockchain to test smart contracts.

Step 1: Install Ganache
Download: Ganache
Install and launch Ganache.
Step 2: Create a New Workspace
Click on Quickstart Ethereum to start a local blockchain.
Note the RPC Server URL (default: http://127.0.0.1:7545).
Note down the 12-word mnemonic phrase shown in the Accounts section.

3. Install Dependencies
In the project root, install all dependencies:
```shell
npm install
```

5. Hardhat Setup
Hardhat is a development environment for Ethereum smart contracts.

Step 1: Install Hardhat
```shell
npm install --save-dev hardhat
```
Step 2: Compile Smart Contracts
```shell
npx hardhat compile
```
Step 3: Deploy Smart Contract Locally (Ganache)
Update hardhat.config.js to use the Ganache network:
```shell
module.exports = {
  solidity: "0.8.18",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [ "your-private-key-here" ]
    }
  }
};
```
Run deployment:
```shell
npx hardhat run scripts/deploy.js --network ganache
```
Copy the deployed contract address for the next step.

5. Configure MetaMask with Ganache
Step 1: Import Ganache Network
Open MetaMask, go to Settings > Networks
Click Add Network and enter:
Network Name: Ganache
New RPC URL: http://127.0.0.1:7545
Chain ID: 1337 (default for Ganache)
Currency Symbol: ETH
Click Save.
Step 2: Import Ganache Account
Copy one private key from the Ganache accounts list.
Open MetaMask > Import Account.
Paste the private key and click Import.

6. Configure .env File
Create a .env file in the root directory.

7. Run the Frontend
Step 1: Start Development Server
```shell
npm run dev
```
Open http://localhost:5173/ in your browser.
