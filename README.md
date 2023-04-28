# <h1 align="center"> Hardhat x Foundry Template </h1>

**Template repository for getting started quickly with Hardhat and Foundry in one project**

![Github Actions](https://github.com/devanonon/hardhat-foundry-template/workflows/test/badge.svg)

### Install

```bash
yarn i
```

### Build

```bash
yarn build
```

### Test
forge test
```bash
yarn test -vvvv
```

forge fork test
```bash
source envs/eth.env

yarn test -vvvv --fork-url $PROVIDER
```

hardhat test
```bash
yarn testh
```

hardhat coverage test
```bash
yarn testc
```

### Env

```bash
source envs/eth.env
source envs/bsc.env
source envs/pol.env

PRIVATE_KEY=
SCAN_API_KEY=
PROVIDER=
NETWORK_ID=
ENV_FILE=envs/eth.env
```

### Deploy

```bash
yarn run env-cmd -f $ENV_FILE yarn run hardhat contract:deploy --name Token --gas-price 3 --args '[]' --network $NETWORK_ID

yarn run env-cmd -f $ENV_FILE yarn run hardhat upgradeableContract:deploy --name TokenUpgradeable --gas-price 3 --args '[]' --network $NETWORK_ID
```

### Upgrade

```bash
yarn run env-cmd -f $ENV_FILE yarn run hardhat upgradeableContract:upgrade --proxy-name TokenUpgradeable --impl-name TokenUpgradeable --gas-price 3 --network $NETWORK_ID
```

### Verfiy
```bash
yarn run env-cmd -f $ENV_FILE yarn run hardhat contract:verify --name Token --args '[]' --network $NETWORK_ID

yarn run env-cmd -f $ENV_FILE yarn run hardhat upgradeableContract:verify --name TokenUpgradeable --args '[]' --network $NETWORK_ID
```

### Notes

Whenever you install new libraries using Foundry, make sure to update your `remappings.txt` file by running `forge remappings > remappings.txt`. This is required because we use `hardhat-preprocessor` and the `remappings.txt` file to allow Hardhat to resolve libraries you install with Foundry.
