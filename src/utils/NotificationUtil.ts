import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar/snack-bar-config';

export enum SnackBarColorEnum {
  Green = 'background-green',
  Red = 'background-red',
  Blue = 'background-blue',
  Yellow = 'background-yellow',
  Default = ''
}

@Injectable({providedIn: 'root'})
export class NotificationUtils {
  constructor(private snackBar: MatSnackBar) {
  }

  // tslint:disable-next-line:typedef
  showSnackBar(message: string,
               color = SnackBarColorEnum.Default,
               duration = 5000,
               verticalPosition: MatSnackBarVerticalPosition = 'top',
               horizontalPosition: MatSnackBarHorizontalPosition = 'center') {
    const config = new MatSnackBarConfig();
    config.panelClass = color !== SnackBarColorEnum.Default ? color : [];
    config.duration = duration;
    config.verticalPosition = verticalPosition;
    config.horizontalPosition = horizontalPosition;
    this.snackBar.open(message, null, config);
  }
}
