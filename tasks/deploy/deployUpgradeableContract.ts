import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { PayableOverrides } from 'ethers';
import { getDeployment, setDeployment, log } from '../utils';

task(`upgradeableContract:deploy`, `deploy upgradeableContract`)
  .addOptionalParam('name', 'The contract name')
  .addOptionalParam('args', 'The contract args')
  .addOptionalParam('gasPrice', 'The gasPrice to transaction')
  .addOptionalParam('maxFeePerGas', 'The maxFeePerGas to transaction')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const txConfig: PayableOverrides = {};
    if (args['gasPrice']) {
      txConfig.gasPrice = hre.ethers.utils.parseUnits(args['gasPrice'], 'gwei');
    }
    if (args['maxFeePerGas']) {
      txConfig.maxFeePerGas = hre.ethers.utils.parseUnits(
        args['maxFeePerGas'],
        'gwei'
      );
      txConfig.maxPriorityFeePerGas = hre.ethers.utils.parseUnits(
        '0.1',
        'gwei'
      );
    }
    const contractArgs = JSON.parse(args['args']);
    const contractName = args['name'];
    const operator = (await hre.ethers.getSigners())[0];

    log(
      `deploy ${contractName}, operator:${operator.address
      }, args:${JSON.stringify(contractArgs)}, config: ${JSON.stringify(
        txConfig
      )}`
    );

    const Contract = await hre.ethers.getContractFactory(contractName);
    const contract = await hre.upgrades.deployProxy(
      Contract,
      contractArgs,
      { kind: 'uups' }
    );
    const deployed = await contract.deployTransaction.wait();
    const contractProxyAddress = deployed.contractAddress;
    const contractImplAddress = await getImplementationAddress(
      hre.ethers.provider,
      contractProxyAddress
    );
    const contractFromBlock = deployed.blockNumber;
    const contractVersion = await contract.version();

    log(
      `${contractName} deployed proxy at ${contractProxyAddress},impl at ${contractImplAddress},version ${contractVersion},fromBlock ${contractFromBlock}`
    );

    const deployment = await getDeployment(chainId);
    deployment[contractName] = {
      proxyAddress: contractProxyAddress,
      implAddress: contractImplAddress,
      version: contractVersion,
      operator: operator.address,
      fromBlock: contractFromBlock,
    };
    await setDeployment(chainId, deployment);
  });