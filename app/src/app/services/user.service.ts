import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';


@Injectable({
  providedIn: 'root'
})
export class UserService extends CrudBaseService{

  logoff(): Observable<any>{
    return this.http.get<any>(this.urlApi + "logoff")
  }

  logoffButton(){
    this.logoff().subscribe(
      success => {
        if (success.success){
          localStorage.removeItem('@coutec/token');
          window.location.href = "/";
        } else {
          console.log('Erro ao sair')
        }
      },
      error => {
        localStorage.removeItem('@coutec/token');
        window.location.href = "/";
      }
    )
  }

  get(){
    return this.http.get<any>(this.urlApi + "user")
  }

  resetPassword(username: string): Observable<any>{
    return this.http.post<any>(this.urlApi + 'resetpassword', {
      username: username
    })
  }

  suporte(model: any): Observable<any>{
    return this.http.post<any>(this.urlApi + 'suporte', model)
  }

  login(username: string, password: string): Observable<any>{
    return this.http.post<any>(this.urlApi + 'login', {
      username: username,
      password: password
    })
  }
}
