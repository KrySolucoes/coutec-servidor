import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudBaseService } from 'src/app/services/crud-base.service';
import { PersonsService } from 'src/app/services/persons.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
  model: any = {}
  selectedMenu: any;
  navMenu = [
    {
      name: 'Dados Principais',
      id: 1,
      active: false
    }
  ]
  installations: any[] = [];
  profiles: any[] = [];

  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    protected service: PersonsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    let uuid = this.route.snapshot.paramMap.get('uuid')
    this.model.uuid = uuid != 'new' ? uuid : null
    this.get()
    this.service.genericList("installations").subscribe(
      success => {
        if (success.success){
          this.installations = success[success.data_name]
        } else {
          alert('Erro ao buscar instalações')
        }
      },
      error => {
        alert('Erro ao buscar instalações')
      }
    )
    this.service.genericList("profiles").subscribe(
      success => {
        if (success.success){
          this.profiles = success[success.data_name]
        } else {
          alert('Erro ao buscar perfil')
        }
      },
      error => {
        alert('Erro ao buscar perfil')
      }
    )
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  get(){
    if (this.model?.uuid == null){
      return
    }
    this.service.get(this.model.uuid).subscribe(
      success => {
        if (success.success){
          this.model = success[success.data_name]
        } else {
          alert('Erro ao buscar pessoa')
        }
      },
      error => {
        alert('Erro ao buscar pessoa')
      }
    )
  }

  save(){
    if (!this.myForm?.valid){
      return;
    }
    this.service.save(this.model).subscribe(
      success => {
        if (success.success){
          this.model.uuid = success.uuid
          this.get()
          alert('Salvo com sucesso!')
        } else {
          alert('Erro ao salvar pessoa')
        }
      },
      error => {
        alert('Erro ao salvar pessoa')
      }
    )
  }
  delete(){
    Swal.fire({
      title: 'Excluir este registro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: this.configurations?.color_01,
      confirmButtonText: 'Sim, pode excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(this.model.uuid).subscribe(
          success => {
            Swal.fire(
              'Excluido!',
              'Registro excluído com sucesso.',
              'success'
            )
            this.router.navigate(['admin/products/'])
          },
          error => {
            alert('Erro ao excluir')
          }
        )
      }
    })
  }
}
