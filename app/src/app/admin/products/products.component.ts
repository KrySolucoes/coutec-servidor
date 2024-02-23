import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  page: any = 'produto'
  dataSource = new MatTableDataSource<any>([]);
  constructor(
    protected service: ProductsService,
    private route: Router
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  configuration = {
    columns: [
      {
        data: 'codigo',
        title: 'Código'
      },
      {
        data: 'name',
        title: 'Nome'
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
        data: 'localizacao_estoque',
        title: 'Localização no Estoque'
      },
      {
        data: 'estoque_atual',
        title: 'Estoque atual'
      },
      {
        data: 'instalacao',
        title: 'Instalação'
      },
      {
        data: 'unidade',
        title: 'Unidade'
      },
      {
        data: 'consumo_30_dias',
        title: 'Consumo dos últimos 30 dias'
      },
      {
        data: 'estoque_abaixo',
        title: 'Estoque abaixo do consumo'
      }
    ]
  }

  configurationService = {
    columns: [
      {
        data: 'name',
        title: 'Nome'
      },
      {
        data: 'tempo_medio_execucao',
        title: 'Tempo médio de execução'
      },
      {
        data: 'categoria',
        title: 'Categoria do Serviço'
      }
    ]
  }

  callbackTable(event: any){
    this.open(event.element)
  }

  setPage(page: any){
    this.page = page
    this.get()
  }

  loadDataSource(data: any = null){
    if (data == null){
      data = this.dataSource.data
    }
    if (this.page == 'produto'){
      this.dataSource = new MatTableDataSource(data.filter((x: any) => x.type == 'Produto'))
      // this.dataSource = new MatTableDataSource(data)
    }
    if (this.page == 'servico'){
      this.dataSource = new MatTableDataSource(data.filter((x: any) => x.type == 'Serviço'))
    }
  }

  get(){
    this.service.list().subscribe(
      success => {
        if (success.success){
          this.loadDataSource(success[success.data_name])
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
  }

  ngOnInit(): void {
    this.get()
  }

  open(objeto: any){
    this.route.navigate(['admin/products/'+objeto.uuid])
  }
}
