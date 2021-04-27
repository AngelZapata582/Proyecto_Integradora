import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PeticionService {
  apiURL = environment.apiURL;

  constructor(private http:HttpClient) { }

  sendPet(valor:any):Observable<any>{
    const pet= {valor:valor}
    return this.http.post(this.apiURL + 'LlenarP', pet)
  }

  cancelPet():Observable<any>{
    return this.http.post(this.apiURL + 'LlenarP/Cancel',null)
  }

  sendFlag():Observable<any>{
    return this.http.post(this.apiURL + 'Regado/Encendido',null)
  }

  cancelFlag():Observable<any>{
    return this.http.post(this.apiURL + 'Regado/Apagado',null)
  }

  checkFlag():Observable<any>{
    return this.http.get(this.apiURL + 'Regado/Check')
  }

  checkFlagLlenado():Observable<any>{
    return this.http.get(this.apiURL + 'LlenarP/Check')
  }
}
