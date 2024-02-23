import { ProvidersService } from './../../services/providers.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss']
})
export class ProviderComponent implements OnInit {

  model: any = {}
  selectedMenu: any;
  relevances: any[] = []
  navMenu = [
    {
      name: 'Dados Principais',
      id: 1,
      active: false
    },{
      name: 'Endereço',
      id: 2,
      active: false
    },{
      name: 'Responsável',
      id: 3,
      active: false
    }
  ]
  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    protected service: ProvidersService,
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
    this.service.genericList("relevances").subscribe(
      success => {
        if (success.success){
          this.relevances = success[success.data_name]
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
          alert('Erro ao buscar fornecedor')
        }
      },
      error => {
        alert('Erro ao buscar fornecedor')
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
          alert('Erro ao salvar fornecedor')
        }
      },
      error => {
        alert('Erro ao salvar fornecedor')
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
