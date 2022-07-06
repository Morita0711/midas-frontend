import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Web3Service } from '../../services/web3.service';
import { NotificationUtils, SnackBarColorEnum } from 'src/utils/NotificationUtil';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as actions from '../../store';

@Component({
  selector: 'app-network-selector',
  templateUrl: './network-selector.component.html',
  styleUrls: ['./network-selector.component.scss'],
})
export class NetworkSelectorComponent implements OnInit {
  networks: any;
  currentNetwork: any;
  currentNetworkIndex = 0;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @Output() selectedNetwork = new EventEmitter();
  constructor(private notificationUtils: NotificationUtils, private store: Store<AppState>, public web3Service: Web3Service) {
    this.networks = this.web3Service.network;
    this.currentNetwork = this.web3Service.network[0];

    const netWorkSelected = localStorage.getItem('currentNetwork');
    if (netWorkSelected) {
      const currentNetworkIndex = parseInt(netWorkSelected, 10);
      this.networkSelectChange(currentNetworkIndex);
      this.currentNetworkIndex = currentNetworkIndex;
    } else {
      console.log("else")
      this.store.dispatch(actions.web3LoadNetwork({ network: this.currentNetwork }));
    }
  }

  ngOnInit(): void {
    this.store
      .select('web3')
      .pipe(
        takeUntil(this._unsubscribeAll),
        map((d) => {
          if (d.network) {
            this.currentNetwork = d.network;
            localStorage.setItem('currentNetwork', d.network.index.toString());
          }
        })
      )
      .subscribe();
  }

  networkSelectChange(event: any) {
    const netWorkSelected = this.networks[event];
    this.store.dispatch(
      actions.web3ChangeNetwork({
        network: netWorkSelected,
        chainId: netWorkSelected.params.chainId,
        params: netWorkSelected.params,
      })
    );
  }
}
