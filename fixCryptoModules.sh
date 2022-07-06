#ª/bin/bash
sed -i 's/node: false,/node: { crypto: true, stream: true },/g' node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js
