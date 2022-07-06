import { BnbTokenAbiss } from './tokenAbi';
import { RouterAbi } from './routerAbi';
import { TokenGeneratorAbi } from './TokenGeneratorAbi';
import { FactoryAbi } from './factoryAbi';

export const BSCNetwork = {
  ABI: BnbTokenAbiss,
  ROUTER_ABI: RouterAbi,
  GENERATOR_ABI: TokenGeneratorAbi,
  FACTORY_ABI: FactoryAbi
};
