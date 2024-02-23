import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent implements OnInit {

  topbarOpen: boolean = false;
  @Output() navOpen = new EventEmitter();

  constructor(
    private service: UserService
  ) { }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service.configurations
  }

  updatePassword(){
    this.service.updatePasswordModal()
  }

  logoff(){
    this.service.logoffButton()
  }

  ngOnInit(): void {
  }

  setNavOpen(){
    this.navOpen.emit()
  }
}
