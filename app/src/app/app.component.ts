import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';
import { ConfigurationsService } from './services/configurations.service';
import { LoadingService } from './services/loagind.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  router: any = null
  loading: boolean = false;
  title = 'coutec';
  navShow: boolean = false;

  constructor(
    router: Router,
    private service: ConfigurationsService,
    private userService: UserService,
    private _loading: LoadingService,
  ) {
    this.router = router;
  }

  get user(){
    return this.service.user
  }

  get route(){
    let data = this.router.url.split('/')
    let _return = data[0] == '' ? data[1] : data[0]
    _return = _return?.split('?')[0]
    if (_return != '' && _return != 'login' && !this.service.user){
      this.service.user = {}
      this.userService.get().subscribe(
        success => {
          if (success.success){
            this.service.user = success.user
          }
        },
        error => {
          console.log('Erro ao buscar')
        }
      )
    }
    return _return
  }

  ngOnInit() {
    this.listenToLoading();
    this.service.load();
  }

  navOpen(){
    this.navShow = !this.navShow
  }

  listenToLoading(): void {
    this._loading.loadingSub
      .pipe(delay(0)) // This prevents a ExpressionChangedAfterItHasBeenCheckedError for subsequent requests
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
}
