import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { TokenGeneratorComponent } from './token-generator.component';

@NgModule({
  declarations: [TokenGeneratorComponent],
  imports: [CommonModule, AngularMaterialModule],
  providers: [],
  exports: [TokenGeneratorComponent],
})
export class TokenGeneratorModule {}
