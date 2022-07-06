import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { MatSliderChange } from '@angular/material/slider';
import { faCheck, faExclamationTriangle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificationUtils, SnackBarColorEnum } from 'src/utils/NotificationUtil';
import { MatDialog } from '@angular/material/dialog';
import { RemoveLiquidityDialogComponent } from '../remove-liquidity-dialog/remove-liquidity-dialog.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import * as actions from 'src/app/store/actions';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

declare let require: any;
declare let window: any;
const Web3 = require('web3');

@Component({
  selector: 'app-add-liquidity',
  templateUrl: './add-liquidity.component.html',
  styleUrls: ['./add-liquidity.component.scss'],
})
export class AddLiquidityComponent implements OnInit, OnDestroy {
  tokenAddressInputFormGroup: FormGroup;
  burnTokenAddressInputFormGroup: FormGroup;
  tokenBalance: any = 0;
  lpTokenBalance: any = 0;
  bnbBalance$: Observable<number>;
  approveButtonLabel = 'Approve Token';
  approveButtonIcon: IconDefinition = faCheck;
  tokenApproved = false;
  isApproving = false;
  isLoading = false;
  isAllowed = false;
  addBnbLiquidityQuantityPercent = 0;
  addTokenLiquidityQuantityPercent = 0;
  @ViewChild('slider') slider;
  @ViewChild('addLiquidityBnbSlider') addLiquidityBnbSlider;
  @ViewChild('liquidityTokenAddress') tokenAddressInput: ElementRef;
  addLiquidityForm = {
    bnbAmount: 0,
    tokenAmount: 0,
  };
  isFetchingLpBalance = false;
  account$: Observable<string>;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    public web3Service: Web3Service,
    private formBuilder: FormBuilder,
    private notificationUtils: NotificationUtils,
    public dialog: MatDialog,
    private store: Store<AppState>
  ) {
    this.createForm();

    this.connectWeb3().then((r) => {});

    this.store.dispatch(actions.web3Connect());
    this.account$ = this.store.select('web3').pipe(
      map((d) => d),
      switchMap((d) => of(d.account))
    );
    this.bnbBalance$ = this.store.select('web3').pipe(
      map((d) => d),
      switchMap((d) => of(d.bnbBalance))
    );
  }

  ngOnInit(): void {
    this.loadContract();
  }

  loadContract() {
    this.store
      .select('web3')
      .pipe(
        takeUntil(this._unsubscribeAll),
        map((d) => {
          if (d && d.contract) {
            setTimeout(() => {
              this.tokenAddressInputFormGroup.patchValue({
                liquidityTokenAddress: d.contract.contractAddress,
              });
              this.onLiquidityTokenAddressKeyup().then();
            }, 1000);
          }
        })
      )
      .subscribe();
  }

  // tslint:disable-next-line:typedef
  public async connectWeb3() {}

  // tslint:disable-next-line:typedef
  async addLiquidity() {
    const bnbAmount = this.addLiquidityForm.bnbAmount;
    const tokenAmount = this.addLiquidityForm.tokenAmount;
    const minTokenAmount = Number(Number(tokenAmount) - Number(this.percentage(Number(tokenAmount), 1)));
    const minBnbTokenAmount = Number(Number(bnbAmount) - Number(this.percentage(Number(bnbAmount), 1)));

    const tokenAddress = this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value;
    this.web3Service
      .addLiquidity(tokenAddress, bnbAmount, tokenAmount, minBnbTokenAmount, minTokenAmount)
      .then(async (r2) => {
        this.isFetchingLpBalance = true;

        this.tokenBalance = Number(Web3.utils.fromWei(await this.getTokenBalance(tokenAddress), 'ether'))
          .toFixed(8)
          .toString();

        this.lpTokenBalance = Number(Web3.utils.fromWei(await this.getLPTokenBalance(tokenAddress), 'ether'));

        /*
        this.lockLiquidityTokenAddressInputFormGroup.controls.lockLiquidityTokenAddress.setValue(
          pairAddress
        );
        */

        this.slider.value = 0;
        this.addLiquidityForm.tokenAmount = 0;
        this.addLiquidityBnbSlider.value = 0;
        this.addLiquidityForm.bnbAmount = 0;

        this.isFetchingLpBalance = false;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  mapValue(x, inMin, inMax, outMin, outMax) {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  // tslint:disable-next-line:typedef
  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value + '%';
  }

  // tslint:disable-next-line:typedef
  async tokenInputKeyUp() {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(this.burnTokenAddressInputFormGroup.controls.burnTokenAddress.value);
    if (isValid) {
      this.tokenBalance = Number(
        Web3.utils.fromWei(await this.getTokenBalance(this.burnTokenAddressInputFormGroup.controls.burnTokenAddress.value), 'ether')
      )
        .toFixed(8)
        .toString();
    } else {
      this.tokenBalance = 0;
    }
  }

  // tslint:disable-next-line:typedef
  async approveToken() {
    this.isApproving = true;
    this.approveButtonLabel = 'Approving';
    const tokenAddress = this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value;
    const bnbAmount = this.addLiquidityForm.bnbAmount.toString();
    const tokenAmount = this.addLiquidityForm.tokenAmount.toString();
    const routerAddress = this.web3Service.getRouterAddress();
    await this.web3Service
      .approveToken(tokenAddress, routerAddress, tokenAmount)
      .then((r) => {
        if (r) {
          this.isAllowed = true;
          this.isApproving = false;
          this.approveButtonLabel = 'Approved';
        }
      })
      .catch((err) => {
        this.isAllowed = false;
        this.isApproving = false;
        this.approveButtonLabel = 'Not Approved';
        this.approveButtonIcon = faExclamationTriangle;
      });
  }

  // tslint:disable-next-line:typedef
  setTokenPercent(percent) {
    this.addLiquidityForm.tokenAmount = this.percentage(percent, this.tokenBalance);
    const value = this.mapValue(Number(this.addLiquidityForm.tokenAmount), 0, this.tokenBalance, 0, 100);
    this.slider.value = value;
  }

  // tslint:disable-next-line:typedef
  percentage(percent, total) {
    return (percent / 100) * total;
  }

  // tslint:disable-next-line:typedef
  async setBnbPercent(percent, bnbBalance: number) {
    console.log(bnbBalance);

    this.addLiquidityForm.bnbAmount = this.percentage(percent, bnbBalance);
    const value = this.mapValue(Number(this.addLiquidityForm.bnbAmount), 0, bnbBalance, 0, 100);
    this.addLiquidityBnbSlider.value = value;

    const estimate = await this.web3Service.getEstimatedTokensForBNB(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value);
    const ratio = estimate['0'] / estimate['1'];
    const addLiquidityTokenAmount = ratio * this.addLiquidityForm.bnbAmount;

    if (!isNaN(Number(addLiquidityTokenAmount))) {
      const value2 = this.mapValue(Number(addLiquidityTokenAmount), 0, this.tokenBalance, 0, 100);
      this.slider.value = value2;

      this.addLiquidityForm.tokenAmount = addLiquidityTokenAmount;
    }
  }

  // tslint:disable-next-line:typedef
  async bnbInputKeyUp(bnbBalance: number) {
    const estimate = await this.web3Service.getEstimatedTokensForBNB(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value);
    const ratio = estimate['0'] / estimate['1'];
    const addLiquidityTokenAmount = ratio * this.addLiquidityForm.bnbAmount;

    const value = this.mapValue(Number(this.addLiquidityForm.bnbAmount), 0, bnbBalance, 0, 100);
    this.addLiquidityBnbSlider.value = value;

    if (!isNaN(Number(addLiquidityTokenAmount))) {
      const value2 = this.mapValue(Number(addLiquidityTokenAmount), 0, this.tokenBalance, 0, 100);
      this.slider.value = value2;

      this.addLiquidityForm.tokenAmount = addLiquidityTokenAmount;
    }
  }

  // tslint:disable-next-line:typedef
  onSlideToken(event: MatSliderChange) {
    this.addTokenLiquidityQuantityPercent = Number(event.value);
    this.addLiquidityForm.tokenAmount = this.mapValue(Number(event.value), 0, 100, 0, this.tokenBalance);

    const value2 = this.mapValue(Number(this.addLiquidityForm.tokenAmount), 0, this.tokenBalance, 0, 100);
    this.addLiquidityBnbSlider.value = value2;
  }

  // tslint:disable-next-line:typedef
  async onSlide(event: MatSliderChange, bnbBalance: number) {
    this.addBnbLiquidityQuantityPercent = Number(event.value);
    this.addLiquidityForm.bnbAmount = this.mapValue(Number(event.value), 0, 100, 0, bnbBalance);

    const estimate = await this.web3Service.getEstimatedTokensForBNB(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value);
    const ratio = estimate['0'] / estimate['1'];
    const addLiquidityTokenAmount = ratio * this.addLiquidityForm.bnbAmount;

    if (!isNaN(Number(addLiquidityTokenAmount))) {
      const value2 = this.mapValue(Number(addLiquidityTokenAmount), 0, this.tokenBalance, 0, 100);
      this.slider.value = value2;

      this.addLiquidityForm.tokenAmount = addLiquidityTokenAmount;
    }
  }

  // tslint:disable-next-line:typedef
  async onLiquidityTokenAddressKeyup() {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value);

    if (isValid) {
      this.isFetchingLpBalance = true;

      this.tokenBalance = Number(
        Web3.utils.fromWei(await this.getTokenBalance(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value), 'ether')
      )
        .toFixed(8)
        .toString();
      this.lpTokenBalance = Number(
        Web3.utils.fromWei(await this.getLPTokenBalance(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value), 'ether')
      );
      this.isAllowed = await this.web3Service.isAllowed(
        this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value,
        this.web3Service.getRouterAddress()
      );

      this.isFetchingLpBalance = false;
    } else {
      this.tokenBalance = 0;
    }
  }

  async openRemoveLiquidityDialog(): Promise<void> {
    const pairAddress = await this.web3Service.getPair(
      await this.web3Service.getWethAddress(),
      this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value
    );
    const dialogRef = this.dialog.open(RemoveLiquidityDialogComponent, {
      data: {
        lpTokenBalance: this.lpTokenBalance,
        address: this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value,
        pairAddress,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.notificationUtils.showSnackBar(`The LP token was removed successfully`, SnackBarColorEnum.Green);

        this.isFetchingLpBalance = true;

        this.tokenBalance = Number(
          Web3.utils.fromWei(await this.getTokenBalance(this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.value), 'ether')
        )
          .toFixed(8)
          .toString();
        this.lpTokenBalance = Number(Web3.utils.fromWei(await this.getLPTokenBalance(pairAddress), 'ether'));
      }

      this.isFetchingLpBalance = false;
    });
  }

  // tslint:disable-next-line:typedef
  async getTokenBalance(tokenAddress) {
    return await this.web3Service.getTokensBalance(tokenAddress);
  }

  // tslint:disable-next-line:typedef
  createForm() {
    this.tokenAddressInputFormGroup = this.formBuilder.group({
      liquidityTokenAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
    });
    this.burnTokenAddressInputFormGroup = this.formBuilder.group({
      burnTokenAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
    });
  }

  // tslint:disable-next-line:typedef
  async getLPTokenBalance(tokenAddress) {
    return await this.web3Service.getLPTokensBalance(tokenAddress);
  }

  // tslint:disable-next-line:typedef
  onClickEvent(e) {
    this.tokenAddressInput.nativeElement.focus();
    return this.checkValue(e, 'Please enter a valid token.');
  }

  // tslint:disable-next-line:typedef
  checkValue(address: string, msg: string = 'The address is invalid.') {
    try {
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
      if (!isValid) {
        throw new Error(msg);
      }
    } catch (e) {
      this.notificationUtils.showSnackBar(msg, SnackBarColorEnum.Red);
    }
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
