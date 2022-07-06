import { NgModule } from '@angular/core';
import { FromWeiPipe } from './FromWei.pipe';
import { ParseAccountPipe } from './parseAccountWeb3.pipe';
@NgModule({
  declarations: [ParseAccountPipe, FromWeiPipe],
  imports: [],
  exports: [ParseAccountPipe, FromWeiPipe],
  providers: [],
})
export class ThemePipesModule {}
