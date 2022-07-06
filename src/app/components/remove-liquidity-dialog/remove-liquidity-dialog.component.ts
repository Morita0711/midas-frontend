import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-remove-liquidity-dialog',
  templateUrl: './remove-liquidity-dialog.component.html',
  styleUrls: ['./remove-liquidity-dialog.component.scss'],
})
export class RemoveLiquidityDialogComponent implements OnInit {
  isLoading = false;
  tokenAddress: string;
  pairAddress: string;
  lpTokenBalance: number;
  @ViewChild('removeLPTokenSlider') slider;
  removeLPTokensForm = {
    amount: 0,
  };

  constructor(
    public web3Service: Web3Service,
    public dialogRef: MatDialogRef<RemoveLiquidityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // console.log(data);

    this.tokenAddress = data.address;
    this.pairAddress = data.pairAddress;
    this.lpTokenBalance = data.lpTokenBalance;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {}

  // tslint:disable-next-line:typedef
  percentage(percent, total) {
    return (percent / 100) * total;
  }
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

  LPTokenInputKeyUp() {
    const value = this.mapValue(
      Number(this.removeLPTokensForm.amount),
      0,
      this.lpTokenBalance,
      0,
      100
    );
    this.slider.value = value;
  }

  setLPTokenPercent(percent) {
    this.removeLPTokensForm.amount = this.percentage(
      percent,
      this.lpTokenBalance
    );
    const value = this.mapValue(
      Number(this.removeLPTokensForm.amount),
      0,
      this.lpTokenBalance,
      0,
      100
    );
    this.slider.value = value;
  }
  async onSlide(event: MatSliderChange) {
    this.removeLPTokensForm.amount = this.percentage(
      Number(event.value),
      this.lpTokenBalance
    );

    // const estimate = await this.web3Service.getEstimatedTokensForBNB(this.tokenAddress);
    // const ratio = estimate['0'] / estimate['1'];

    //const addLiquidityTokenAmount = ratio * this.addLiquidityForm.bnbAmount;
  }

  // tslint:disable-next-line:typedef
  async remove() {
    this.isLoading = true;
    await this.web3Service
      .removeLPTokens(this.tokenAddress, this.pairAddress, this.removeLPTokensForm.amount)
      .then((r) => {
        this.isLoading = false;
        this.dialogRef.close(true);
      })
      .catch((err) => {
        console.log(err);
        this.isLoading = false;
      });
    return true;
  }

}
