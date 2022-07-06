import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl: string = environment.urlApi;

  constructor(private http: HttpClient) {}

  login(wallet_address: any) {
    return this.http.post<any>(this.apiUrl + '/auth/client', {wallet_address});
  }

  createToken(createToken: any, jwt:any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}` })
    };
    return this.http.post<any>(this.apiUrl + '/verify/new', createToken, httpOptions);
  }

  insertWhitelist(whitelist: any, jwt:any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}` })
    };
    return this.http.post<any>(this.apiUrl + '/whitelist/new', whitelist, httpOptions);
  }

  getWhitelist(contract_address:string, jwt:any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}` })
    };
    return this.http.get<any>(this.apiUrl + `/whitelist/${contract_address}`, httpOptions);
  }
}
