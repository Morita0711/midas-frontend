import { createAction, props } from '@ngrx/store';

const name = 'WEB3';

// Account
export const web3Connect = createAction(`[${name}] CONNECT`);
export const web3LoadWallet = createAction(`[${name}] LOAD WALLET`, props<{ account: string; bnbBalance: number }>());
// Networdks
export const web3ChangeNetwork = createAction(`[${name}] CHANGE NETWORK`, props<{ network: any; chainId: any; params: any }>());
export const web3LoadNetwork = createAction(`[${name}] LOAD NETWORK`, props<{ network: any }>());

// Token
export const web3createToken = createAction(
  `[${name}] CREATE TOKEN`,
  props<{
    paymentToken;
    tokenName;
    tokenSymbol;
    tokenSupply;
    networkId;
  }>()
);
export const web3LoadToken = createAction(`[${name}] LOAD TOKEN`, props<{ contract: any }>());
export const web3CleanToken = createAction(`[${name}] CLEAN TOKEN`);
export const web3VerifyToken = createAction(`[${name}] VERIFY TOKEN`, props<{ token: any }>());
export const web3AproveToken = createAction(`[${name}] APROVE TOKEN`, props<{ tokenAddress: string }>());
export const web3LoadStatusToken = createAction(`[${name}] LOAD STATUS TOKEN`, props<{ statusToken: any }>());
export const web3AddLiquidity = createAction(
  `[${name}] ADD LIQUIDITY`,
  props<{
    tokenAddress: string;
    bnbAmount: number;
    tokenAmount: number;
    minBnbTokenAmount: number;
    minTokenAmount: number;
  }>()
);
export const web3LoadLiquidity = createAction(`[${name}] LOAD LIQUIDITY`, props<{ liquidityResult: any }>());

export const web3LockLiquidity = createAction(`[${name}] LOCK LIQUIDITY`, props<{ tokenAddress: string; time: number }>());
export const web3LoadLockLiquidity = createAction(`[${name}] LOAD LOCK LIQUIDITY`, props<{ lockLiquidityResult: any }>());

export const web3BurnTokens = createAction(`[${name}] BURN TOKENS`, props<{ tokenAddress: string; amount: number }>());
export const web3LoadBurnTokens = createAction(`[${name}] LOAD BURN TOKENS`, props<{ burnTokensResult: any }>());
export const web3ErrorMetamask = createAction(`[${name}] ERROR METAMASK`, props<{ error: any }>());
export const web3CleanError = createAction(`[${name}] CLEAN ERROR METAMASK`);
