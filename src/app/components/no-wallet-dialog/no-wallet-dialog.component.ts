import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-no-wallet-dialog',
  templateUrl: './no-wallet-dialog.component.html',
  styleUrls: ['./no-wallet-dialog.component.scss']
})
export class NoWalletDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NoWalletDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }
}
