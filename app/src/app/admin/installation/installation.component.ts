import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InstallationsService } from 'src/app/services/installations.service';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.scss']
})
export class InstallationComponent implements OnInit {

  model: any = {}
  selectedMenu: any;
  relevances: any[] = []
  serviceOrders: any[] = []
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
    },{
      name: 'Ordens de Serviço',
      id: 4,
      active: false
    }
  ]
  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    protected service: InstallationsService,
    protected serviceOrdersService: ServiceOrdersService,
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
          alert('Erro ao buscar instalação')
        }
      },
      error => {
        alert('Erro ao buscar instalação')
      }
    )
    this.serviceOrdersService.list("filter=installation_uuid eq '"+this.model.uuid+"'").subscribe(
      success => {
        if (success.success){
          this.serviceOrders = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
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
          alert('Erro ao salvar instalação')
        }
      },
      error => {
        alert('Erro ao salvar instalação')
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
            this.router.navigate(['admin/installations/'])
          },
          error => {
            alert('Erro ao excluir')
          }
        )
      }
    })
  }
}
