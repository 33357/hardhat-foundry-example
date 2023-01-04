import '@nomiclabs/hardhat-ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {getImplementationAddress} from '@openzeppelin/upgrades-core';
import {PayableOverrides} from 'ethers';
import {getDeployment, setDeployment, log} from '../utils';

task(`upgradeableContract:deploy`, `Deploy upgradeableContract`)
  .addOptionalParam('contract', 'The contract name')
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
    const contract = args['contract'];
    const operator = (await hre.ethers.getSigners())[0];

    log(`deploy ${contract}`);

    const Contract = await hre.ethers.getContractFactory(contract);
    const deployResult = await (<any>hre).upgrades.deployProxy(
      Contract,
      contractArgs,
      {kind: 'uups'},
      txConfig
    );
    const contractProxyAddress = deployResult.contractAddress;
    const contractImplAddress = await getImplementationAddress(
      hre.ethers.provider,
      contractProxyAddress
    );
    const contractFromBlock = deployResult.blockNumber;
    const _contract = Contract.attach(contractProxyAddress);
    const contractVersion = await _contract.implementationVersion();

    log(
      `${contract} deployed proxy at ${contractProxyAddress},impl at ${contractImplAddress},version ${contractVersion},fromBlock ${contractFromBlock}`
    );

    const deployment = await getDeployment(chainId);
    deployment[contract] = {
      proxyAddress: contractProxyAddress,
      implAddress: contractImplAddress,
      version: contractVersion,
      contract: contract,
      operator: operator.address,
      fromBlock: contractFromBlock,
    };
    await setDeployment(chainId, deployment);
  });
