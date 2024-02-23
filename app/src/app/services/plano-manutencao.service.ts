import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class PlanoManutencaoService extends CrudBaseService{
  base_route = "maintenance_plan";
}
