import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetsService } from 'src/app/services/assets.service';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent implements OnInit {
  asset_types: any[] = []
  serviceOrders: any[] = []
  installations: any[] = []
  model: any = {}
  selectedComponent: any = null
  selectedMenu: any;
  navMenu = [
    {
      name: 'Dados Principais',
      id: 1,
      active: false
    },{
      name: 'Componentes',
      id: 2,
      active: false
    },{
      name: 'Ordens de Serviço',
      id: 3,
      active: false
    }
  ]
  @ViewChild('myForm')
  private myForm: any = null;

  constructor(
    protected service: AssetsService,
    private route: ActivatedRoute,
    protected serviceOrdersService: ServiceOrdersService,
    private router: Router,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() public dialogRef: MatDialogRef<AssetComponent>,
    public dialog: MatDialog
  ) { }

  get asset_types_component(){
    return this.asset_types.filter(x => x.type == 'Componente')
  }

  get asset_types_filter(){
    if (this.model.parent_uuid){
      return this.asset_types_component
    }
    return this.asset_types.filter(x => x.type == 'Ativo')
  }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    let uuid = this.route.snapshot.paramMap.get('uuid')
    let parent_uuid = this.route.snapshot.paramMap.get('parent_uuid')
    if(parent_uuid){
      this.model.parent_uuid = parent_uuid
    }
    if (this?.data?.uuid){
      uuid = this?.data?.uuid
    } else if (this?.data?.asset){
      this.model.parent_uuid = this?.data?.asset?.uuid
      this.model.installations_uuid = this?.data?.asset?.installations_uuid
      this.model.marca = this?.data?.asset?.marca
      if(!this.model?.codigo_identificador){
        let components = this?.data?.asset?.components
        let numCode = String(components.length + 1)
        if(Number(numCode) <= 9) {
          numCode = '0' + numCode
        }
        this.model.codigo_identificador = this?.data?.asset?.codigo_identificador + "COMP" + numCode
      }
    }
    this.model.uuid = uuid != 'new' ? uuid : null
    this.get()
    this.service.genericList("asset_types").subscribe(
      success => {
        if (success.success){
          this.asset_types = success[success.data_name]
        } else {
          alert('Erro ao buscar tipo de ativo')
        }
      },
      error => {
        alert('Erro ao buscar tipo de ativo')
      }
    )
    this.service.genericList("installations").subscribe(
      success => {
        if (success.success){
          this.installations = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
    if (this.model?.uuid != null){
      this.serviceOrdersService.list("asset_uuid="+this.model.uuid).subscribe(
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
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  setComponent(component: any = null){
    this.selectedComponent = !component ? {} : component
  }

  openComponente(model: any = null){
    this.openComponent(AssetComponent, model?.uuid)
  }

  openComponent(component: any, uuid: any){
    let dialogRef = this.dialog.open(component, {
      width: '800px',
      data: {
        asset: this.model,
        uuid: uuid
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.get()
    })
  }

  saveComponent(){
    this.selectedComponent.parent_uuid = this.model.uuid
    this.service.save(this.selectedComponent).subscribe(
      success => {
        if (success.success){
          this.get()
          this.selectedComponent = null
          alert('Salvo com sucesso!')
        } else {
          alert('Erro ao salvar ativo')
        }
      },
      error => {
        alert('Erro ao salvar ativo')
      }
    )
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
          alert('Erro ao buscar ativo')
        }
      },
      error => {
        alert('Erro ao buscar ativo')
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
          if(!this.dialogRef){
            this.get()
          } else {
            this.dialogRef.close(this.model)
          }
          this.get()
          alert('Salvo com sucesso!')
        } else {
          alert('Erro ao salvar ativo')
        }
      },
      error => {
        alert('Erro ao salvar ativo')
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
            this.router.navigate(['admin/assets/'])
          },
          error => {
            alert('Erro ao excluir')
          }
        )
      }
    })
  }
}
