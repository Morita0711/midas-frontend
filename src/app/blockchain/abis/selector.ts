import { AVAXNetwork } from './avalanche';
import { BSCNetwork } from './bsc';
import { ETHERMNetwork } from './etherum';
import { MATICNetwork } from './matic';
import { FTMNetwork } from './fantom';

export type TNetwork = 'BSC' | 'MATIC' | 'ETHERUM' | 'AVALANCHE' | 'FANTOM';

export const dataNetwork = (network: TNetwork) => {
  let dataNetwork = null;

  switch (network) {
    case 'BSC':
      dataNetwork = BSCNetwork;
      return dataNetwork;
    case 'AVALANCHE':
      dataNetwork = AVAXNetwork;
      return dataNetwork;
    case 'MATIC':
      dataNetwork = MATICNetwork;
      return dataNetwork;
    case 'ETHERUM':
      dataNetwork = ETHERMNetwork;
      return dataNetwork;
    case 'FANTOM':
      dataNetwork = FTMNetwork;
      return dataNetwork;
    default:
      dataNetwork = BSCNetwork;
      return dataNetwork;
  }
};

export const networkName = (index: number) => {
  let network: TNetwork = null;

  switch (index) {
    case 0:
    case 4:
      network = 'BSC';
      return network;
    case 3:
    case 7:
      network = 'MATIC';
      return network;

    case 1:
    case 5:
      network = 'AVALANCHE';
      return network;
    case 2:
    case 6:
      network = 'FANTOM';
      return network;
    case 8:
      network = 'ETHERUM';
      return network;
    default:
      network = 'BSC';
      return network;
  }
};
