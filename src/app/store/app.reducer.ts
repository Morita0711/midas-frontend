import { ActionReducerMap } from '@ngrx/store';
import * as reducers from '.';
import { Web3AppState } from './reducers';
export interface AppState extends Web3AppState {
  web3: reducers.Web3State;
}

export const appReducers: ActionReducerMap<AppState> = {
  web3: reducers.web3Reducer,
};
