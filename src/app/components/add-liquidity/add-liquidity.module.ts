import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { AddLiquidityComponent } from './add-liquidity.component';
import { Routes } from './add-liquidity.routing';

@NgModule({
  declarations: [AddLiquidityComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AngularMaterialModule, FontAwesomeModule, RouterModule.forChild(Routes)],
  providers: [],
  exports: [AddLiquidityComponent],
})
export class AddLiquidityModule {}
