import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceOrdersService extends CrudBaseService{
  base_route = "service_orders";

  saveEvidence(objeto: any): Observable<any>{
    if (objeto?.uuid){
      return this.http.put<any>(this.urlApi + 'object/service_orders_evidences/' + objeto.uuid, objeto)
    } else {
      return this.http.post<any>(this.urlApi + 'object/service_orders_evidences', objeto)
    }
  }

  deleteProduct(uuid: any): Observable<any>{
    return this.http.delete<any>(this.urlApi + 'object/service_orders_products/' + uuid)
  }

  saveProduct(objeto: any): Observable<any>{
    if (objeto?.uuid){
      return this.http.put<any>(this.urlApi + 'object/service_orders_products/' + objeto.uuid, objeto)
    } else {
      return this.http.post<any>(this.urlApi + 'object/service_orders_products', objeto)
    }
  }
}
