import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetsService } from 'src/app/services/assets.service';
import { PersonsService } from 'src/app/services/persons.service';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';

@Component({
  selector: 'app-service-order-print',
  templateUrl: './service-order-print.component.html',
  styleUrls: ['./service-order-print.component.scss']
})
export class ServiceOrderPrintComponent implements OnInit {

  model: any = {}
  tecnicos_base: any[] = []
  components_base: any[] = []
  asset_types: any[] = []
  constructor(
    protected service: ServiceOrdersService,
    protected personsService: PersonsService,
    protected assetsService: AssetsService,
    @Optional() public dialogRef: MatDialogRef<ServiceOrderPrintComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data){
      this.model = this.data
    }
    this.get()
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
  }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  get componentsStr(){
    return this.model?.assets_object.map((x: any) => x.name).join(', ')
  }

  get tecnicos(){
    return this.tecnicos_base.filter(x => this.model?.tecnicos?.filter((y: any) => y == x.uuid).length > 0)
  }

  get tecnicosStr(){
    return this.tecnicos.map(x => x.name).join(', ')
  }

  get produtos(){
    return this.model?.products?.filter((x: any) => x.product?.type == 'Produto')
  }

  get servicos(){
    return this.model?.products?.filter((x: any) => x.product?.type == 'Serviço')
  }

  get servicosExecutar(){
    return this.servicos?.map((x: any) => {return x.product?.name + ' (tempo de execução: ' + x.product?.tempo_medio_execucao + ')'}).join('; ')
  }

  get total_geral(){
    if(!this.model?.products) return 0;
    var total = 0
    for(let x of this.model?.products)
      total = total + (x.preco * x.quantidade)
    if (this.model?.deslocamento){
      total = total + this.model.deslocamento
    }
    return total
  }

  get total_servicos(){
    if(!this.servicos) return 0;
    var total = 0
    for(let x of this.servicos)
      total = total + (x.preco * x.quantidade)
    return total
  }

  get total_produtos(){
    if(!this.produtos) return 0;
    var total = 0
    for(let x of this.produtos)
      total = total + (x.preco * x.quantidade)
    return total
  }

  numberToMoney(number: any, decimal: any = 2){
    if(!number) return number;
    var number = number.toFixed(decimal).split('.');
    number[0] = number[0].split(/(?=(?:...)*$)/).join('.');
    return number.join(',')
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
}
