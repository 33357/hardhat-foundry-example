import {
  CallOverrides,
  PayableOverrides,
  BigNumber,
  Signer,
  BigNumberish
} from 'ethers';

export interface ITokenClient {
  address(): string;

  /* ================ VIEW FUNCTIONS ================ */

  balanceOf(address: string, config?: CallOverrides): Promise<BigNumber>;

  /* ================ TRANSACTION FUNCTIONS ================ */

  transfer(
    to: string,
    amount: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void>;
}
