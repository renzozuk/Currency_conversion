import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private apiUrl = "https://api.nbp.pl/api/exchangerates/rates/a/";

  constructor(private client: HttpClient) { }

  getResponse(currency: string): Observable<any> {
    return this.client.get(this.apiUrl + currency);
  }
}
