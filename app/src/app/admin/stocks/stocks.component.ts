import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { StockService } from 'src/app/services/stock.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.scss']
})
export class StocksComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  sem_estoque: any = 0;
  constructor(
    protected service: StockService,
    private route: Router
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  get user(){
    return this.service?.user
  }

  configuration = {
    columns: [
      {
        data: 'produto',
        title: 'Produto'
      },
      {
        data: 'marca',
        title: 'Marca'
      },
      {
        data: 'modelo',
        title: 'Modelo'
      },
      {
        data: 'data_compra_str',
        title: 'Data da Emissão N.F.',
        dataType: 'date'
      },
      {
        data: 'data_entrega',
        title: 'Data da Entrega',
        dataType: 'date'
      },
      {
        data: 'qtd_entrada',
        title: 'Quantidade'
      },
      {
        data: 'price_str',
        title: 'Preço Unitário'
      },
      {
        data: 'price_total',
        title: 'Preço Total'
      },
      {
        data: 'fornecedor',
        title: 'Fornecedor'
      }
    ]
  }

  callbackTable(event: any){
    if(this.user?.roles?.includes('administrador')){
      this.open(event.element)
    }
  }

  numberToMoney(valor: number, decimal: number = 2){
    if(!valor) return valor;
    var number = valor.toFixed(decimal).split('.');
    number[0] = number[0].split(/(?=(?:...)*$)/).join('.');
    return number.join(',').replace('-.', '-')
  }

  get dash(){
    let estoque_baixo = []
    for(let x of this.dataSource.filteredData.filter(
      x => x.estoque_baixo_str == 'Sim'
    )){
      if(estoque_baixo.filter((y: any) => x.produto == y.produto).length == 0){
        estoque_baixo.push({
          x
        })
      }
    }
    return {
      valor_total: this.dataSource.filteredData.reduce(
        (sum, current) => sum + (current.preco_total), 0
      ),
      total_produtos: this.dataSource.filteredData.reduce(
        (sum, current) => sum + current.qtd_entrada, 0
      ),
      estoque_baixo: estoque_baixo,
    }
  }

  ngOnInit(): void {
    this.service.list().subscribe(
      success => {
        if (success.success){
          for(let x of success[success.data_name]){
            x.price_total = this.numberToMoney(x.preco_total)
            x.price_str = this.numberToMoney(x.price)
            x.estoque_baixo_str = (x.estoque_atual < x.estoque_minimo) ? 'Sim' : 'Não'
          }
          this.sem_estoque = success['qtd_sem_estoque']
          this.dataSource = new MatTableDataSource(success[success.data_name])
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
  }

  open(model: any){
    this.route.navigate(['admin/stock/'+model.uuid])
  }

}
