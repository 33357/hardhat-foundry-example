import '@nomiclabs/hardhat-ethers';
import {task} from 'hardhat/config';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {log, getDeployment} from '../utils';

task(`contract:verify`, `verify contract`)
  .addOptionalParam('contract', 'The contract name')
  .addOptionalParam('args', 'The contract args')
  .addOptionalParam('address', 'The contract address')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const contract = args['contract'];
    const contractArgs = JSON.parse(args['args']);
    const deployment = await getDeployment(
      (
        await hre.ethers.provider.getNetwork()
      ).chainId
    );
    const address = args['address']
      ? args['address']
      : deployment[contract].implAddress;

    log(`verify ${contract}, address: ${address}`);

    await hre.run('verify:verify', {
      address: address,
      constructorArguments: contractArgs,
    });
  });
