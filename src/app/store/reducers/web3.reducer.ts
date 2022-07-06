import { createReducer, on } from '@ngrx/store';
import * as actions from '../actions';

export interface Web3State {
  account: any;
  bnbBalance: number | null;
  network: any;
  contract: any;
  statusToken: any;
  liquidityResult: any;
  lockLiquidityResult: any;
  burnTokensResult: any;
  errorMetamask: any;
}

export interface Web3AppState {
  web3: Web3State;
}

const initialState: Web3State = {
  account: null,
  network: null,
  contract: null,
  bnbBalance: null,
  statusToken: null,
  liquidityResult: null,
  lockLiquidityResult: null,
  burnTokensResult: null,
  errorMetamask: null,
};

const _reducer = createReducer(
  initialState,
  on(actions.web3LoadWallet, (state, { account, bnbBalance }) => ({
    ...state,
    account,
    bnbBalance,
  })),

  on(actions.web3LoadNetwork, (state, { network }) => ({ ...state, network })),
  on(actions.web3CleanError, (state) => ({ ...state, errorMetamask: null })),
  on(actions.web3ErrorMetamask, (state, { error }) => ({ ...state, errorMetamask: error })),
  on(actions.web3LoadToken, (state, { contract }) => ({ ...state, contract })),
  on(actions.web3CleanToken, (state) => ({ ...state, contract: initialState.contract })),

  on(actions.web3LoadStatusToken, (state, { statusToken }) => ({
    ...state,
    statusToken,
  })),
  on(actions.web3LoadLiquidity, (state, { liquidityResult }) => ({
    ...state,
    liquidityResult,
  })),
  on(actions.web3LoadLockLiquidity, (state, { lockLiquidityResult }) => ({
    ...state,
    lockLiquidityResult,
  })),
  on(actions.web3LoadBurnTokens, (state, { burnTokensResult }) => ({
    ...state,
    burnTokensResult,
  }))
);

export const web3Reducer = (state: any, action: any) => _reducer(state, action);
