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
yarn test
```

forge fork test
```bash
source envs/eth.env
yarn test --fork-url $PROVIDER
```

hardhat test
```bash
yarn testh
```

hardhat coverage test
```bash
yarn testc
```

### Notes

Whenever you install new libraries using Foundry, make sure to update your `remappings.txt` file by running `forge remappings > remappings.txt`. This is required because we use `hardhat-preprocessor` and the `remappings.txt` file to allow Hardhat to resolve libraries you install with Foundry.
