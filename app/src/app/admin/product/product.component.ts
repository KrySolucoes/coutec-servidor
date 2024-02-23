import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';
import { StockService } from 'src/app/services/stock.service';
import Swal from 'sweetalert2';
import { StockComponent } from '../stock/stock.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  model: any = {}
  installations: any[] = []
  // qtdEstoque: any = '-'
  ultimaCompra: any = {
    data_compra: '-',
    price: '-'
  }
  selectedMenu: any;
  navMenu = [
    {
      name: 'Dados Principais',
      id: 1,
      active: false
    }
  ]
  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    protected service: ProductsService,
    protected stockService: StockService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router
  ) { }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    let uuid = this.route.snapshot.paramMap.get('uuid')
    this.model.uuid = uuid != 'new' ? uuid : null
    this.get()
    this.getUltimaCompra()
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
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  getUltimaCompra(){
    if (this.model?.uuid == null){
      return
    }
    if (this.user?.roles?.includes('administrador')){
      this.stockService.ultimaCompra(this.model.uuid).subscribe(
        success => {
          if (success.success){
            this.ultimaCompra = success[success.data_name][0]
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

  get(){
    if (this.model?.uuid == null){
      return
    }
    this.service.get(this.model.uuid).subscribe(
      success => {
        if (success.success){
          this.model = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
  }

  insertStock(){
    // return;
    let dialogRef = this.dialog.open(StockComponent, {
      width: '600px',
      data: {
        product_uuid: this.model.uuid
      }
    });
    dialogRef.afterClosed().subscribe(data=>{
      this.get()
      this.getUltimaCompra()
    })
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
