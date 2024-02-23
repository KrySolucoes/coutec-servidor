import { UpdatePasswordModalComponent } from './../common/update-password-modal/update-password-modal.component';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { ConfigurationsService } from './configurations.service';


@Injectable({
  providedIn: 'root'
})
export class CrudBaseService extends BaseService{
  base_route = "";

  constructor(
    protected http: HttpClient,
    protected configurationsService: ConfigurationsService,
    public dialog: MatDialog
  ) { super() }

  get user(){
    return this.configurationsService?.user
  }

  get configurations(){
    return this.configurationsService?.configurations
  }

  updatePasswordModal(){
    let dialogRef = this.dialog.open(UpdatePasswordModalComponent, {
      width: '600px',
      data: {}
    });
  }

  updatePassword(password: string, new_password: string){
    return this.http.post<any>(
      this.urlApi + 'user/new_password',
      {
        password: password,
        new_password: new_password,
      }
    )
  }

  saveConfigurations(){
    this.configurationsService.save();
  }

  genericList(base_route: string): Observable<any>{
    return this.http.get<any>(this.urlApi + 'object/' + base_route)
  }

  genericCount(base_route: string): Observable<any>{
    return this.http.get<any>(this.urlApi + 'object/' + base_route + '/all/count')
  }

  sum(attribute: string, filter: any = null): Observable<any>{
    filter = filter ? '?' + filter : ''
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + '/' + attribute + '/sum' + filter)
  }

  count(params: any = null): Observable<any>{
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + '/all/count' + (params ? '?'+params : ''))
  }

  list(params: any = null): Observable<any>{
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + (params ? '?'+params : ''))
  }

  get(uuid: string, filter: any = null): Observable<any>{
    filter = filter ? '?' + filter : ''
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + '/' + uuid + filter)
  }

  delete(uuid: string): Observable<any>{
    return this.http.delete<any>(this.urlApi + 'object/' + this.base_route + '/' + uuid)
  }

  save(objeto: any, loading: boolean = true): Observable<any>{
    let _loading = "?loading=" + (loading ? 'true': 'false')
    if (objeto?.uuid){
      return this.http.put<any>(this.urlApi + 'object/' + this.base_route + '/' + objeto.uuid + _loading, objeto)
    } else {
      return this.http.post<any>(this.urlApi + 'object/' + this.base_route + _loading, objeto)
    }
  }
}
