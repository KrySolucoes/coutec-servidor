import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardsService } from 'src/app/services/deshboards.service';

@Component({
  selector: 'app-dashboard-estoque',
  templateUrl: './dashboard-estoque.component.html',
  styleUrls: ['./dashboard-estoque.component.scss']
})
export class DashboardEstoqueComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  model: any = {}
  installations: any[] = []

  constructor(
    private service: DashboardsService
  ) { }

  get configurations(){
    return this.service.configurations
  }

  configuration = {
    columns: [
      {
        data: 'produto',
        title: 'Produto'
      },{
        data: 'qtd_entrada',
        title: 'Entrada'
      },{
        data: 'qtd_consumida',
        title: 'Saida'
      },{
        data: 'saldo',
        title: 'Saldo'
      },{
        data: 'valor_investido',
        title: 'Valor Investido',
        type: 'currency'
      },{
        data: 'valor_faturado',
        title: 'Valor Faturado',
        type: 'currency'
      },{
        data: 'resultado',
        title: 'Resultado',
        type: 'currency'
      }
    ]
  }

  ngOnInit(): void {
    this.get()
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

  toMoney(valor: number, decimal: number = 2, prefix: string = ''){
    if(!valor) return valor;
    var number = valor.toFixed(decimal).split('.');
    number[0] = number[0].split(/(?=(?:...)*$)/).join('.');
    return prefix + number.join(',').replace('-.', '-');
  }

  get valor_do_estoque(){
    if (!this.model.counts?.estoque) return 0
    var total = 0
    for(let x of this.model.counts.estoque?.filter((x: any)=> x.valor_do_estoque)){
      total += x.valor_do_estoque
    }
    return total
  }

  get valor_investido(){
    if (!this.model.counts?.estoque) return 0
    var total = 0
    for(let x of this.model.counts.estoque?.filter((x: any)=> x.valor_investido)){
      total += x.valor_investido
    }
    return total
  }

  get(){
    let filter = ''
    if (this.model?.installations_uuid){
      filter = 'installations_uuid=' + this.model.installations_uuid
    }
    if (this.model?.data_inicio){
      filter += filter ? '&' : ''
      filter += 'data_inicio=' + this.model.data_inicio
    }
    if (this.model?.data_final){
      filter += filter ? '&' : ''
      filter += 'data_final=' + this.model.data_final
    }
    this.service.get('estoque', filter).subscribe(
      success => {
        if (success.success){
          this.model.counts = success[success.data_name]
          this.dataSource = new MatTableDataSource(this.model.counts?.estoque)
        } else {
          console.log('Erro ao buscar')
        }
      },
      error => {
        console.log('Erro ao buscar')
      }
    )
  }
}
