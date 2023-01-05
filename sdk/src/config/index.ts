export interface ContractInfo {
  proxyAddress: string;
  implAddress: string;
  version: string;
  name: string;
  operator: string;
  fromBlock: number;
}

export interface Deployment {
  [contractName: string]: ContractInfo;
}

export interface DeploymentFull {
  [chainId: number]: Deployment;
}

import * as deploymentData from './deployment.json';
export const DeploymentInfo: DeploymentFull = deploymentData;
