import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { ConfigTokenComponent } from './config-token.component';
import { Routes } from './config-token.routing';

@NgModule({
  declarations: [ConfigTokenComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, RouterModule.forChild(Routes)],
  providers: [],
  exports: [ConfigTokenComponent],
})
export class ConfigTokenModule {}
