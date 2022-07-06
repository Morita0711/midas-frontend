import { Pipe, PipeTransform } from '@angular/core';
import Web3 from 'web3';

@Pipe({
  name: 'fromWei'
})

export class FromWeiPipe implements PipeTransform{
    transform(n: number) : string {
        return  Number(Web3.utils.fromWei(n.toString(), 'ether')).toFixed(6);
    }
}