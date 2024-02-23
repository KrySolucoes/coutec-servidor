import { Injectable } from '@angular/core';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class UploadsService extends CrudBaseService{
  base_route = "uploads";
}
