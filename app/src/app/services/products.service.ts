import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService extends CrudBaseService{
  base_route = "products";
}
