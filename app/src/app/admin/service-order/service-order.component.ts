import { TipoDefeitoModalComponent } from './../../common/tipo-defeito-modal/tipo-defeito-modal.component';
import { PersonComponent } from './../person/person.component';
import { Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';
import { PersonsService } from 'src/app/services/persons.service';
import { AssetsService } from 'src/app/services/assets.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ServiceOrderPrintComponent } from '../service-order-print/service-order-print.component';

@Component({
  selector: 'app-service-order',
  templateUrl: './service-order.component.html',
  styleUrls: ['./service-order.component.scss']
})
export class ServiceOrderComponent implements OnInit {

  showValues: boolean = false
  model: any = {}
  filterSelect: any = {
    products: true,
    services: true
  }
  selectedMenu: any;
  selectedProduct: any = null;
  selectedEvidence: any = null;
  installations: any[] = []
  products: any[] = []
  assets: any[] = []
  status_list_base: any[] = []
  tecnicos_base: any[] = []
  components_base: any[] = []
  status_order_save: number = 1;
  tipoManutencaoList: any[] = []
  navMenuBase = [
    {
      name: 'Dados Principais',
      id: 1,
      active: false
    },{
      name: 'Produtos/Serviços',
      id: 2,
      active: false
    },{
      name: 'Arquivos',
      id: 3,
      active: false
    },{
      name: 'Comentários',
      id: 4,
      active: false
    }
  ]
  @ViewChild('myForm')
  private myForm: any = null;
  get navMenu(){
    if (!this.model?.uuid){
      return this.navMenuBase.filter(x => x.id == 1)
    }
    return this.navMenuBase
  }
  constructor(
    protected service: ServiceOrdersService,
    protected personsService: PersonsService,
    protected assetsService: AssetsService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  get user(){
    if (this.tipoManutencaoList.length == 0 && this.service?.user?.roles){
      if (!this.model.uuid && this.service?.user?.roles?.includes('técnico')){
        this.tipoManutencaoList = [
          {id: 'Corretiva'}
        ]
        this.model.maintenance_type = 'Corretiva'
      } else {
        this.tipoManutencaoList = [
          {id: 'Corretiva'},
          {id: 'Preventiva'},
          {id: 'Inspeção'},
          {id: 'Preditiva'},
          {id: 'Lubrificação'}
        ]
      }
    }
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  get assetsFilter(){
    if (!this.model?.installation_uuid) return []
    if (!this.assets) return []
    return this.assets.filter(x => x.installations_uuid == this.model?.installation_uuid || x.uuid == this.model?.asset_uuid)
  }

  get asset(){
    if (!this.model?.asset_uuid) return null
    if (!this.assets) return null
    let _asset = this.assets.filter(x => x.uuid == this.model?.asset_uuid)
    if (_asset.length > 0){
      return _asset[0]
    }
    return null
  }

  get productsFilter(){
    let value =this.products?.filter(x =>
      (x.type == 'Serviço' && this.filterSelect.services)
      || ((x.type == 'Produto' && x.estoque_atual > 0) && this.filterSelect.products && x?.installations_uuid == this.model?.installation_uuid)
    )
    return value
  }

  get components(){
    return this.components_base?.filter(x => x?.parent_uuid && x?.parent_uuid == this.model?.asset_uuid)
  }

  get tecnicos(){
    return this.tecnicos_base.filter(x => x?.installation_uuid
      && x?.installation_uuid.includes(this.model?.installation_uuid)
    )
  }

  disableNewProduct(){
    if (this.statusModel?.order <= 4){
      return false
    }
    return this.disable
  }

  get disable(){
    return (this.statusModel?.order == 5 || this.statusModel?.order == 6) ? true : false
    // let d = this.statusModel?.order == 1 ? false : true
    // if (this.statusModel?.order == 2){
    //   d = false
    // }
    // return d
  }

  statusByUuid(uuid: any){
    let status = this.status_list_base.filter(x => x.uuid == uuid)
    return status.length == 0 ? null : status[0]
  }

  get statusModel(){
    return this.statusByUuid(this.model?.status_uuid)
  }

  get status_list(){
    if (!this.model?.uuid){
      return this.status_list_base.filter(x => x.order == 1)
    }
    if (!this.status_order_save){
      this.status_order_save = this.statusModel?.order
    }
    if (this.user?.roles?.includes('técnico')){
      if (this.status_order_save < 2 || this.status_order_save > 4){
        return this.status_list_base.filter(x => x.order == this.status_order_save);
      }
    }
    let prox_order = this.status_order_save + 1
    if (this.status_order_save == 3) prox_order = 5
    if (this.status_order_save == 4) prox_order = 3
    return this.status_list_base.filter(x => x.order == this.status_order_save || x.order == prox_order || x.order == (this.status_order_save + 1))
  }

  ngOnInit(): void {
    let uuid = this.route.snapshot.paramMap.get('uuid')
    this.model.uuid = uuid != 'new' ? uuid : null
    this.personsService.getByProfile('05678b84-fb0f-4e08-87e9-4802f6135423').subscribe(
      success => {
        if (success.success){
          this.tecnicos_base = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
    this.service.genericList("products").subscribe(
      success => {
        if (success.success){
          this.products = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
    this.assetsService.list().subscribe(
      success => {
        if (success.success){
          this.assets = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
    this.assetsService.listComponents().subscribe(
      success => {
        if (success.success){
          this.components_base = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
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
    this.service.genericList("service_orders_status").subscribe(
      success => {
        if (success.success){
          this.status_list_base = success[success.data_name]
          if (!this.model?.uuid){
            this.model.status_uuid = this.status_list_base.filter(x => x.order == 1)[0].uuid
          }
          this.get()
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
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

  setEvidence(component: any = null){
    this.selectedEvidence = !component ? {} : component
  }

  setProduct(component: any = null){
    this.selectedProduct = !component ? {} : component
  }

  numberToMoney(valor: number, decimal: number = 2){
    if(!valor) return valor;
    var number = valor.toFixed(decimal).split('.');
    number[0] = number[0].split(/(?=(?:...)*$)/).join('.');
    return number.join(',').replace('-.', '-')
  }

  get total(){
    if(!this.model?.products){
      this.model.products = []
    }
    let total = 0
    for (let x of this.model.products){
      total = total + (x.quantidade * x.preco)
    }
    return this.numberToMoney(total)
  }

  get(){
    if (this.model?.uuid == null){
      var d = new Date();
      this.model.data_entrada = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()
      return
    }
    this.service.get(this.model.uuid).subscribe(
      success => {
        if (success.success){
          this.model = success[success.data_name]
          this.status_order_save = this.statusModel?.order
          this.showValues = this.model?.mostrar_valor
        } else {
          alert('Erro ao buscar ordem de serviço')
        }
      },
      error => {
        alert('Erro ao buscar ordem de serviço')
      }
    )
  }

  saveComment(tipo_defeito: any = null){
    if (this.status_order_save == this.statusModel?.order){
      this.save()
      return
    }
    if (!this.myForm?.valid){
      return;
    }
    if (!tipo_defeito
      && this.model?.uuid
      && this.model?.maintenance_type == 'Corretiva'
      && this.model?.status_uuid == '9fa3d66d-0477-4f75-bc40-c60dc2205099'){
      let dialogRef = this.dialog.open(TipoDefeitoModalComponent, {
        width: '600px',
        data: {}
      });
      dialogRef.afterClosed().subscribe(data=>{
        if(data?.tipo_defeito){
          this.saveComment(data?.tipo_defeito)
        }
      })
      return;
    }
    if (tipo_defeito){
      this.model.tipo_defeito = tipo_defeito
    }
    Swal.fire({
      title: 'Insira um comentário',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      confirmButtonColor: this.configurations?.color_01,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.save(result.value)
      } else {
        this.get()
      }
    })
  }

  insertComment() {
    Swal.fire({
      title: 'Insira um comentário',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      confirmButtonColor: this.configurations?.color_01,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.save(result.value)
      } else {
        this.get()
      }
    })
  }

  save(comment: any = null, getAndAlert: boolean = true){
    if (!this.myForm?.valid){
      return;
    }
    this.model.mostrar_valor = this.showValues
    this.model.comment = comment
    this.service.save(this.model).subscribe(
      success => {
        if (success.success){
          this.model.uuid = success.uuid
          if(getAndAlert){
            this.get()
            alert('Salvo com sucesso!')
          }
        } else {
          alert('Erro ao salvar ordem de serviço')
        }
      },
      error => {
        alert('Erro ao salvar ordem de serviço')
      }
    )
  }

  loadProductSelect(uuid: any = null){
    var product = this.products.filter(x => x.uuid == uuid)[0]
    this.selectedProduct.preco = product.preco
    if (!this.selectedProduct.quantidade){
      this.selectedProduct.quantidade = 1
    }
  }

  saveEvidence(){
    this.selectedEvidence.service_orders_uuid = this.model.uuid
    this.service.saveEvidence(this.selectedEvidence).subscribe(
      success => {
        if (success.success){
          this.get()
          alert('Salvo com sucesso!')
        } else {
          alert('Erro ao salvar')
        }
      },
      error => {
        alert('Erro ao salvar')
      }
    )
  }

  deleteProduct(uuid: any){
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
        this.service.deleteProduct(uuid).subscribe(
          success => {
            Swal.fire(
              'Excluido!',
              'Registro excluído com sucesso.',
              'success'
            )
            this.selectedProduct = null
            this.get()
          },
          error => {
            alert('Erro ao excluir')
          }
        )
      }
    })
  }

  saveProduct(){
    this.selectedProduct.service_orders_uuid = this.model.uuid
    this.service.saveProduct(this.selectedProduct).subscribe(
      success => {
        if (success.success){
          this.selectedProduct = {}
          this.get()
          alert('Salvo com sucesso!')
        } else {
          alert('Erro ao salvar')
        }
      },
      error => {
        alert('Erro ao salvar')
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
            this.router.navigate(['admin/service-orders/'])
          },
          error => {
            alert('Erro ao excluir')
          }
        )
      }
    })
  }

  print(){
    if(!this.model.uuid) return
    let dialogRef = this.dialog.open(ServiceOrderPrintComponent, {
      width: '600px',
      data: this.model
    });
    dialogRef.afterClosed().subscribe(data=>{
    })
    // window.open('admin/service-orders-view/' + this.model.uuid, '_blank');
  }

}
