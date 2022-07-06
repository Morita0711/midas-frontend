import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TwoDigitDecimaNumberDirective } from './two-digit-decima-number.directive';
import { BurnDialogComponent } from './components/burn-dialog/burn-dialog.component';
import { CreateTokenDialogComponent } from './components/create-token-dialog/create-token-dialog.component';
import { NoWalletDialogComponent } from './components/no-wallet-dialog/no-wallet-dialog.component';
import { WhitelistBlacklistComponent } from './components/whitelist-blacklist/whitelist-blacklist.component';
import { RemoveLiquidityDialogComponent } from './components/remove-liquidity-dialog/remove-liquidity-dialog.component';
import { CountdownTimerModule } from './../../projects/countdown-timer/src/lib/countdown-timer.module';
import { ServiceTokenPaymentSelectorComponent } from './components/service-token-payment-selector/service-token-payment-selector.component';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { AppStoreModule } from './store.module';
import { ThemePipesModule } from './pipes';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CreateTockenModule } from './components/create-token/createToken.module';
import { ExtraOptions, RouterModule } from '@angular/router';

import { appRoutes } from 'src/app/app.routing';
import { LayoutModule } from './layout/layout.module';

const routerConfig: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  initialNavigation: 'enabledBlocking',
};

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [
    AppComponent,
    TwoDigitDecimaNumberDirective,
    BurnDialogComponent,
    RemoveLiquidityDialogComponent,
    CreateTokenDialogComponent,
    NoWalletDialogComponent,
    WhitelistBlacklistComponent,
    ServiceTokenPaymentSelectorComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, routerConfig),
    LayoutModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    FormsModule,
    CountdownTimerModule,
    MatNativeDatetimeModule,
    MatDatetimepickerModule,
    LottieModule.forRoot({ player: playerFactory }),
    AppStoreModule,
    ThemePipesModule,
    MatCardModule,
    MatTabsModule,
    CreateTockenModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
