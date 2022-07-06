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
import { SocketService } from 'src/app/services/socket.service';
declare let require: any;
const Web3 = require('web3');

@Component({
  selector: 'app-create-token',
  templateUrl: './create-token.component.html',
  styleUrls: ['./create-token.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTokenComponent implements OnInit, OnDestroy {
  networks: any;
  createdTokenAddress = '';
  networkId = 0;
  formGroup!: FormGroup;
  tokenAddressInputFormGroup!: FormGroup;
  createButtonLabel = 'Create Token';
  addToMetamaskButtonLabel = 'Add token to metamask';
  tokenAddedToMetamask = false;
  isLoading = false;
  tokenBalance: any;
  hasError = false;
  account: any = undefined;
  showAdvancedSettings = false;
  showCustomWhaleFeeSettings = false;
  showCustomBuySellTransferSettings = false;
  showCustomGasPriceLimitSettings = false;
  showCustomDelayTxSettings = false;
  showCustomAntibotSettings = false;
  showCustomBuybackSettings = false;
  showCustomAutoInjectSettings = false;
  showCustomCharitySettings = false;
  bnbBalance$!: Observable<number | null>;
  selectedPayToken!: {
    id: number;
    address: string;
  };
  creating = false;
  routerAddress!: string;

  isApproving = false;
  tokenVerified = false;

  private tokenDialogRef!: MatDialogRef<CreateTokenDialogComponent>;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  account$: Observable<string>;

  constructor(
    public web3Service: Web3Service,
    // public socketService: SocketService, //TODO se comento porque no tengo la API
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private notificationUtils: NotificationUtils,
    public dialog: MatDialog,
    private store: Store<AppState>
  ) {
    this.networks = this.web3Service.network;
    this.createForm();

    this.createForm();
    this.loadToken();
    const networkId = localStorage.getItem('currentNetwork');
    if (networkId) {
      this.networkId = Number(networkId);
    }

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
          // this.buttonLabel = r;

          // this.buttonLabel = r;
          this.formGroup.controls['tokenSupply'].setValue('1000000000');
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

  ngOnInit(): void {
    //TODO se comento porque no tengo la API
    //this.authenticationService.rws = new ReconnectingWebSocket(environment.WEB_SOCKET_URL + this.employee.id);

    /*   this.socketService.rws.addEventListener('open', (e: any) => {
      console.log({ e });
    }); */

    /*   this.socketService.rws.addEventListener('message', (e: any) => {
      console.log('message');
      console.log(e);

      if (e.data === 'Socket connected') {
        console.log('Socket enabled');
      } else {
        const data = JSON.parse(JSON.parse(JSON.stringify(e.data)));
        console.log({ data });

        if (data.type === 'video') {
          if (data.action === 'update') {
            this.notificationUtils.showSnackBar(
              'Vídeo ' + data.data.filename + ' subido correctamente.',
              SnackBarColorEnum.Green,
              5000,
              'top',
              'end'
            );
          }
        }

        if (data.type === 'image') {
          if (data.action === 'update') {
            this.notificationUtils.showSnackBar(
              'Imagen ' + data.data.filename + ' subida correctamente.',
              SnackBarColorEnum.Green,
              5000,
              'top',
              'end'
            );
          }
        }
      }
    });
 */
    this.store
      .select('web3')
      .pipe(
        takeUntil(this._unsubscribeAll),
        map((d) => {
          if (d.errorMetamask) {
            console.log('error metamask', d.errorMetamask);
            this.dialog.closeAll();
            this.isLoading = false;
            this.creating = false;
            this.createButtonLabel = 'Create Token';
            setTimeout(() => {
              this.store.dispatch(actions.web3CleanError());
            }, 1000);
          }
        })
      )
      .subscribe();
  }

  // tslint:disable-next-line:typedef
  createForm() {
    this.formGroup = this.formBuilder.group({
      tokenName: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      tokenSymbol: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
      tokenSupply: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(16)]],
      // tokenDecimals: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // TxFeePercentToHolders: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // TxFeePercentToLP: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // TxFeePercentToBurned: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // TxFeePercentToWallet: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // TxFeePercentToBuybackTokens: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // MaxWalletPercent: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(2)]],
      // MaxTxPercent: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
      validate: '',
    });

    this.tokenAddressInputFormGroup = this.formBuilder.group({
      liquidityTokenAddress: [null, [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
    });
  }

  // tslint:disable-next-line:typedef
  async approveToken() {
    const tokenAddress = this.selectedPayToken.address;
    const tokenAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    await this.web3Service
      .approveToken(tokenAddress, this.web3Service.getTokenCreatorAddress(), tokenAmount)
      .then((r) => {
        if (r) {
          return true;
        }
      })
      .catch((err) => {
        return false;
      });
  }

  // tslint:disable-next-line:typedef
  async numberFieldKeyup(event: any, maxValue: any, controlName: any) {
    if (this.formGroup.get(controlName).value > maxValue) {
      this.formGroup.controls[controlName].setValue(maxValue);
    }
  }

  // tslint:disable-next-line:typedef
  async onChangePaymentToken($event: any): Promise<void> {
    this.selectedPayToken = $event;
  }

  // tslint:disable-next-line:typedef
  async addTokenToMetamask() {
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await this.web3Service.web3.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.createdTokenAddress, // The address that the token is at.
            symbol: this.formGroup.get('tokenSymbol').value, // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
          },
        },
      });

      this.addToMetamaskButtonLabel = 'Token added to metamask successfully';
      this.tokenAddedToMetamask = true;
    } catch (error) {
      console.log(error);
    }
  }

  // tslint:disable-next-line:typedef
  async getTokenBalance(tokenAddress) {
    return await this.web3Service.getTokensBalance(tokenAddress);
  }

  // tslint:disable-next-line:typedef
  async onSubmit(value: any) {
    if (this.formGroup.get('tokenName').value.length === 0 || this.formGroup.get('tokenSymbol').value.length === 0) {
      this.notificationUtils.showSnackBar('Check creation token form values', SnackBarColorEnum.Red, 5000, 'top', 'center');
      return false;
    }

    this.isLoading = true;
    this.creating = true;
    this.store.dispatch(actions.web3CleanToken());
    localStorage.removeItem('contract');
    this.createButtonLabel = 'Deploying token';
    if (this.selectedPayToken?.id !== 0) {
      await this.approveToken();
    }

    this.tokenDialogRef = this.dialog.open(CreateTokenDialogComponent, {
      data: {
        createButtonLabel: this.createButtonLabel,
        isCreating: true,
        isChecking: false,
        isVerified: false,
        step: 1,
        createdToken: {
          address: '',
        },
      },
    });
    console.log('this.networkId', this.networkId);
    console.log('this.web3Service.getRouterAddress()', this.web3Service.getRouterAddress());
    // todo try catch añadido para cerrar el dialog de creación cuando falla, no funciona
    try {
      this.store.dispatch(
        actions.web3createToken({
          paymentToken: this.selectedPayToken?.address,
          tokenName: this.formGroup.get('tokenName').value,
          tokenSymbol: this.formGroup.get('tokenSymbol').value,
          tokenSupply: this.formGroup.get('tokenSupply').value,
          // tokenDecimals: Number(this.formGroup.get('tokenDecimals').value),
          // TxFeePercentToHolders: Number(this.formGroup.get('TxFeePercentToHolders').value),
          // TxFeePercentToLP: Number(this.formGroup.get('TxFeePercentToLP').value),
          // TxFeePercentToBurned: Number(this.formGroup.get('TxFeePercentToBurned').value),
          // TxFeePercentToWallet: Number(this.formGroup.get('TxFeePercentToWallet').value),
          // TxFeePercentToBuybackTokens: Number(this.formGroup.get('TxFeePercentToBuybackTokens').value),
          // MaxWalletPercent: Number(this.formGroup.get('MaxWalletPercent').value),
          // MaxTxPercent: Number(this.formGroup.get('MaxTxPercent').value),
          // FeeReceiverWallet: this.formGroup.get('FeeReceiverWallet').value,
          // RouterAddress: this.web3Service.getRouterAddress(),
          networkId: this.networkId,
        })
      );
    } catch {
      console.log('close');
      this.tokenDialogRef.close();
    }
  }

  loadToken() {
    this.store
      .select('web3')
      .pipe(
        takeUntil(this._unsubscribeAll),
        map((d) => {
          if (d.contract) {
            if (this.creating) {
              console.log({ d });
              const r = d.contract;
              this.createButtonLabel = 'Verifying Token';

              if (r.events['1'].address.length > 0) {
                this.createdTokenAddress = r.contractAddress;
                this.tokenDialogRef.componentInstance.data = {
                  createButtonLabel: this.createButtonLabel,
                  explorerUrl: this.networks[this.networkId].params.blockExplorerUrls[0],
                  isCreating: true,
                  isChecking: true,
                  isVerified: false,
                  createdToken: {
                    address: this.createdTokenAddress,
                    symbol: this.formGroup.get('tokenSymbol').value,
                    decimals: 18,
                  },
                  step: 2,
                };
                console.log(this.networks[this.networkId]);
                const verifyApiUrl = this.networks[this.networkId].verifyApiUrl;

                const interval = setInterval(() => {
                  const formData: any = new FormData();

                  formData.append('guid', r.guid);
                  formData.append('module', 'contract');
                  formData.append('action', 'checkverifystatus');
                  formData.append('apikey', this.networks[this.networkId].explorerApiKey);

                  this.http.post(verifyApiUrl, formData).subscribe(
                    async (response: any) => {
                      if (response.status === '1' || response.result ==='Already Verified') {
                        clearInterval(interval); // time is up;
                        this.tokenVerified = true;
                        this.createButtonLabel = 'Token Created';
                        this.isLoading = false;
                        this.tokenBalance = Web3.utils.fromWei(this.formGroup.get('tokenSupply').value, 'ether');
                        // this.tokenBalance = Number(Web3.utils.fromWei(await this.getTokenBalance(this.createdTokenAddress), 'ether'))
                        //   .toFixed(18)
                        //   .toString();
                        this.tokenAddressInputFormGroup.controls.liquidityTokenAddress.setValue(this.createdTokenAddress);
                        this.tokenDialogRef.componentInstance.data = {
                          createButtonLabel: this.createButtonLabel,
                          explorerUrl: this.networks[this.networkId].params.blockExplorerUrls[0],
                          isCreating: true,
                          isChecking: true,
                          isVerified: true,
                          createdToken: {
                            address: this.createdTokenAddress,
                            symbol: this.formGroup.get('tokenSymbol').value,
                            decimals: 18,
                          },
                          step: 3,
                        };
                      } else {
                        console.log(response);
                      }
                    },
                    (error) => {
                      console.log(error);
                      this.hasError = true;
                      this.tokenDialogRef.close();
                    }
                  );
                }, 5000);
              } else {
                alert('error creando token');
                this.tokenDialogRef.close();
              }
            }
          }
        })
      )
      .subscribe(
        (d) => console.log(d),
        (e) => {
          if (this.tokenDialogRef) {
            this.tokenDialogRef.close();
          }
          console.log('error');
          if (e.code === 4001) {
            this.notificationUtils.showSnackBar('Error: Transaction rejected by user', SnackBarColorEnum.Red, 5000, 'top', 'center');
          } else {
            this.notificationUtils.showSnackBar(e.message, SnackBarColorEnum.Red, 5000, 'top', 'center');
          }
          this.createButtonLabel = 'Deploy Token';
          this.hasError = true;
          this.isLoading = false;
        }
      ),
      (e) => {
        console.log(e);
        this.hasError = true;
        this.isLoading = false;
      };
  }

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // tslint:disable-next-line:typedef
  onSwitchChangeShowCustomBuySellTransferSettings() {
    this.showCustomBuySellTransferSettings = !this.showCustomBuySellTransferSettings;
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
    this.showAdvancedSettings = !this.showAdvancedSettings;
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

      /*
      if (this.formGroup.get(controlName).value > maxValue) {
        this.formGroup.controls[controlName].setValue(maxValue);
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      }
      */
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
