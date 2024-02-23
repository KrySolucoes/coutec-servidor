import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssetTypesService } from 'src/app/services/asset-types.service';

@Component({
  selector: 'app-asset-types',
  templateUrl: './asset-types.component.html',
  styleUrls: ['./asset-types.component.scss']
})
export class AssetTypesComponent implements OnInit {

  models: any[] = []
  constructor(
    protected service: AssetTypesService,
    private router: Router
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    this.service.list().subscribe(
      success => {
        if (success.success){
          this.models = success[success.data_name]
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
  }

  open(objeto: any){
    this.router.navigate(['admin/asset-types/'+objeto.uuid])
  }

}
