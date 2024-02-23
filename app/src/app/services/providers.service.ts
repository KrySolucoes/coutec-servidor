import { Injectable } from '@angular/core';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService extends CrudBaseService{
  base_route = "providers";
}
