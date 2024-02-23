
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { from, Observable } from 'rxjs';
import {catchError, map } from 'rxjs/operators'
import { LoadingService } from './loagind.service';
import { SidebarComponent } from '../common/sidebar/sidebar.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private _loading: LoadingService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handle(request, next));
  }

  updateCounts(route: any){
    if (route.includes('/object/')){
      let _route = route.split('/object/')[1]
      if (_route.includes('/')){
        let base_route = _route.split('/')[0]
        SidebarComponent.counts = SidebarComponent.counts.filter(x => x?.objeto != base_route)
      }
    }
  }

  async handle(request: HttpRequest<any>, next: HttpHandler) {
    let loading = !request.url.includes('loading=false')
    const authReq = request.clone({
      setHeaders: {
        'Authorization': "Bearer " + localStorage.getItem('@coutec/token')
      }
    })
    if (loading) this._loading.setLoading(true, request.url);
    let handle = next.handle(authReq)
    return handle
      .pipe(catchError((err) => {
        if (loading) this._loading.setLoading(false, request.url);
        if (err?.status == 401 && err?.error == 'Unauthorized Access'){
          localStorage.removeItem('@coutec/token');
          let loginUrl = window.location.host.startsWith('localhost') || window.location.host.includes(':443') ? '/login' : '/' + (window.location.pathname.split('/')[1] || '') + '/login'
          loginUrl += '?redirect=' + encodeURIComponent(window.location.href)
          window.location.href = loginUrl;
        }
        return err
      }))
      .pipe(
        map((evt: any): any => {
          if (evt instanceof HttpResponse) {
            if (loading) this._loading.setLoading(false, request.url);
            if(request.method == 'PUT' || request.method == 'POST' || request.method == 'DELETE'){
              this.updateCounts(request.url)
            }
          }
          return evt
        })
      ).toPromise();
  }
}
