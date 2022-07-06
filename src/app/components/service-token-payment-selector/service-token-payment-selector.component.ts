import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-service-token-payment-selector',
  templateUrl: './service-token-payment-selector.component.html',
  styleUrls: ['./service-token-payment-selector.component.scss'],
})
export class ServiceTokenPaymentSelectorComponent implements OnInit {
  networks: any;
  currentToken = 0;
  networkId = 0;
  acceptedPaymentTokens: any;
  @Output() selectedTokenAddres = new EventEmitter();

  constructor(public web3Service: Web3Service) {
    this.web3Service.currentNetworkId.subscribe((r) => {
      this.networkId = r;
      this.networks = this.web3Service.network;

      this.acceptedPaymentTokens = this.networks[0].acceptedPaymentTokens;

      // algunas veces manda networkId como un numero y otras como un hexadecimal como texto, funcionan la bsc y eter
      // porque coincide en ambos pero al cambiar a polygon o harmony peta. Lo he intentado convirtiendo a hex primero
      // con this.networdId.toFixed(16) y luego con este código de abajo. Sigue petando a veces, hay que unificar todo,
      // no podemos mandar un number y en network.js tener hexadecimales.

      const res = this.networks.find(
        (x) => x.params.chainId === '0x' + ('0' + Number(this.networkId).toString(16)).slice(-2).toUpperCase()
      );
      if (res) {
        this.networkId = res.index;
      }

      this.acceptedPaymentTokens = this.networks[this.networkId].acceptedPaymentTokens;

      // this.acceptedPaymentTokens = this.networks[this.currentNetworkIdSubject.value].acceptedPaymentTokens;
      // console.log({a: this.currentNetworkIdSubject.value});
    });
  }

  ngOnInit(): void {}

  // tslint:disable-next-line:typedef
  async OnPaymentTokenSelectChange(changeEvent: MatSelectChange) {
    const res = this.networks.find((x) => x.params.chainId === '0x' + ('0' + Number(this.networkId).toString(16)).slice(-2).toUpperCase());
    if (res) {
      this.networkId = res.index;
    }
    // this.selectedTokenAddres.emit({...this.networks[this.networkId].acceptedPaymentTokens[changeEvent.value], id:changeEvent.value});
    // this.currentToken = changeEvent.value;
  }
}
