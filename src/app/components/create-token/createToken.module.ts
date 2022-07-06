import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { CreateTokenComponent } from './create-token.component';
import { Routes } from './create-token.routing';

@NgModule({
  declarations: [CreateTokenComponent],
  imports: [CommonModule, ReactiveFormsModule, AngularMaterialModule, FontAwesomeModule, FormsModule, RouterModule.forChild(Routes)],
  providers: [],
  exports: [CreateTokenComponent],
})
export class CreateTockenModule {}
