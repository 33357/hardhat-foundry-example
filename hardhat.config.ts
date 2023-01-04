import fs from 'fs';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-preprocessor';
import '@nomiclabs/hardhat-etherscan';
import {HardhatUserConfig} from 'hardhat/config';
import dotenv from 'dotenv';
dotenv.config();

if (fs.existsSync('./sdk/src/typechain')) {
  import('./tasks');
}

function getRemappings() {
  return fs
    .readFileSync('remappings.txt', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => line.trim().split('='));
}

const mnemonic = 'test test test test test test test test test test test junk';
const privateKey = process.env.PRIVATE_KEY;
let accounts;
if (privateKey) {
  accounts = [privateKey];
} else {
  accounts = {
    mnemonic,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    1: {
      url: process.env.PROVIDER ? process.env.PROVIDER : '',
      accounts,
      timeout: 60000,
    },
  },
  paths: {
    sources: './src', // Use ./src rather than ./contracts as Hardhat expects
    cache: './cache_hardhat', // Use a different cache for Hardhat than Foundry
  },
  typechain: {
    outDir: './sdk/src/typechain',
    target: 'ethers-v5',
  },
  // This fully resolves paths for imports in the ./lib directory for Hardhat
  preprocess: {
    eachLine: () => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          getRemappings().forEach(([find, replace]) => {
            if (line.match(find) && find != '@openzeppelin/') {
              line = line.replace(find, replace);
            }
          });
        }
        return line;
      },
    }),
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY,
  },
};

export default config;
