import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudBaseService } from 'src/app/services/crud-base.service';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss']
})
export class ConfigurationsComponent implements OnInit {

  model: any = {}
  selectedMenu: any;
  relevances: any[] = []
  navMenu = [
    {
      name: 'Configurações',
      id: 1,
      active: false
    },
    {
      name: 'Email',
      id: 2,
      active: false
    }
  ]

  constructor(
    public service: CrudBaseService,
    private route: Router
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  save(){
    this.service.saveConfigurations();
  }

}
