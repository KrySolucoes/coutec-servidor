import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export abstract class BaseService {
  protected urlApi: string = environment.urlApi;

}
