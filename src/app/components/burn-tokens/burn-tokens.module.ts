import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { Routes } from './burn-tockens.routing';

import { BurnTokensComponent } from './burn-tokens.component';

@NgModule({
  declarations: [BurnTokensComponent],
  imports: [CommonModule, AngularMaterialModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(Routes)],
  providers: [],
  exports: [BurnTokensComponent],
})
export class BurnTokensModule {}
