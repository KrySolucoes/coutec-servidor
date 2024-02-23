import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardsService } from 'src/app/services/deshboards.service';

@Component({
  selector: 'app-dashboard-manutencao',
  templateUrl: './dashboard-manutencao.component.html',
  styleUrls: ['./dashboard-manutencao.component.scss']
})
export class DashboardManutencaoComponent implements OnInit {

  model: any = {}
  installations: any[] = []
  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private service: DashboardsService
  ) { }

  get configurations(){
    return this.service.configurations
  }

  configuration = {
    columns: [
      {
        data: 'ativo',
        title: 'Ativo'
      },{
        data: 'corretivas',
        title: 'Corretivas'
      },{
        data: 'preventivas',
        title: 'Preventivas'
      },{
        data: 'inspecoes',
        title: 'Inspeções'
      },{
        data: 'preditivas',
        title: 'Preditivas'
      },{
        data: 'lubrificacoes',
        title: 'Lubrificações'
      },{
        data: 'tempoparado',
        title: 'Horas Paradas'
      },{
        data: 'tempoparadopreventiva',
        title: 'Horas com Preventivas'
      },{
        data: 'tempoparadoinspecao',
        title: 'Horas com Inspeções'
      },{
        data: 'tempoparadopreditiva',
        title: 'Horas com Preditivas'
      },{
        data: 'tempoparadolubrificacao',
        title: 'Horas com Lubrificações'
      }
    ]
  }

  ngOnInit(): void {
    this.getCount('installations')
    this.getCount('assets')
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

  get defeitoData(){
    if (!this.model?.counts?.oss_defeito) return null
    var data = []
    for(let x of this.model.counts.oss_defeito){
      data.push({
        label: x.tipo,
        count: x.count
      })
    }
    return data
  }

  get tipoData(){
    if (!this.model?.counts?.oss_tipo) return null
    var data = []
    for(let x of this.model.counts.oss_tipo){
      data.push({
        label: x.tipo,
        count: x.count
      })
    }
    return data
  }

  get(){
    let filter = ''
    if (this.model?.installations_uuid){
      filter = 'installations_uuid=' + this.model.installations_uuid
    }
    if (this.model?.maintenance_type){
      filter += filter ? '&' : ''
      filter += 'maintenance_type=' + this.model.maintenance_type
    }
    if (this.model?.data_inicio){
      filter += filter ? '&' : ''
      filter += 'data_inicio=' + this.model.data_inicio
    }
    if (this.model?.data_final){
      filter += filter ? '&' : ''
      filter += 'data_final=' + this.model.data_final
    }
    this.service.get('manutencao', filter).subscribe(
      success => {
        if (success.success){
          this.model.counts = null
          setTimeout(() => {
            this.model.counts = success[success.data_name]
            this.dataSource = new MatTableDataSource(this.model.counts?.manutencoes)
          }, 500)
        } else {
          console.log('Erro ao buscar')
        }
      },
      error => {
        console.log('Erro ao buscar')
      }
    )
  }

  getCount(objeto: any){
    this.service.genericCount(objeto).subscribe(
      success => {
        if (success.success){
          this.model['count_' + objeto] = success[success.data_name]
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
