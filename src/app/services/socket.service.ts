import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import ReconnectingWebSocket from "reconnecting-websocket";
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private WEB_SOCKET_URL: string = environment.WEB_SOCKET_URL;

  rws: ReconnectingWebSocket;
  constructor(wallet_adrress: string) {
    this.rws = new ReconnectingWebSocket(this.WEB_SOCKET_URL + wallet_adrress);
  }


}