import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'create-token' },

  // components
  {
    path: '',

    component: LayoutComponent,

    children: [
      {
        path: 'create-token',
        data: { animation: 'CreateToken' },
        loadChildren: () => import('src/app/components/create-token/createToken.module').then((m) => m.CreateTockenModule),
      },
      {
        path: 'config-token',
        data: { animation: 'ConfigToken' },
        loadChildren: () => import('src/app/components/config-token/config-token.module').then((m) => m.ConfigTokenModule),
      },

      {
        path: 'add-liquidity',
        data: { animation: 'AddLiquidity' },
        loadChildren: () => import('src/app/components/add-liquidity/add-liquidity.module').then((m) => m.AddLiquidityModule),
      },

      {
        path: 'lock-liquidity',
        data: { animation: 'LockLiquidity' },
        loadChildren: () => import('src/app/components/lock-liquidity/lock-liquidity.module').then((m) => m.LockLiquidityModule),
      },

      {
        path: 'burn-token',
        data: { animation: 'BurnTokens' },
        loadChildren: () => import('src/app/components/burn-tokens/burn-tokens.module').then((m) => m.BurnTokensModule),
      },
    ],
  },
];
