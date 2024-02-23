import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';

@Component({
  selector: 'app-service-order-view',
  templateUrl: './service-order-view.component.html',
  styleUrls: ['./service-order-view.component.scss']
})
export class ServiceOrderViewComponent implements OnInit {

  model: any = {}
  constructor(
    private route: ActivatedRoute,
    protected service: ServiceOrdersService
  ) { }

  get configurations(){
    return this.service.configurations
  }

  ngOnInit(): void {
    let uuid = this.route.snapshot.paramMap.get('uuid')
    this.model.uuid = uuid != 'new' ? uuid : null
    this.get()
  }

  get total(){
    if(!this.model?.products) return 0;
    var total = 0
    for(let x of this.model?.products)
      total = total + (x.preco * x.quantidade)
    return total
  }

  get(){
    if (this.model?.uuid == null){
      var d = new Date();
      this.model.data_entrada = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()
      return
    }
    this.service.get(this.model.uuid).subscribe(
      success => {
        if (success.success){
          this.model = success[success.data_name]
        } else {
          alert('Erro ao buscar ordem de serviço')
        }
      },
      error => {
        alert('Erro ao buscar ordem de serviço')
      }
    )
  }
}
