import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { WhitelistBlacklistComponent } from './components/whitelist-blacklist/whitelist-blacklist.component';

const routes: Routes = [
  //{path: 'token-generator', component: TokenGeneratorComponent},
  { path: 'whitelist-blacklist', component: WhitelistBlacklistComponent, data: { animation: 'WhitelistBlacklist' } },
  { path: 'presale', component: WhitelistBlacklistComponent, data: { animation: 'Presale' } },
  { path: '', redirectTo: '/create-token', pathMatch: 'full', data: { animation: 'CreateToken' } },
];

const routerConfig: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  initialNavigation: 'enabledBlocking',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerConfig)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
