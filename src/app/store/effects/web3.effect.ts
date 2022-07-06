/* eslint-disable arrow-parens */
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from '../actions';
import { map, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Web3Service } from '../../services/web3.service';

@Injectable()
export class Web3Effects {
  createToken$ = createEffect((): any =>
    this.actions$.pipe(
      ofType(actions.web3createToken),
      mergeMap(
        ({
          paymentToken,
          tokenName,
          tokenSymbol,
          tokenSupply,
          networkId,
        }) =>
          this._web3Service
            .createToken(
              paymentToken,
              tokenName,
              tokenSymbol,
              tokenSupply,
              networkId
            )
            .pipe(
              map((data) => {
                return actions.web3LoadToken({ contract: data });
              })
            )
      )
    )
  );

  connect$ = createEffect((): any =>
    this.actions$.pipe(
      ofType(actions.web3Connect),
      mergeMap(() =>
        this._web3Service.connectWeb3().pipe(map(({ account, bnbBalance }) => actions.web3LoadWallet({ account, bnbBalance })))
      )
    )
  );

  changeNetwork$ = createEffect((): any =>
    this.actions$.pipe(
      ofType(actions.web3ChangeNetwork),
      mergeMap(({ network, chainId, params }) =>
        this._web3Service.changeNetwork(network, chainId, params).pipe(map((data) => actions.web3LoadNetwork({ network: data })))
      )
    )
  );

  constructor(private actions$: Actions, private _web3Service: Web3Service) {}
}
