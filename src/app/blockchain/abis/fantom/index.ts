import { FTMTokenAbi } from './tokenAbi';
import { RouterAbi } from './routerAbi';
import { FactoryAbi } from './factoryAbi';
import { TokenGeneratorAbi } from './TokenGeneratorAbi';

export const FTMNetwork = {
  ABI: FTMTokenAbi,
  GENERATOR_ABI: TokenGeneratorAbi,
  ROUTER_ABI: RouterAbi,
  FACTORY_ABI: FactoryAbi
};
