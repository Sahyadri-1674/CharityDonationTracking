require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test",
  },
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "PRIVATE KEY 1",
        "PRIVATE KEY 2",
      ],
    },
  },
};
