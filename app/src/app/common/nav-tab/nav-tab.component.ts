import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CrudBaseService } from 'src/app/services/crud-base.service';

@Component({
  selector: 'app-nav-tab',
  templateUrl: './nav-tab.component.html',
  styleUrls: ['./nav-tab.component.scss']
})
export class NavTabComponent implements OnInit {

  @Input() navMenu: any = [];
  @Output() selectMenu = new EventEmitter();

  constructor(
    private service: CrudBaseService
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    if (this.navMenu.length > 0)
      this.selectMenu.emit(this.navMenu[0])
  }

  setSelectMenu(menu: any){
    this.selectMenu.emit(menu)
  }

}
