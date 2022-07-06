import { AVAXTokenAbi } from './tokenAbi';
import { RouterAbi } from './routerAbi';
import { TokenGeneratorAbi } from './TokenGeneratorAbi';
import { FactoryAbi } from './factoryAbi';

export const AVAXNetwork = {
  ABI: AVAXTokenAbi,
  ROUTER_ABI: RouterAbi,
  GENERATOR_ABI: TokenGeneratorAbi,
  FACTORY_ABI: FactoryAbi
};
