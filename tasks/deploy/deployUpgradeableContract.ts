import '@nomiclabs/hardhat-ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getImplementationAddress} from '@openzeppelin/upgrades-core';
import {PayableOverrides} from 'ethers';
import {getDeployment, setDeployment, log} from '../utils';

task(`upgradeableContract:deploy`, `Deploy upgradeableContract`)
  .addOptionalParam('name', 'The contract name')
  .addOptionalParam('args', 'The contract args')
  .addOptionalParam('gasPrice', 'The gasPrice to transaction')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const txConfig: PayableOverrides = {};
    if (args['gasPrice']) {
      txConfig.gasPrice = hre.ethers.utils.parseUnits(args['gasPrice'], 'gwei');
    }
    if (args['maxPriorityFeePerGas']) {
      txConfig.maxFeePerGas = hre.ethers.utils.parseUnits(
        args['maxPriorityFeePerGas'],
        'gwei'
      );
      txConfig.maxPriorityFeePerGas = hre.ethers.utils.parseUnits(
        '0.1',
        'gwei'
      );
    }
    const contractArgs = JSON.parse(args['args']);
    const contractName = args['contract'];
    const operator = (await hre.ethers.getSigners())[0];

    log(`deploy ${contractName}`);

    const Contract = await hre.ethers.getContractFactory(contractName);
    const transaction = await (<any>hre).upgrades.deployProxy(
      Contract,
      contractArgs,
      {kind: 'uups'},
      txConfig
    );
    const result = await transaction.deployTransaction.wait();
    const contractProxyAddress = result.contractAddress;
    const contractImplAddress = await getImplementationAddress(
      hre.ethers.provider,
      contractProxyAddress
    );
    const contractFromBlock = result.blockNumber;
    const _contract = Contract.attach(contractProxyAddress);
    const contractVersion = await _contract.implementationVersion();

    log(
      `${contractName} deployed proxy at ${contractProxyAddress},impl at ${contractImplAddress},version ${contractVersion},fromBlock ${contractFromBlock}`
    );

    const deployment = await getDeployment(chainId);
    deployment[contractName] = {
      proxyAddress: contractProxyAddress,
      implAddress: contractImplAddress,
      version: contractVersion,
      name: contractName,
      operator: operator.address,
      fromBlock: contractFromBlock,
    };
    await setDeployment(chainId, deployment);
  });

