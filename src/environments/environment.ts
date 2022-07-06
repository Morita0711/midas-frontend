// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { NetworkEnum } from 'src/app/blockchain/Networks';

export const environment = {
  production: false,
  WEB_SOCKET_URL: 'ws://localhost:3001/ws/',
  seed: 'ggggggggggggggggggg$$%%&&',
  urlApi: 'http://localhost:3001/api/v1',
  urlNet: 'https://api-testnet.bscscan.com/api',
  token: 'CBUC3UXGM4FSDMW61XA9X1KY1I5WY6NKSZ',
  firebase: {
    apiKey: 'AIzaSyC6-P9TvgP_Cxgm0vxSp3rsbCSfd_u58Sg',
    authDomain: 'base-angular-dashboard.firebaseapp.com',
    projectId: 'base-angular-dashboard',
    storageBucket: 'base-angular-dashboard.appspot.com',
    messagingSenderId: '215516479530',
    appId: '1:215516479530:web:3c516d5f5c03c612fc4353',
    measurementId: 'G-QJY58CY902',
  },

  network: NetworkEnum.TESTNET,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
