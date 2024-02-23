import { Injectable } from '@angular/core';
import { CrudBaseService } from './crud-base.service';

@Injectable({
  providedIn: 'root'
})
export class AssetTypesService extends CrudBaseService{
  base_route = "asset_types";
}
