import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService extends BaseService{
  base_route = "configurations_app";
  configurations: any = {};
  user: any = null;

  constructor(
    protected http: HttpClient,
  ) { super() }

  save(){
    this.http.post<any>(this.urlApi + 'object/' + this.base_route, this.configurations).subscribe(
      success => {
        if (success.success){
          alert('Salvo com sucesso!')
        } else {
          alert('Erro ao buscar ajustes')
        }
      },
      error => {
        alert('Erro ao buscar ajustes')
      }
    )
  }

  load(){
    this.http.get<any>(this.urlApi + 'configurations').subscribe(
      success => {
        if (success.success){
          this.configurations = success[success.data_name]
          // this.loadImage()
        } else {
          alert('Erro ao buscar ajustes')
        }
      },
      error => {
        alert('Erro ao buscar ajustes')
      }
    )
  }

  // loadImage(){
  //   if (this.configurations?.image_uuid == null || this.configurations?.image_uuid == ''){
  //     return
  //   }
  //   this.http.get<any>(this.urlApi + 'object/uploads/' + this.configurations?.image_uuid).subscribe(
  //     success => {
  //       if (success.success){
  //         this.configurations.image = success[success.data_name]
  //       } else {
  //         alert('Erro ao buscar')
  //       }
  //     },
  //     error => {
  //       alert('Erro ao buscar')
  //     }
  //   )
  // }
}
