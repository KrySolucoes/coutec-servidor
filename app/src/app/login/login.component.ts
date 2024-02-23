import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  page: any = 'login'
  showPassword: boolean = false;
  private username: any = null
  private password: any = null
  private redirect: any = null

  constructor(
    protected service: UserService,
    private route: ActivatedRoute
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  set _username(username: any){
    this.username = username
  }
  set _password(password: any){
    this.password = password
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.redirect = params?.redirect;
      }
    );
  }

  recuperaSenha(){
    if (this.username && this.username.length > 0){
      this.service.resetPassword(this.username).subscribe(
        success => {
          if (success.success){
            alert('Uma nova senha foi enviada para o seu email!')
            this.page = 'login'
          } else {
            alert('Erro ao fazer login')
          }
        },
        error => {
          alert('Erro ao fazer login')
        }
      )
    }
  }

  login(){
    this.service.login(this.username, this.password).subscribe(
      success => {
        if (success.success){
          localStorage.setItem('@coutec/token', success.token);
          if (this.redirect){
            window.location.href = decodeURIComponent(this.redirect)
          } else {
            window.location.href = window.location.href.replace('/login', '/admin');
          }
        } else {
          alert('Erro ao fazer login')
        }
      },
      error => {
        alert('Erro ao fazer login')
      }
    )
  }
}
