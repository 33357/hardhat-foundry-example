import { Provider } from '@ethersproject/providers';
import {
  BigNumber,
  BigNumberish,
  CallOverrides,
  PayableOverrides,
  Signer
} from 'ethers';
import { ITokenClient } from '..';
import { Token, Token__factory } from '../typechain';
import { ContractTransaction } from '../model';

export class TokenClient implements ITokenClient {
  public contract: Token;
  protected _provider: Provider | Signer;
  protected _errorTitle = 'XenBoxHelperClient';

  constructor(provider: Provider | Signer, address: string) {
    this._provider = provider;
    this.contract = Token__factory.connect(address, provider);
  }

  public address(): string {
    return this.contract.address;
  }

  /* ================ UTILS FUNCTIONS ================ */

  private _beforeTransaction() {
    if (this._provider instanceof Provider) {
      throw `${this._errorTitle}: no singer`;
    }
  }

  private async _afterTransaction(
    transaction: ContractTransaction,
    callback?: Function
  ): Promise<any> {
    if (callback) {
      callback(transaction);
    }
    const receipt = await transaction.wait();
    if (callback) {
      callback(receipt);
    }
  }

  /* ================ VIEW FUNCTIONS ================ */

  public async balanceOf(
    address: string,
    config?: CallOverrides
  ): Promise<BigNumber> {
    return this.contract.balanceOf(address, { ...config });
  }

  /* ================ TRANSACTION FUNCTIONS ================ */

  public async transfer(
    to: string,
    amount: BigNumberish,
    config?: PayableOverrides,
    callback?: Function
  ): Promise<void> {
    this._beforeTransaction();
    const transaction = await this.contract.transfer(to, amount, {
      ...config
    });
    await this._afterTransaction(transaction, callback);
  }
}
