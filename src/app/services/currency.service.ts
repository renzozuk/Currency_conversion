import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private apiUrl = "https://api.nbp.pl/api/exchangerates/rates/";
  private currenciesAddress = "currencies.json";

  constructor(private client: HttpClient) { }

  getResponse(group: string, currency: string): Observable<any> {
    return this.client.get(`${this.apiUrl}${group}/${currency}`);
  }

  getDatedResponse(group: string, currency: string, date: string): Observable<any> {
    return this.client.get(`${this.apiUrl}${group}/${currency}/${date}`);
  }

  getCurrencies(): Observable<{currenciesA: string[], currenciesB: string[]}> {
    return this.client.get<{currenciesA: string[], currenciesB: string[]}>(this.currenciesAddress);
  }
}
