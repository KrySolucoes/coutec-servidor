import { Injectable } from '@angular/core';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class InstallationsService extends CrudBaseService{
  base_route = "installations";
}
