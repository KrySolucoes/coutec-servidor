import { StockService } from './../../services/stock.service';
import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {

  model: any = {}
  providers: any[] = []
  products: any[] = []
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
    protected service: StockService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() public dialogRef: MatDialogRef<StockComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    let uuid = this.route.snapshot.paramMap.get('uuid')
    this.model.uuid = uuid != 'new' ? uuid : null
    this.get()
    this.service.genericList("providers").subscribe(
      success => {
        if (success.success){
          this.providers = success[success.data_name]
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
  }

  closeDialog() {
    if (this.data){
      this.dialogRef.close();
    }
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  get(){
    if (this.data){
        this.model.product_uuid = this.data?.product_uuid
    }
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

  save(){
    if (!this.myForm?.valid){
      return;
    }
    this.service.save(this.model).subscribe(
      success => {
        if (success.success){
          this.model.uuid = success.uuid
          if (this.data){
            this.closeDialog()
            return
          }
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
            this.router.navigate(['admin/stock/'])
          },
          error => {
            alert('Erro ao excluir')
          }
        )
      }
    })
  }
}
function MD_DIALOG_DATA(MD_DIALOG_DATA: any) {
  throw new Error('Function not implemented.');
}

