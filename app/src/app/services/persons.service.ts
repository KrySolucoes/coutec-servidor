import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class PersonsService extends CrudBaseService{
  base_route = "persons";

  getByProfile(profile_uuid: string): Observable<any>{
    let filter = "?filter=profile_uuid eq '" + profile_uuid + "'"
    return this.http.get<any>(this.urlApi + 'object/' + this.base_route + filter)
  }
}
