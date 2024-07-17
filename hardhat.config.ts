import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// seed phrase test: test test test test test test test test test test test junk"
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: 'http://localhost:8545/'
    },
  }
};

export default config;
