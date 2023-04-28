import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { PayableOverrides } from 'ethers';
import { getDeployment, setDeployment, log } from '../utils';

task(`upgradeableContract:upgrade`, `upgrade upgradeableContract`)
    .addOptionalParam('proxyName', 'The proxyContract name')
    .addOptionalParam('implName', 'The implContract name')
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
        const proxyName = args['proxyName'];
        const implName = args['implName'];
        const operator = (await hre.ethers.getSigners())[0];
        const deployment = await getDeployment(
            chainId
        );

        log(
            `upgrade proxy ${proxyName},impl ${implName}, operator:${operator.address
            }, config: ${JSON.stringify(
                txConfig
            )}`
        );

        const contractProxyAddress = deployment[proxyName].proxyAddress;
        const implContract = await hre.ethers.getContractFactory(implName);
        const contract = await hre.upgrades.upgradeProxy(
            contractProxyAddress,
            implContract,
            { kind: 'uups' }
        );
        await contract.deployTransaction.wait();
        const contractImplAddress = await getImplementationAddress(
            hre.ethers.provider,
            contractProxyAddress
        );
        const contractVersion = await contract.version();

        log(
            `${proxyName} upgrade proxy at ${contractProxyAddress},impl at ${contractImplAddress},version ${contractVersion}`
        );

        deployment[proxyName] = {
            proxyAddress: contractProxyAddress,
            implAddress: contractImplAddress,
            version: contractVersion,
            operator: operator.address,
            fromBlock: deployment[proxyName].fromBlock,
        };
        await setDeployment(chainId, deployment);
    });