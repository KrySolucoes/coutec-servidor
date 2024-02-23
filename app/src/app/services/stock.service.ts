import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class StockService extends CrudBaseService{
  base_route = "stocks";

  estoque(product_uuid: any): Observable<any>{
    return this.sum('quantidade', "filter=product_uuid eq '" + product_uuid + "'")
  }

  ultimaCompra(product_uuid: any = null): Observable<any>{
    // let filter = "&filter=name eq 'Hello World' and product_uuid eq 'teste'"
    let filter = ""
    if (product_uuid){
      filter = "&filter=product_uuid eq '" + product_uuid + "'"
    }
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + '?size=1&order=data_compra desc&page=1' + filter)
  }
}
