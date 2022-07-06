import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MediaMatcher } from '@angular/cdk/layout';
import { TokenSourceCode } from './TokenSourceCode.js';
import { TokenAbi } from './TokenAbi.js';
import { MinTokenAbi } from './MinTokenAbi.js';
import { PancakeRouterAbi } from './PancakeRouterAbi.js';
import { LockLiquidityContractAbi } from './LockTokenAbi.js';
import { LPTokenAbi } from './LPTokenAbi.js';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as crypto from 'crypto-js';
import { MatDialog } from '@angular/material/dialog';
import Web3 from 'web3';

import { NotificationUtils } from 'src/utils/NotificationUtil';
import { dataNetwork, networkName } from '../blockchain/abis/selector';
import { networks } from '../blockchain/Networks';
import { environment } from 'src/environments/environment';
import { AppState } from '../store';
import * as actions from 'src/app/store/actions';
import { ApiService } from './api.service';
import { INetwork } from '../../../models/network.interface';

declare let window: any;

const abi = require('ethereumjs-abi');

//const Web3 = require('web3');

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  web3: any;
  account: any;
  jwt: any;
  enable: any;
  secret = environment.seed;
  dataNetwork: any;
  currentNetwork: number;
  private currentAccountSubject: BehaviorSubject<string>;
  public currentAccount: Observable<string>;

  private currentNetworkIdSubject: BehaviorSubject<number>;
  public currentNetworkId: Observable<number>;
  pancakeRouter: any;
  network: any = networks(environment.network);

  constructor(
    private http: HttpClient,
    private notificationUtils: NotificationUtils,
    public apiService: ApiService,
    media: MediaMatcher,
    private store: Store<AppState>
  ) {
    //this.web3 = new Web3("web3-provider-url");
    this.currentNetwork = parseInt(String(localStorage.getItem('currentNetwork')), 10);
    if (!this.currentNetwork) {
      this.currentNetwork = 0;
    }
    this.dataNetwork = dataNetwork('BSC');
    if (window.ethereum !== undefined) {
      if (typeof window.web3 !== 'undefined') {
        this.web3 = window.web3.currentProvider;
      } else {
        this.web3 = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      }

      window.web3 = new Web3(window.ethereum);

      console.log('network', this.currentNetwork);
      this.enable = this.enableMetaMaskAccount();

      this.pancakeRouter = new window.web3.eth.Contract(PancakeRouterAbi, this.network[this.currentNetwork].routerAddress);

      this.currentNetworkIdSubject = new BehaviorSubject<number>(this.currentNetwork);
      this.currentNetworkId = this.currentNetworkIdSubject.asObservable();

      // Detect Change Network
      window.ethereum.on('chainChanged', function (networkId) {
        if (media.matchMedia('(max-width: 700px)').matches) {
          console.log('networkChanged', networkId);
          const net: any = networks(environment.network);

          const newNet = net.find((e: any) => {
            return e.params.chainId == networkId;
          });

          console.log('newNet', newNet);

          store.dispatch(
            actions.web3ChangeNetwork({
              network: newNet.index,
              chainId: newNet.params.chainId,
              params: newNet.params,
            })
          );
          localStorage.setItem('currentNetwork', newNet.index.toString());
          setTimeout(async () => {
            window.location.reload();
          }, 1000);
        }
      });
    }
  }

  filesNetworks() {}

  changeNEtwork(networkId) {
    const network: any = networks(environment.network);
    console.log(network, networkId);
  }

  public connectWeb3(): Observable<any> {
    this.enable = this.enableMetaMaskAccount();
    const observable = from(this.enable);
    return observable;
  }

  public createToken(paymentToken, tokenName, tokenSymbol, tokenSupply, networkId) {
    console.log('paymentToken', paymentToken);
    console.log('tokenName', tokenName);
    console.log('tokenSymbol', tokenSymbol);
    console.log('tokenSupply', tokenSupply);
    console.log('networkId', networkId);
    const tokenCreated = this.generateToken(paymentToken, tokenName, tokenSymbol, tokenSupply, networkId);

    const observable = from(tokenCreated);

    return observable;
  }

  public changeNetwork(network: any, chainId: any, params: any) {
    const netWorkName = networkName(network.index);
    this.dataNetwork = dataNetwork(netWorkName);
    console.log('sdsd', this.dataNetwork);

    const newNetwork = this.connectNetwork(network, chainId, params);
    const observable = from(newNetwork);
    return observable;
  }

  /**************************************** */

  setNetworkId(id: number): void {
    console.log('set network id', id);

    this.currentNetworkIdSubject = new BehaviorSubject<number>(id);
    this.currentNetworkId = this.currentNetworkIdSubject.asObservable();
  }

  getNetworkId(): INetwork {
    let networdID = this.currentNetwork;
    this.currentNetworkId.subscribe((x: number) => {
      networdID = x;
    });
    return { id: networdID };
  }

  getWethAddress(): string {
    return this.network[this.currentNetworkIdSubject.value].acceptedPaymentTokens[0].address;
  }

  getRouterAddress(): string {
    console.log('current network value', this.currentNetworkIdSubject.value);

    return this.network[this.currentNetworkIdSubject.value].routerAddress;
  }

  getLockedAddress(): string {
    console.log('current network value', this.currentNetworkIdSubject.value);
    return this.network[this.currentNetworkIdSubject.value].lockLiquidityContractAddress;
  }

  getTokenCreatorAddress(): void {
    console.log('current network value', this.currentNetworkIdSubject.value);
    return this.network[this.currentNetworkIdSubject.value].tokenCreatorContractAddress;
  }

  // tslint:disable-next-line:typedef
  async getEstimatedTokensForBNB(tokenAddress) {
    const pair = await this.getPair(await this.getWethAddress(), tokenAddress);
    const lpTokenContract = new window.web3.eth.Contract(LPTokenAbi, pair);

    return await lpTokenContract.methods.getReserves().call();
  }

  private enableMetaMaskAccount(): Promise<any> {
    let enable = false;
    return new Promise<any>(async (resolve, reject) => {
      try {
        enable = window.ethereum.enable();

        this.enable = enable;
        const promiseAccount = await this.enable;
        const account = promiseAccount[0];

        this.account = account;
        await this.getAccount();

        // this.apiService.login(this.account).subscribe((res) => {
        //   this.jwt = res.token;
        //   console.log(res);
        // });

        const bnbBalance = Web3.utils.fromWei(await this.getBalance(), 'ether');
        resolve({ account, bnbBalance });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAccount(): Promise<any> {
    return (await new Promise((resolve, reject) => {
      window.web3.eth.getAccounts((err, retAccount) => {
        if (retAccount.length > 0) {
          this.currentAccountSubject = new BehaviorSubject<string>(retAccount[0]);

          this.currentAccount = this.currentAccountSubject.asObservable();

          this.currentNetworkIdSubject = new BehaviorSubject<number>(this.currentNetwork);
          this.currentNetworkId = this.currentNetworkIdSubject.asObservable();
          resolve(retAccount[0]);
        } else {
          // alert('transfer.service :: getAccount :: no accounts found.');
          reject('No accounts found.');
        }
        if (err != null) {
          // alert('transfer.service :: getAccount :: error retrieving account');
          reject('Error retrieving account');
        }
      });
    })) as Promise<any>;
  }

  async getChainId(): Promise<any> {
    return (await new Promise((resolve, reject) => {
      window.web3.eth.getChainId((err, retAccount) => {
        if (retAccount > 0) {
          this.currentNetwork = retAccount;
          this.currentNetworkIdSubject = new BehaviorSubject<number>(this.currentNetwork);
          this.currentNetworkId = this.currentNetworkIdSubject.asObservable();
          resolve(retAccount);
        } else {
          // alert('transfer.service :: getAccount :: no accounts found.');
          reject('No accounts found.');
        }
        if (err != null) {
          // alert('transfer.service :: getAccount :: error retrieving account');
          reject('Error retrieving account');
        }
      });
    })) as Promise<any>;
  }

  private connectNetwork(network: any, chainId: any, params: any) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        await this.web3.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        resolve(network);
      } catch (switchError) {
        console.log({ switchError });
        if (switchError.code === 4902) {
          try {
            await this.web3.request({
              method: 'wallet_addEthereumChain',
              params: [params],
            });
          } catch (addError) {
            // handle "add" error
            console.log(addError);
            resolve(network);
          }
        } else {
          reject(switchError);
        }
      }
    });
  }

  // tslint:disable-next-line:typedef
  async generateToken(paymentToken, tokenName, tokenSymbol, tokenSupply, networkId) {
    return new Promise(async (resolve, reject) => {
      try {
        // al recibir el netwokrId correcto podemos sustituir this.current...
        console.log('this.dataNetwork.GENERATOR_ABI', this.dataNetwork);
        console.log(
          'this.network[this.currentNetworkIdSubject.value].tokenCreatorContractAddress',
          this.network[this.currentNetworkIdSubject.value].tokenCreatorContractAddress
        );

        const createdToken = new window.web3.eth.Contract(
          this.dataNetwork.GENERATOR_ABI,
          this.network[this.currentNetworkIdSubject.value].tokenCreatorContractAddress
        );
        console.log('token', createdToken);
        tokenSupply = Web3.utils.toWei(tokenSupply.toString(), 'ether');
        const createPrice = await createdToken.methods.creationTokenPrice().call();
        // necesitamos encontrar un usdc en avalanche para continuar pero todo va a funcionar :)
        console.log({ createPrice });
        const createPriceBnb = await createdToken.methods
          .getRequiredEthAmount(this.network[this.currentNetworkIdSubject.value].contractNetworkName)
          .call();
        console.log('price in navite', createPriceBnb);
        const ownerAddress = await createdToken.methods.owner().call();
        const sendedValue =
          this.currentAccountSubject.value === ownerAddress
            ? 0
            : paymentToken !== (await this.getWethAddress())
            ? createPrice
            : createPriceBnb;

        console.log(sendedValue);
        const create = await createdToken.methods
          .createNewToken(
            paymentToken,
            this.currentAccountSubject.value,
            tokenName,
            tokenSymbol,
            tokenSupply,
            this.network[this.currentNetworkIdSubject.value].contractNetworkName
          )
          .send({
            from: this.currentAccountSubject.value,
            value: sendedValue.toString(),
          });

        await this.sleep(5000);

        const a = await window.web3.eth.getTransaction(create.transactionHash);
        const b = await window.web3.eth.getTransactionReceipt(create.transactionHash);
        const contractAddress = b.logs[10].address;
        create.contractAddress = contractAddress;

        const params = {
          contract_address: b.logs[10].address,
          network: this.currentNetworkIdSubject.value,
          token_owner: this.currentAccountSubject.value,
          token_name: tokenName,
          token_symbol: tokenSymbol,
          amount_token: tokenSupply,
        };
        // this.apiService.createToken(params, this.jwt).subscribe(() => {
        //   console.log('done');
        // });
        this.verifyContract(
          {
            tokenName,
            tokenSymbol,
            tokenSupply,
          },
          contractAddress,
          networkId
        ).subscribe(
          (r) => {
            Promise.all([a, b]).then(() => {
              console.log({r});
              const newCreate = {
                ...create,
                guid: r.result,
              };
              const parseData = this.encryptData(JSON.stringify(newCreate));
              localStorage.setItem('contract', parseData);
              resolve(newCreate);
            });
          },
          (error) => {
            console.log(error.result);
            reject(error);
          }
        );
      } catch (error) {
        console.log('error proocess create token');
        this.store.dispatch(actions.web3ErrorMetamask({ error }));
        reject(error);
      }
    });
  }

  // tslint:disable-next-line:typedef
  validateAddress(address) {
    return Web3.utils.isAddress(address);
  }

  // tslint:disable-next-line:typedef
  async getLockerPrice() {
    const lockLiquidityContract = new window.web3.eth.Contract(
      LockLiquidityContractAbi,
      this.network[this.currentNetworkIdSubject.value].lockLiquidityContractAddress
    );
    return await lockLiquidityContract.methods.lockServicePrice().call();
  }

  // tslint:disable-next-line:typedef
  private getBalance() {
    return window.web3.eth.getBalance(this.account);
  }

  // tslint:disable-next-line:typedef
  verifyContract(constructorArguments: any, contractAddress, networkId): Observable<any> {
    /*
          tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenSupply,
      MaxTxPercent,
      MaxWalletPercent,
      FeeReceiverWallet,
     */

    const encodedConstructorArguments = this.encodeTokenConstructor({
      tokenOwner: this.currentAccountSubject.value,
      tokenName: constructorArguments.tokenName,
      tokenSymbol: constructorArguments.tokenSymbol,
      supply: constructorArguments.tokenSupply,
    });
    console.log({ encodedConstructorArguments });
    const apiKey = this.network[this.currentNetworkIdSubject.value].explorerApiKey;
    const verifyApiUrl = this.network[this.currentNetworkIdSubject.value].verifyApiUrl;

    const data = {
      apikey: apiKey, // A valid API-Key is required
      module: 'contract', // Do not change
      action: 'verifysourcecode', // Do not change
      contractaddress: contractAddress, // Contract Address starts with 0x...
      sourceCode: TokenSourceCode, // Contract Source Code (Flattened if necessary)
      // tslint:disable-next-line:max-line-length
      codeformat: 'solidity-single-file', // solidity-single-file (default) or solidity-standard-json-input (for std-input-json-format support
      // tslint:disable-next-line:max-line-length
      contractname: 'Token', // ContractName (if codeformat=solidity-standard-json-input, then enter contractname as ex: erc20.sol:erc20)
      compilerversion: 'v0.8.14+commit.80d49f37', // see https://BscScan.com/solcversions for list of support versions
      optimizationUsed: 1, // 0 = No Optimization, 1 = Optimization used (applicable when codeformat=solidity-single-file)
      // tslint:disable-next-line:max-line-length
      runs: 1, // set to 200 as default unless otherwise  (applicable when codeformat=solidity-single-file)
      // tslint:disable-next-line:max-line-length
      constructorArguements: encodedConstructorArguments, // if applicable
      // tslint:disable-next-line:max-line-length
      evmversion: '', // leave blank for compiler default, homestead, tangerineWhistle, spuriousDragon, byzantium, constantinople, petersburg, istanbul (applicable when codeformat=solidity-single-file)
      licenseType: '3', // Valid codes 1-12 where 1=No License .. 12=Apache 2.0, see https://BscScan.com/contract-license-types
    };

    const formData: any = new FormData();
    formData.append('apikey', data.apikey);
    formData.append('module', data.module);
    formData.append('action', data.action);
    formData.append('contractaddress', data.contractaddress);
    formData.append('sourceCode', data.sourceCode);
    formData.append('codeformat', data.codeformat);
    formData.append('contractname', data.contractname);
    formData.append('compilerversion', data.compilerversion);
    formData.append('optimizationUsed', data.optimizationUsed);
    formData.append('runs', data.runs);
    formData.append('constructorArguements', data.constructorArguements);
    formData.append('evmversion', data.evmversion);
    formData.append('licenseType', data.licenseType);

    return this.http.post(verifyApiUrl, formData);
  }

  // tslint:disable-next-line:typedef
  async getPair(tokenAddressA, tokenAddressB) {
    const pancakeFactory = new window.web3.eth.Contract(this.dataNetwork.FACTORY_ABI, this.network[this.currentNetworkIdSubject.value].factoryAddress);
    const getPairResult = await pancakeFactory.methods.getPair(tokenAddressA, tokenAddressB).call();

    return getPairResult;
  }

  // tslint:disable-next-line:typedef
  async burnTokens(tokenAddress: string, amount) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const burnResult = await token.methods
      .burn(Web3.utils.toWei(amount.toString(), 'ether'))
      .send({ from: this.currentAccountSubject.value });

    return burnResult;
  }

  // tslint:disable-next-line:typedef
  percentage(percent, total) {
    return (percent / 100) * total;
  }

  // tslint:disable-next-line:typedef
  async removeLPTokens(tokenAddress: string, pairAddress: string, amount) {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const LpTokenContract = new window.web3.eth.Contract(LPTokenAbi, pairAddress);

    const nonce = await LpTokenContract.methods.nonces(this.currentAccountSubject.value).call();

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: 'Pancake LPs',
      version: '1',
      chainId: '0x61',
      verifyingContract: pairAddress,
    };
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const message = {
      owner: this.currentAccountSubject.value,
      spender: this.network[this.currentNetworkIdSubject.value].routerAddress,
      value: Web3.utils.toWei(amount.toString(), 'ether'),
      nonce: nonce.toString(16),
      deadline: deadline.toString(),
    };
    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    let r = '';
    let s = '';
    let v = 0;

    await window.web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'eth_signTypedData_v4',
        id: 999999999999,
        params: [this.currentAccountSubject.value, dataToSign],
        from: this.currentAccountSubject.value,
      },
      async (err, result) => {
        if (err) {
          return console.error(err);
        }
        const signature = result.result.substring(2);
        r = '0x' + signature.substring(0, 64);
        s = '0x' + signature.substring(64, 128);
        v = parseInt(signature.substring(128, 130), 16);

        const totalSupply = await LpTokenContract.methods.totalSupply().call();
        const totalReserves = await LpTokenContract.methods.getReserves().call();

        const Aout = (totalReserves[0] * amount) / totalSupply;
        const Bout = (totalReserves[1] * amount) / totalSupply;

        const minA = Aout - this.percentage(1, Aout);
        const minB = Bout - this.percentage(1, Bout);

        const pancakeRouter = new window.web3.eth.Contract(
          PancakeRouterAbi,
          this.network[this.currentNetworkIdSubject.value].routerAddress
        );

        const trans = await pancakeRouter.methods
          .removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
            tokenAddress,
            Web3.utils.toWei(amount.toString(), 'ether'),
            Web3.utils.toWei(minB.toString(), 'ether'),
            Web3.utils.toWei(minA.toString(), 'ether'),
            this.currentAccountSubject.value,
            deadline,
            false,
            v,
            r,
            s
          )
          .send({
            from: this.currentAccountSubject.value,
            value: '0',
          });
        return trans;
      }
    );
  }

  // tslint:disable-next-line:typedef
  async addLiquidity(tokenAddress: string, bnbAmount, tokenAmount, minBnbAmount, minTokenAmount: number) {
    bnbAmount = Number(bnbAmount);
    tokenAmount = Number(tokenAmount);
    minBnbAmount = Number(minBnbAmount);
    minTokenAmount = Number(minTokenAmount);

    const tokenA = await this.getWethAddress();
    const tokenB = tokenAddress;
    const amountADesired = bnbAmount;
    const amountAMin = minBnbAmount;
    const amountBDesired = tokenAmount;
    const amountBMin = minTokenAmount;
    const to = this.currentAccountSubject.value;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const addLiquidityResult = await this.pancakeRouter.methods
      .addLiquidityETH(
        tokenB,
        Web3.utils.toWei(amountBDesired.toString(), 'ether'), // desiredB
        Web3.utils.toWei(amountBMin.toString(), 'ether'), // minA
        Web3.utils.toWei(amountAMin.toString(), 'ether'), // minA
        to,
        deadline
      )
      .send({
        from: this.currentAccountSubject.value,
        value: Web3.utils.toWei(bnbAmount.toString(), 'ether'),
      });

    return addLiquidityResult;
  }

  // tslint:disable-next-line:typedef
  async lockLiquidity(tokenAddress: string, time: number, tokenAmount: number) {
    const lockLiquidityContract = new window.web3.eth.Contract(
      LockLiquidityContractAbi,
      this.network[this.currentNetworkIdSubject.value].lockLiquidityContractAddress
    );
    return await lockLiquidityContract.methods
      .lockTokens(
        await this.getPair(await this.getWethAddress(), tokenAddress),
        this.currentAccountSubject.value,
        Web3.utils.toWei(tokenAmount.toString(), 'ether'),
        time
      )
      .send({
        from: this.currentAccountSubject.value,
        value: await this.getLockerPrice(),
      });
  }

  // tslint:disable-next-line:typedef
  async withdrawLockedTokens(lockId) {
    const lockLiquidityContract = new window.web3.eth.Contract(
      LockLiquidityContractAbi,
      this.network[this.currentNetworkIdSubject.value].lockLiquidityContractAddress
    );
    return await lockLiquidityContract.methods.withdrawTokens(lockId).send({ from: this.currentAccountSubject.value });
  }

  // tslint:disable-next-line:typedef
  async getLocks() {
    const lockLiquidityContract = new window.web3.eth.Contract(
      LockLiquidityContractAbi,
      this.network[this.currentNetworkIdSubject.value].lockLiquidityContractAddress
    );
    const locksList = await lockLiquidityContract.methods.getDepositsByWithdrawalAddress(this.currentAccountSubject.value).call();
    const locksDetails = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < locksList.length; i++) {
      const lockDetails = await lockLiquidityContract.methods.getDepositDetails(locksList[i]).call();
      lockDetails.id = locksList[i];
      locksDetails.push(lockDetails);
    }
    return locksDetails;
  }

  // tslint:disable-next-line:typedef
  async getEstimatedTokensForETH(tokenAddress: string, tokenAmount: number) {
    const pancakeRouter = new window.web3.eth.Contract(PancakeRouterAbi, this.network[this.currentNetworkIdSubject.value].routerAddress);
    const path = await this.getPathForTokenETH(tokenAddress);
    const estimatedTokens = await pancakeRouter.methods.getAmountsIn(Web3.utils.toWei(tokenAmount.toString(), 'ether'), path).call();
    return estimatedTokens[0];
  }

  // tslint:disable-next-line:typedef
  async getEstimatedETHForTokens(tokenAddress: string, tokenAmount: number) {
    const pancakeRouter = new window.web3.eth.Contract(PancakeRouterAbi, this.network[this.currentNetworkIdSubject.value].routerAddress);
    const path = await this.getPathETHForToken(tokenAddress);
    const estimatedTokens = await pancakeRouter.methods.getAmountsIn(Web3.utils.toWei(tokenAmount.toString(), 'ether'), path).call();
    return estimatedTokens[0];
  }

  // tslint:disable-next-line:typedef
  async getPathForTokenETH(tokenAddress: string) {
    return [tokenAddress, await this.getWethAddress()];
  }

  // tslint:disable-next-line:typedef
  async getPathETHForToken(tokenAddress: string) {
    return [await this.getWethAddress(), tokenAddress];
  }

  // tslint:disable-next-line:typedef
  async getLPTokensBalance(tokenAddress: string) {
    const pairAddress = await this.getPair(await this.getWethAddress(), tokenAddress);
    const token = new window.web3.eth.Contract(LPTokenAbi, pairAddress);
    return await token.methods.balanceOf(this.currentAccountSubject.value).call();
  }

  // tslint:disable-next-line:typedef
  async getTokensBalance(tokenAddress: string) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);

    return await token.methods.balanceOf(this.currentAccountSubject.value).call();
  }

  // tslint:disable-next-line:typedef
  async getTokensName(tokenAddress: string) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    return await token.methods.name().call();
  }

  // tslint:disable-next-line:typedef
  async getTokenWhitelist(tokenAddress: string) {
    this.apiService.getWhitelist(tokenAddress, this.jwt).subscribe((res: string[]) => {
      return res;
    });
  }

  // tslint:disable-next-line:typedef
  async getTokenBlacklist(tokenAddress: string) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    return await token.methods.getBlacklist().call();
  }

  // tslint:disable-next-line:typedef
  async addAddressWhitelist(tokenAddress: string, address: string) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const res = await token.methods.addAddressWhitelist(address).call();
    const data = { contract_address: tokenAddress, address, status: true };
    this.apiService.insertWhitelist(data, this.jwt).subscribe((_) => {
      return res;
    });
  }

  // tslint:disable-next-line:typedef
  async addAddressBlacklist(tokenAddress: string) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    return await token.methods.addAddressWhitelist(tokenAddress).call();
  }

  // tslint:disable-next-line:typedef
  async isAllowed(address, spender) {
    // const pairAddress = await this.getPair(await this.getWethAddress(), address);
    const LPTokenBalance = await this.getLPTokensBalance(address);
    const isAddresAllowed =
      window.web3.utils.toWei(await this.getAddressAllowance(address, spender), 'ether') < window.web3.utils.toWei(LPTokenBalance, 'ether');
    return isAddresAllowed;
  }

  // tslint:disable-next-line:typedef
  async isLPAllowed(address, spender) {
    const LPTokenBalance = await this.getLPTokensBalance(address);
    const isAddresAllowed =
      window.web3.utils.toWei(await this.getLPAddressAllowance(address, spender), 'ether') >=
      window.web3.utils.toWei(LPTokenBalance, 'ether');
    return isAddresAllowed;
  }

  // tslint:disable-next-line:typedef
  async getAddressAllowance(address, spender) {
    const contract = new window.web3.eth.Contract(MinTokenAbi, address);

    const contractAllowance = await contract.methods.allowance(this.currentAccountSubject.value, spender).call(); // 29803630997051883414242659
    return contractAllowance;
  }

  // tslint:disable-next-line:typedef
  async getLPAddressAllowance(address, spender) {
    const pairAddress = await this.getPair(await this.getWethAddress(), address);
    const contract = new window.web3.eth.Contract(LPTokenAbi, pairAddress);
    const contractAllowance = await contract.methods.allowance(this.currentAccountSubject.value, spender).call(); // 29803630997051883414242659
    return contractAllowance;
  }

  // tslint:disable-next-line:typedef
  async approveToken(address, spender, amount) {
    const token = new window.web3.eth.Contract(MinTokenAbi, address);
    const approveResult = await token.methods
      .approve(spender, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
      .send({ from: this.currentAccountSubject.value });
    return approveResult;
  }

  // tslint:disable-next-line:typedef
  async setTransactionFeesManager(tokenAddress, newAddress) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setTransactionFeesManager(newAddress).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setMaxWalletAmount(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setMaxWalletAmount(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateMaxBuyLimit(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setMaxTransactionAmount(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async transferOwner(tokenAddress, newOwner) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.transferOwner(newOwner).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateGasLimitActive(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    console.log(token);
    const result = await token.methods.updateGasLimitActive(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setTaxes(tokenAddress, newArray) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setTaxes(newArray[0], newArray[1], newArray[2]).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setLpPair(tokenAddress, newPair, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setlpPair(newPair).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setPairAddress(tokenAddress, newPair) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setPairAddress(newPair).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateTransferDelayEnabled(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.updateTransferDelayEnabled(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateTransferToPoolsOnSwaps(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.updateTransferToPoolsOnSwaps(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateContractSwapEnabled(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.enableSwapEnabled(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateSwapThreshold(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setSwapThreshold(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateBUSDAddress(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.updateBUSDAddress(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setRouterAddress(tokenAddress, routerVal, busdVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setRouterAddress(routerVal, busdVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async excludeFromFee(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.excludeFromFee(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async excludeFromRewards(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.excludeFromRewards(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async isExcludedFromReward(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.isExcludedFromReward(newVal).call();
    return result;
  }

  // tslint:disable-next-line:typedef
  async isExcludedFromFee(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.isExcludedFromFee(newVal).call();
    return result;
  }

  // tslint:disable-next-line:typedef
  async includeInFee(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.includeInFee(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async includeInReward(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.includeInReward(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setLiquidityAddress(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setLiquidityAddress(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setEnableTrading(tokenAddress) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.enableTrading().send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setBusdBuyBurnAddress(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setBusdBuyBurnAddress(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setBusdReserveAddress(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setBusdReserveAddress(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setTimeDelayBetweenTx(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setTimeDelayBetweenTx(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async setTotalDelayTime(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.setTotalDelayTime(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async updateMaxGasPriceLimit(tokenAddress, newVal) {
    const token = new window.web3.eth.Contract(TokenAbi, tokenAddress);
    const result = await token.methods.updateMaxGasPriceLimit(newVal).send({ from: this.currentAccountSubject.value });
    return result;
  }

  // tslint:disable-next-line:typedef
  async approveLPToken(address, spender, amount) {
    const pairAddress = await this.getPair(await this.getWethAddress(), address);
    const token = new window.web3.eth.Contract(LPTokenAbi, pairAddress);
    const approveResult = await token.methods
      .approve(spender, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
      .send({ from: this.currentAccountSubject.value });
    return approveResult;
  }

  // tslint:disable-next-line:typedef
  encodeTokenConstructor(data: any) {
    /*
          account: this.currentAccountSubject.value,
      tokenName: constructorArguments.tokenName,
      tokenSymbol: constructorArguments.tokenSymbol,
      decimal: constructorArguments.tokenDecimals,
      amountOfTokenWei: constructorArguments.tokenSupply,
      MaxTxPercent: constructorArguments.MaxTxPercent,
      MaxWalletPercent: constructorArguments.MaxWalletPercent,
      feeWallet: constructorArguments.FeeReceiverWallet,
     */

    const x = abi.simpleEncode(
      'constructor(address,string,string,uint256)',
      this.currentAccountSubject.value,
      data.tokenName,
      data.tokenSymbol,
      data.supply
    );

    const r = x.toString('hex').substring(8);
    return r;
  }

  /**
   * Encripted Data
   *
   * @param data
   */
  encryptData(data: string): string {
    try {
      return crypto.AES.encrypt(JSON.stringify(data), this.secret).toString();
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  /**
   * DesEncript Data
   *
   * @param data
   */
  decryptData(data: string) {
    try {
      const bytes = crypto.AES.decrypt(data, this.secret);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(crypto.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  sleep = (waitTimeInMs) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
}
