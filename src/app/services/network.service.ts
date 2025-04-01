import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private lacnicUrl = "https://rdap-redirect.lacnic.net/rdap/ip/";

  constructor(private client: HttpClient) { }

  getIPAddressWithWebRTC(): Promise<string> {
    return new Promise((resolve, reject) => {
      
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
  
      
      pc.createDataChannel('');
  
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(reject);
  
      pc.onicecandidate = (ice) => {
        if (!ice.candidate) {
          return;
        }
  
        const candidate = ice.candidate.candidate;
        const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
        const match = candidate.match(regex);
        
        if (match) {
          pc.onicecandidate = () => {};
          pc.close();
          resolve(match[1]);
        }
      };
  
      setTimeout(() => {
        pc.close();
        reject('Unable to determine IP address');
      }, 3000);
    });
  }

  getLacnicResponse(address: string): Observable<any> {
    return this.client.get(`${this.lacnicUrl}${address}`);
  }
}
