import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationUtils, SnackBarColorEnum } from '../../../utils/NotificationUtil';
import { Web3Service } from '../../services/web3.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateTokenDialogComponent } from '../create-token-dialog/create-token-dialog.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import * as actions from 'src/app/store/actions';
import { Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

declare let require: any;
const Web3 = require('web3');

@Component({
  selector: 'app-config-token',
  templateUrl: './config-token.component.html',
  styleUrls: ['./config-token.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigTokenComponent implements OnInit, OnDestroy {
  networks: any;
  valuesPercent = {
    buyBackFee: 0.5,
    busdReserveFee: 0.5,
    liquidityFee: 1,
    distributionToHoldersFee: 1,
  };
  createdTokenAddress = '';
  networkId = 0;
  formGroup: FormGroup;
  tokenAddressInputFormGroup: FormGroup;
  createButtonLabel = 'Create Token';
  addToMetamaskButtonLabel = 'Add token to metamask';
  tokenAddedToMetamask = false;
  isLoading = false;
  enableDelayTx = false;
  isLoadingGas = false;
  isLoadingDelay = false;
  isLoadingMaxBuy = false;
  isLoadingAutoInject = false;
  isLoadingSetRouter = false;
  isLoadingSetPair = false;
  isLoadingNewOwner = false;
  isLoadingBusdAddress = false;
  isLoadingIncludeRewards = false;
  isLoadingLiquidityAddress = false;
  tokenBalance: any;
  hasError = false;
  account: any = undefined;
  validTokenAddress = false;
  showCustomGeneralSettings = false;
  showCustomWhaleFeeSettings = false;
  showCustomBuySellTransferSettings = false;
  showCustomGasPriceLimitSettings = false;
  showCustomOwnerSettings = false;
  transferToPoolsOnSwaps = false;
  showCustomDelayTxSettings = false;
  showCustomAntibotSettings = false;
  showCustomBuybackSettings = false;
  showCustomAutoInjectSettings = false;
  showCustomCharitySettings = false;

  isTaxesPercentLoading = false;
  isGasPriceLoading = false;
  isDelayTxLoading = false;
  isDelayLaunchLoading = false;
  isEnableTradingLoading = false;
  isBuybackTaxLoading = false;
  isBuyBackTresLoading = false;
  isMaxWalletLoading = false;
  isCharityFeeLoading = false;
  isCharityWalletLoading = false;

  bnbBalance$: Observable<number>;
  selectedPayToken: {
    id: number;
    address: string;
  };
  creating = false;
  routerAddress: string;

  isApproving = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  account$: Observable<string>;
  constructor(
    public web3Service: Web3Service,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private notificationUtils: NotificationUtils,
    public dialog: MatDialog,
    private store: Store<AppState>
  ) {
    this.networks = this.web3Service.network;
    this.createForm();

    this.store.dispatch(actions.web3Connect());
    this.account$ = this.store.select('web3').pipe(
      map((d) => d),
      switchMap((d) => of(d.account))
    );
    if (this.web3Service.enable) {
      this.web3Service
        .getAccount()
        .then(async (r) => {
          this.account = r;
          console.log(this.account);
          this.selectedPayToken = {
            id: 0,
            address: await this.web3Service.getWethAddress(),
          };
          this.bnbBalance$ = this.store.select('web3').pipe(
            map((d) => d),
            switchMap((d) => of(d.bnbBalance))
          );

          this.formGroup.controls.tokenDecimals.setValue('0');
          this.formGroup.controls.TxFeePercentToHolders.setValue('0');
          this.formGroup.controls.gasLimitActive.setValue('false');
          this.formGroup.controls.maxGasPriceLimit.setValue('0');
          this.formGroup.controls.transferDelayEnabled.setValue('false');
          this.formGroup.controls.swapThreshold.setValue('0');
          this.formGroup.controls.tradingActive.setValue('false');
          this.formGroup.controls.transferToPoolsOnSwaps.setValue('false');
          this.formGroup.controls.timeDelayBetweenTx.setValue('0');
          this.formGroup.controls.totalDelayTime.setValue('0');
          this.formGroup.controls.maxBuyLimit.setValue('0');
          this.formGroup.controls.buyBackFee.setValue(50);
          this.formGroup.controls.busdReserveFee.setValue(50);
          this.formGroup.controls.liquidityFee.setValue(100);
          this.formGroup.controls.distributionToHoldersFee.setValue(100);
          this.formGroup.controls.contractSwapEnabled.setValue('false');
          this.formGroup.controls.TxFeePercentToLP.setValue('0');
          this.formGroup.controls.TxFeePercentToBurned.setValue('0');
          this.formGroup.controls.TxFeePercentToWallet.setValue('0');
          this.formGroup.controls.TxFeePercentToBuybackTokens.setValue('0');
          this.formGroup.controls.CharityWallet.setValue(this.account);
          this.formGroup.controls.TxFeePercentToCharity.setValue('0');
          this.formGroup.controls.MaxWalletPercent.setValue('100');
          this.formGroup.controls.busdAddress.setValue('');
          this.formGroup.controls.liquidityAddress.setValue('');
          this.formGroup.controls.routeAddress.setValue('');
          this.formGroup.controls.pairAddress.setValue('');
          this.formGroup.controls.newOwner.setValue('');
          this.formGroup.controls.includeReward.setValue('');
          this.formGroup.controls.busdBuyBurnAddress.setValue('');
          this.formGroup.controls.FeeReceiverWallet.setValue(this.account);
          this.routerAddress = this.web3Service.getRouterAddress();
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (this.web3Service.web3) {
      this.web3Service.web3.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.account = undefined;
          // this.buttonLabel = 'Connect';
        } else {
          this.account = accounts[0];
          // this.buttonLabel = accounts[0];
        }
      });

      this.web3Service.web3.on('networkChanged', (nID) => {
        this.web3Service.currentNetworkId.subscribe((nID) => {
          this.networkId = nID;
        });
      });
    }
  }

  ngOnInit(): void {}

  // tslint:disable-next-line:typedef
  createForm() {
    this.formGroup = this.formBuilder.group({
      tokenAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      tokenDecimals: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      TxFeePercentToHolders: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      TxFeePercentToLP: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      TxFeePercentToBurned: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      TxFeePercentToWallet: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      TxFeePercentToBuybackTokens: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      MaxWalletPercent: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],

      gasLimitActive: ['false', [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      maxGasPriceLimit: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(18)]],
      transferDelayEnabled: ['false', [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      swapThreshold: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
      tradingActive: ['false', [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      transferToPoolsOnSwaps: ['false', [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      timeDelayBetweenTx: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(4)]],
      totalDelayTime: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
      maxBuyLimit: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      buyBackFee: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      busdReserveFee: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      liquidityFee: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      distributionToHoldersFee: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      busdAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      liquidityAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      routeAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      pairAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      newOwner: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      includeReward: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      busdBuyBurnAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      contractSwapEnabled: ['false', [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],

      FeeReceiverWallet: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      CharityWallet: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      TxFeePercentToCharity: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      enableDelayTx: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(5)]],
      validate: '',
    });
  }
  // tslint:disable-next-line:typedef
  async numberFieldKeyup(event, maxValue, controlName) {
    if (this.formGroup.controls['tokenAddress'].valid) {
      this.validTokenAddress = true;
    } else {
      this.validTokenAddress = false;
    }
    if (!isNaN(event.key) || event.code === 'Backspace') {
      console.log('keyup', event.target.value);
      switch (controlName) {
        case 'buyBackFee':
          this.valuesPercent.buyBackFee = event.target.value / 100;
          break;
        case 'liquidityFee':
          this.valuesPercent.liquidityFee = event.target.value / 100;
          break;
        case 'distributionToHoldersFee':
          this.valuesPercent.distributionToHoldersFee = event.target.value / 100;
          break;
        case 'busdReserveFee':
          this.valuesPercent.busdReserveFee = event.target.value / 100;
          break;
        default:
          break;
      }
    }
  }

  // tslint:disable-next-line:typedef
  async getTokenBalance(tokenAddress) {
    return await this.web3Service.getTokensBalance(tokenAddress);
  }

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // tslint:disable-next-line:typedef
  onSwitchChangeShowCustomBuySellTransferSettings() {
    this.showCustomBuySellTransferSettings = !this.showCustomBuySellTransferSettings;
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeShowCustomGeneralSettings() {
    this.showCustomGeneralSettings = !this.showCustomGeneralSettings;
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeShowCustomOwnerSettings() {
    this.showCustomOwnerSettings = !this.showCustomOwnerSettings;
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeGasPriceLimitSettings() {
    this.showCustomGasPriceLimitSettings = !this.showCustomGasPriceLimitSettings;
    this.formGroup.controls.gasLimitActive.setValue(this.showCustomBuybackSettings);
  }

  // tslint:disable-next-line:typedef
  onSwitchDelayTxSettings() {
    this.showCustomDelayTxSettings = !this.showCustomDelayTxSettings;
    this.formGroup.controls.transferDelayEnabled.setValue(this.showCustomBuybackSettings);
  }

  // tslint:disable-next-line:typedef
  onSwitchChange() {
    if (this.formGroup.get('tokenAddress').value) {
      this.validTokenAddress = !this.validTokenAddress;
    }
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeWhaleTaxes() {
    this.showCustomWhaleFeeSettings = !this.showCustomWhaleFeeSettings;
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeAntiBotSettings() {
    this.showCustomAntibotSettings = !this.showCustomAntibotSettings;
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeAutoInjectSettings() {
    this.showCustomAutoInjectSettings = !this.showCustomAutoInjectSettings;
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeBuybackSettings() {
    this.showCustomBuybackSettings = !this.showCustomBuybackSettings;
    this.formGroup.controls.contractSwapEnabled.setValue(this.showCustomBuybackSettings);
  }

  // tslint:disable-next-line:typedef
  onSwitchChangeCharitySettings() {
    this.showCustomCharitySettings = !this.showCustomCharitySettings;
  }

  // tslint:disable-next-line:typedef
  async numberFieldKeydown(event, maxValue, controlName) {
    if (event.code !== 'Backspace') {
      console.log({ event });
      if (isNaN(Number(event.key))) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }

      if (Number(event.key) < 0 || Number(event.key) > 9) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
    }
  }

  async onSelectEnableDelay() {
    console.log(this.enableDelayTx);
  }

  async onClickEnableCustomGasPrice() {
    this.isLoadingGas = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateGasLimitActive(tokenAddress, this.formGroup.get('gasLimitActive')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingGas = false;
        }
      })
      .catch((err) => {
        this.isLoadingGas = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickEnableCustomAntiBotDelay() {
    this.isLoadingDelay = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateTransferDelayEnabled(tokenAddress, this.showCustomDelayTxSettings)
      .then((r) => {
        if (r) {
          this.isLoadingDelay = false;
        }
      })
      .catch((err) => {
        this.isLoadingDelay = false;
        console.log('error');
      });
  }

  // tslint:disable-next-line:typedef
  async onClickUpdateTransferPoolSwaps() {
    this.isLoadingDelay = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateTransferToPoolsOnSwaps(tokenAddress, this.showCustomDelayTxSettings)
      .then((r) => {
        if (r) {
          this.isLoadingDelay = false;
        }
      })
      .catch((err) => {
        this.isLoadingDelay = false;
        console.log('error');
      });
  }

  // tslint:disable-next-line:typedef
  async onClickEnableCustomAutoInject() {
    this.isLoadingAutoInject = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateContractSwapEnabled(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isLoadingAutoInject = false;
        }
      })
      .catch((err) => {
        this.isLoadingAutoInject = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickSetBusdBuyBurnAddress() {
    this.isLoadingAutoInject = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setBusdBuyBurnAddress(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isLoadingAutoInject = false;
        }
      })
      .catch((err) => {
        this.isLoadingAutoInject = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickUpdateBusdAddress() {
    this.isLoadingBusdAddress = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateBUSDAddress(tokenAddress, this.formGroup.get('busdAddress')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingBusdAddress = false;
        }
      })
      .catch((err) => {
        this.isLoadingBusdAddress = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async OnClickSetLiquidityAddress() {
    this.isLoadingLiquidityAddress = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setLiquidityAddress(tokenAddress, this.formGroup.get('liquidityAddress')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingLiquidityAddress = false;
        }
      })
      .catch((err) => {
        this.isLoadingLiquidityAddress = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickEnableCustomSwapThreshold() {
    this.isLoadingAutoInject = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateSwapThreshold(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isLoadingAutoInject = false;
        }
      })
      .catch((err) => {
        this.isLoadingAutoInject = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickIncludeRewards() {
    this.isLoadingIncludeRewards = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .includeInReward(tokenAddress, this.formGroup.get('includeReward')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingIncludeRewards = false;
        }
      })
      .catch((err) => {
        this.isLoadingIncludeRewards = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickEnableCustomSetTaxes() {
    console.log('click');
    this.isTaxesPercentLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    const taxesArray: any[] = [
      this.formGroup.get('buyFee')?.value,
      this.formGroup.get('sellFee')?.value,
      this.formGroup.get('transferFee')?.value,
    ];
    await this.web3Service
      .setTaxes(tokenAddress, taxesArray)
      .then((r) => {
        if (r) {
          this.isTaxesPercentLoading = false;
        }
      })
      .catch((err) => {
        this.isTaxesPercentLoading = false;
        console.log(err);
      });
    this.isTaxesPercentLoading = false;
  }

  // tslint:disable-next-line:typedef
  async onClickGasPrice() {
    this.isGasPriceLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateMaxGasPriceLimit(tokenAddress, this.formGroup.get('maxGasPriceLimit')?.value)
      .then((r) => {
        if (r) {
          this.isGasPriceLoading = false;
        }
      })
      .catch((err) => {
        this.isGasPriceLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickDelayTx() {
    this.isDelayTxLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setTimeDelayBetweenTx(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isDelayTxLoading = false;
        }
      })
      .catch((err) => {
        this.isDelayTxLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickDelayLaunch() {
    this.isDelayLaunchLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setTotalDelayTime(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isDelayLaunchLoading = false;
        }
      })
      .catch((err) => {
        this.isDelayLaunchLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickEnableTrading() {
    this.isEnableTradingLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setEnableTrading(tokenAddress)
      .then((r) => {
        if (r) {
          this.isEnableTradingLoading = false;
        }
      })
      .catch((err) => {
        this.isEnableTradingLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickBuybackTax() {
    this.isBuybackTaxLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateSwapThreshold(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isBuybackTaxLoading = false;
        }
      })
      .catch((err) => {
        this.isBuybackTaxLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickBuybackThreshold() {
    this.isBuyBackTresLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateSwapThreshold(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isBuyBackTresLoading = false;
        }
      })
      .catch((err) => {
        this.isBuyBackTresLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickMaxWallet() {
    this.isMaxWalletLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setMaxWalletAmount(tokenAddress, this.formGroup.get('MaxWalletPercent')?.value)
      .then((r) => {
        if (r) {
          this.isMaxWalletLoading = false;
        }
      })
      .catch((err) => {
        this.isMaxWalletLoading = false;
        console.log(err);
      });
  }

  // // tslint:disable-next-line:typedef
  async onClickMaxBuyLimit() {
    this.isLoadingMaxBuy = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateMaxBuyLimit(tokenAddress, this.formGroup.get('maxBuyLimit')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingMaxBuy = false;
        }
      })
      .catch((err) => {
        this.isLoadingMaxBuy = false;
        console.log(err);
      });
  }

  // // tslint:disable-next-line:typedef
  async OnClickSetPairAddress() {
    this.isLoadingSetPair = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setPairAddress(tokenAddress, this.formGroup.get('pairAddress')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingSetPair = false;
        }
      })
      .catch((err) => {
        this.isLoadingSetPair = false;
        console.log(err);
      });
  }

  // // tslint:disable-next-line:typedef
  async OnClickNewOwner() {
    this.isLoadingNewOwner = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .transferOwner(tokenAddress, this.formGroup.get('newOwner')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingNewOwner = false;
        }
      })
      .catch((err) => {
        this.isLoadingNewOwner = false;
        console.log(err);
      });
  }

  // // tslint:disable-next-line:typedef
  async OnClickSetRouterAddress() {
    this.isLoadingSetRouter = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .setRouterAddress(tokenAddress, this.formGroup.get('routeAddress')?.value, this.formGroup.get('routeAddress')?.value)
      .then((r) => {
        if (r) {
          this.isLoadingSetRouter = false;
        }
      })
      .catch((err) => {
        this.isLoadingSetRouter = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickCharityFee() {
    this.isCharityFeeLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateSwapThreshold(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isCharityFeeLoading = false;
        }
      })
      .catch((err) => {
        this.isCharityFeeLoading = false;
        console.log(err);
      });
  }

  // tslint:disable-next-line:typedef
  async onClickCharityWallet() {
    this.isCharityWalletLoading = true;
    const tokenAddress = this.formGroup.get('tokenAddress')?.value;
    await this.web3Service
      .updateSwapThreshold(tokenAddress, this.showCustomGasPriceLimitSettings)
      .then((r) => {
        if (r) {
          this.isCharityWalletLoading = false;
        }
      })
      .catch((err) => {
        this.isCharityWalletLoading = false;
        console.log(err);
      });
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
