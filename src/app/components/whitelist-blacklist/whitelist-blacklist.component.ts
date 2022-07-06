import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../services/web3.service';
import { MatSliderChange } from '@angular/material/slider';
import { NotificationUtils, SnackBarColorEnum } from 'src/utils/NotificationUtil';

declare let require: any;
declare let window: any;
const Web3 = require('web3');

@Component({
  selector: 'app-whitelist-blacklist',
  templateUrl: './whitelist-blacklist.component.html',
  styleUrls: ['./whitelist-blacklist.component.scss'],
})
export class WhitelistBlacklistComponent implements OnInit {
  listingTokenAddressInputFormGroup: FormGroup;
  whitelistInputFormGroup: FormGroup;
  blacklistInputFormGroup: FormGroup;
  whitelistContent: any;
  blacklistContent = [];

  constructor(
    private formBuilder: FormBuilder,
    public web3Service: Web3Service, 
    private notificationUtils: NotificationUtils
  ) {
    this.createForm();
  }
  ngOnInit(): void {}
  // tslint:disable-next-line:typedef
  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value + '%';
  }

  // tslint:disable-next-line:typedef
  async onWhitelistTokenAddressKeyup() {
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(
      this.listingTokenAddressInputFormGroup.controls.tokenAddress.value
    );
    if (isValid) {
      //this.whitelist = this.getWhitelist(this.listingTokenAddressInputFormGroup.controls.tokenAddress.value)
      this.getWhitelist(
        this.listingTokenAddressInputFormGroup.controls.tokenAddress.value
      );
      this.getBlacklist(
        this.listingTokenAddressInputFormGroup.controls.tokenAddress.value
      );
    }
  }

  async getWhitelist(address: string) {
    this.web3Service
      .getTokenWhitelist(address)
      .then((data) => {
        this.whitelistContent = data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  async getBlacklist(address: string) {
    this.web3Service
      .getTokenBlacklist(address)
      .then((data) => {
        this.blacklistContent = data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // tslint:disable-next-line:typedef
  async addWhitelist() {
    this.checkValue('0xb6e76628BeB7872D2ade6AE9641bb390401c18ef');

    console.log(
      'addWhitelist',
      this.web3Service.addAddressWhitelist(
        this.listingTokenAddressInputFormGroup.controls.tokenAddress.value,
        '0xb6e76628BeB7872D2ade6AE9641bb390401c18ef'
      )
    );
    // this.web3Service
    //   .burnTokens(
    //     this.burnTokenAddressInputFormGroup.controls.burnTokenAddress.value,
    //     this.burnTokenForm.amount
    //   )
    //   .then((r2) => {
    //     console.log(r2);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }

  // tslint:disable-next-line:typedef
  async addBlacklist() {
    this.blacklistContent.push(
      this.blacklistInputFormGroup.controls.blacklistAddress.value
    );

    // this.web3Service
    //   .burnTokens(
    //     this.burnTokenAddressInputFormGroup.controls.burnTokenAddress.value,
    //     this.burnTokenForm.amount
    //   )
    //   .then((r2) => {
    //     console.log(r2);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }

  // tslint:disable-next-line:typedef
  async deleteFromWhitelist(address) {
    const index = this.whitelistContent.indexOf(address);
    if (index > -1) {
      this.whitelistContent.splice(index, 1);
    }
  }

  // tslint:disable-next-line:typedef
  async deleteFromBlacklist(address) {
    const index = this.blacklistContent.indexOf(address);
    if (index > -1) {
      this.blacklistContent.splice(index, 1);
    }
  }
  // tslint:disable-next-line:typedef
  createForm() {
    this.whitelistInputFormGroup = this.formBuilder.group({
      whitelistAddress: [
        null,
        [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')],
      ],
    });

    this.blacklistInputFormGroup = this.formBuilder.group({
      blacklistAddress: [
        null,
        [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')],
      ],
    });

    this.listingTokenAddressInputFormGroup = this.formBuilder.group({
      tokenAddress: [
        null,
        [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')],
      ],
    });
  }

  checkValue(address:string,msg:string = 'The address is invalid.') {
    try {
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(
        address
      );
      if (!isValid) {   
        throw new Error(msg);
      };
    }
    catch(e) {
      this.notificationUtils.showSnackBar(
        msg,
        SnackBarColorEnum.Red,
      );
    }
  }
}
