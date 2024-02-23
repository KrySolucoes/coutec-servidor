import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends CrudBaseService{
  base_route = "assets";

  listComponents(): Observable<any>{
    let filter = "?type=component"
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + filter)
  }
}
