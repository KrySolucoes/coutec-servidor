import { Component, OnInit } from '@angular/core';
import { DashboardsService } from 'src/app/services/deshboards.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  model: any = {}

  constructor(
    private service: DashboardsService
  ) { }

  get configurations(){
    return this.service.configurations
  }

  ngOnInit(): void {
    this.getCount('installations')
    this.getCount('assets')
    this.getCount('persons')
    this.get()
  }

  countAssetsType(_type: any){
    var len = this.model.counts?.assets?.filter((x: any)=> x.type_name == _type)?.length
    return len ? len : 0
  }

  get defeitoData(){
    if (!this.model?.counts?.oss_defeitos) return null
    var data = []
    for(let x of this.model.counts.oss_defeitos){
      data.push({
        label: x.tipo_defeito,
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

  get top10AssetsTempo(){
    if (!this.model?.counts?.top_ativos_tempo) return null
    var data = []
    for(let x of this.model.counts.top_ativos_tempo){
      data.push({
        label: x.asset_name,
        count: x.count
      })
    }
    return data
  }

  get top10AssetsParadas(){
    if (!this.model?.counts?.top_ativos_parados) return null
    var data = []
    for(let x of this.model.counts.top_ativos_parados){
      data.push({
        label: x.asset_name,
        count: x.count
      })
    }
    return data
  }

  get ativoType(){
    if (!this.model?.counts?.assets_type) return null
    var data = []
    for(let x of this.model.counts.assets_type){
      data.push({
        label: x.type_name,
        count: x.count
      })
    }
    return data
  }

  get statusData(){
    if (!this.model?.counts?.oss_status) return null
    var data = []
    for(let x of this.model.counts.oss_status){
      data.push({
        label: x.status_name,
        count: x.count
      })
    }
    return data
  }

  get(){
    this.service.get('geral').subscribe(
      success => {
        if (success.success){
          this.model.counts = success[success.data_name]
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
