import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';
import { CountdownTimerModule } from 'projects/countdown-timer/src/public-api';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ThemePipesModule } from 'src/app/pipes';
import { LockLiquidityComponent } from './lock-liquidity.component';
import { Routes } from './lock-liquidity.routing';

@NgModule({
  declarations: [LockLiquidityComponent],
  imports: [
    // Core
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // External
    FontAwesomeModule,
    CountdownTimerModule,
    ThemePipesModule,
    // Material
    AngularMaterialModule,

    MatNativeDatetimeModule,
    MatDatetimepickerModule,
    // Pipes
    ThemePipesModule,

    // Routing
    RouterModule.forChild(Routes),
  ],
  providers: [],
  exports: [LockLiquidityComponent],
})
export class LockLiquidityModule {}
