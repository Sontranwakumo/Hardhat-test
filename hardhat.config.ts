import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
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
    eth: {
      url: 'https://eth.llamarpc.com',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      }
    }
  }
};

export default config;
