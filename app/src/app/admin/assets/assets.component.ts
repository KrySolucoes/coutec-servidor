import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AssetsService } from 'src/app/services/assets.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss']
})
export class AssetsComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  asset_types: any[] = []
  constructor(
    protected service: AssetsService,
    private router: Router
  ) { }

  configuration = {
    columns: [
      {
        data: 'codigo_identificador',
        title: 'Código Identificador'
      },
      {
        data: 'name',
        title: 'Nome'
      },
      {
        data: 'tipo',
        title: 'Tipo'
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
        data: 'capacidade',
        title: 'Capacidade'
      },
      {
        data: 'instalacao',
        title: 'Instalação'
      },
      {
        data: 'localizacao',
        title: 'Localização'
      },
      {
        data: 'parada_30_dias',
        title: 'Paradas dos ultimos 30 dias'
      }
    ]
  }

  callbackTable(event: any){
    this.open(event.element)
  }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    this.service.list().subscribe(
      success => {
        if (success.success){
          this.dataSource = new MatTableDataSource(success[success.data_name])
        } else {
          alert('Erro ao buscar ativos')
        }
      },
      error => {
        alert('Erro ao buscar ativos')
      }
    )
  }

  open(objeto: any){
    this.router.navigate(['admin/assets/'+objeto.uuid])
  }

}
