import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AngularMaterialModule } from '../angular-material.module';
import { NetworkSelectorModule } from '../components/network-selector/network-selector.module';
import { ThemePipesModule } from '../pipes';

import { LayoutComponent } from './layout.component';
import { FooterComponent } from './shared/footer/footer.component';

@NgModule({
  imports: [CommonModule, AngularMaterialModule, RouterModule, FontAwesomeModule, ThemePipesModule, NetworkSelectorModule],
  exports: [],
  declarations: [LayoutComponent, FooterComponent],
  providers: [],
})
export class LayoutModule {}
