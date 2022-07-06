import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { faBurn, faLock, faCoins, faAtom, faBook, faFunnelDollar, faGear } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as actions from 'src/app/store/actions';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { slideInAnimation } from 'src/route-animations';
import { Web3Service } from '../services/web3.service';
import { AppState } from '../store';
import { NoWalletDialogComponent } from '../components/no-wallet-dialog/no-wallet-dialog.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  //animations: [slideInAnimation],
  /* encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush, */
})
export class LayoutComponent implements OnDestroy, OnInit {
  buttonLabel = 'Connect';
  account: any = undefined;
  mobileQuery: MediaQueryList;
  selectedNetwork = 0;
  // tslint:disable-next-line:variable-name
  private _mobileQueryListener: () => void;
  faburn = faBurn;
  falock = faLock;
  facoins = faCoins;
  faatom = faAtom;
  faGear = faGear;
  fabook = faBook;
  fadollar = faFunnelDollar;
  account$: Observable<string>;
  events: string[] = [];
  sidebarClosed = false;
  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public dialog: MatDialog,
    private store: Store<AppState>,
    private _web3Service: Web3Service
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    //if (this.mobileQuery.matches) this._web3Service.setNetworkId(this.selectedNetwork);
    this.store.dispatch(actions.web3Connect());
    this.account$ = this.store.select('web3').pipe(
      map((d) => d),
      switchMap((d) => of(d.account))
    );
    console.log(this.events)
  }

  ngOnInit(): void {
    this.loadContract();
  }

  loadContract() {
    const contract = localStorage.getItem('contract');
    if (contract) {
      const decryptContract = this._web3Service.decryptData(contract);
      const parseContract = JSON.parse(decryptContract);
      this.store.dispatch(actions.web3LoadToken({ contract: parseContract }));
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  // tslint:disable-next-line:typedef
  onNetworkChanged(event: any) {
    this.selectedNetwork = event;

    this._web3Service.setNetworkId(this.selectedNetwork);
  }

  onOpenDialog(): void {
    this.dialog.open(NoWalletDialogComponent);
  }

  onOpenSidebar(): void {
    this.sidebarClosed = true;
  }

  onCloseSidebar(): void {
    this.sidebarClosed = false;
  }
}
