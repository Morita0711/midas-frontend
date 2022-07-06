import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { NetworkSelectorComponent } from './network-selector.component';

@NgModule({
  declarations: [NetworkSelectorComponent],
  imports: [CommonModule, AngularMaterialModule],
  providers: [],
  exports: [NetworkSelectorComponent],
})
export class NetworkSelectorModule {}
