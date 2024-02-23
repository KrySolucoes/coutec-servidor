import { map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { TipoDefeitoModalComponent } from 'src/app/common/tipo-defeito-modal/tipo-defeito-modal.component';

@Component({
  selector: 'app-service-orders-kanban',
  templateUrl: './service-orders-kanban.component.html',
  styleUrls: ['./service-orders-kanban.component.scss']
})
export class ServiceOrdersKanbanComponent implements OnInit {

  models: any[] = []
  status_list: any[] = []
  cards: any[] = []
  filter: any = {}
  installations: any[] = []
  installation_uuid: any = null

  constructor(
    protected service: ServiceOrdersService,
    public dialog: MatDialog
  ) { }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  setLoading(uuid: any, status: boolean = true){
    for (let card of this.cards) {
      for (let item of card.itens) {
        if (item.id == uuid){
          item.loading = status
        }
      }
    }
  }

  saveKanban(event: any, tipo_defeito: any = null){
    let objeto: any = {
      uuid: event?.object?.id,
      status_uuid: event?.card_id
    }
    // if (!tipo_defeito
    //   && event?.object?.os?.maintenance_type == 'Corretiva'
    //   && event?.card_id == '9fa3d66d-0477-4f75-bc40-c60dc2205099'){
    //   let dialogRef = this.dialog.open(TipoDefeitoModalComponent, {
    //     width: '600px',
    //     data: {}
    //   });
    //   dialogRef.afterClosed().subscribe(data=>{
    //     if(data?.tipo_defeito){
    //       this.saveKanban(event, data?.tipo_defeito)
    //     }
    //   })
    //   return;
    // }
    if (tipo_defeito){
      objeto.tipo_defeito = tipo_defeito
    }
    Swal.fire({
      title: 'Insira um comentário',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      confirmButtonColor: this.configurations?.color_01,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        objeto.comment = result.value
        this.setLoading(objeto.uuid, true)
        this.service.save(objeto, false).subscribe(
          success => {
            if (success.success){
              // alert('Salvo com sucesso!')
            } else {
              alert('Erro ao salvar')
              this.get()
            }
            this.setLoading(objeto.uuid, false)
          },
          error => {
            alert('Erro ao salvar')
            this.setLoading(objeto.uuid, false)
            this.get()
          }
        )
      } else {
        this.get()
      }
    })
  }

  getDisableItem(item: any){
    if (this.user?.roles?.includes('técnico')){
      if (item.status.order < 2 || item.status.order > 4){
        return true;
      }
    }
    return false;
  }

  dateToOrder(date: any){
    if (date){
      let _order = date?.split(' ')[0]
      _order = _order?.split('/')
      if(_order && _order?.length >= 3){
        return _order[2] + _order[1] + _order[0]
      }
    }
    return ''
  }

  setCards(){
    let cardsTemp = []
    this.status_list = this.status_list.sort((n1,n2) => {
      if (n1.order > n2.order) {
          return 1;
      }
      if (n1.order < n2.order) {
          return -1;
      }
      return 0;
    });
    for (let status of this.status_list) {
      let itens = []
      for (let item of this.models.filter(x => x.status_uuid == status.uuid)) {
        let order = ''
        if (item?.status?.toLowerCase() == 'Para execução'.toLowerCase()){
          order += this.dateToOrder(item?.data_prevista_inicio)
        }
        if (item?.status?.toLowerCase() == 'Em execução'.toLowerCase()){
          order += this.dateToOrder(item?.data_prevista_inicio)
        }
        if (item?.status?.toLowerCase() == 'Com Pendência'.toLowerCase()){
          order += this.dateToOrder(item?.data_pendencia)
        }
        if (item?.status?.toLowerCase() == 'Concluída'.toLowerCase()){
          order += this.dateToOrder(item?.data_conclusao)
        }
        if (item?.status?.toLowerCase() == 'Finalizada'.toLowerCase()){
          order += this.dateToOrder(item?.data_finalizacao)
        }
        order += this.dateToOrder(item?.data_prev_entrega)
        order += this.dateToOrder(item?.data_prevista_inicio)
        order += this.dateToOrder(item?.data_entrada)
        itens.push({
          disabled: this.getDisableItem(item),
          title: '#' + item?.numero + ' ' + item?.instalacao,
          id: item.uuid,
          route: '/admin/service-orders/' + item.uuid,
          order: order,
          os: item,
          badges:[
            {
              icon: 'fas fa-money-check-alt',
              class: 'd-block',
              content: item?.codigo_identificador,
              show: item?.codigo_identificador ? true : false
            },
            {
              icon: 'fa-edit',
              content: item?.maintenance_type,
              class: 'd-block'
            },
            {
              icon: 'fas fa-users',
              content: item?.tecnicos_str,
              class: 'd-block'
            },
            {
              icon: 'fa-clock',
              content: item?.data_prevista_inicio?.split(' ')[0]
            },
            {
              icon: 'fa-clock',
              class: 'bg-danger',
              content: item?.data_prev_entrega
            }
          ]
        })
      }
      let order = status?.order ? status?.order : 0
      let prox_order = order + 1
      if (status?.order == 3) prox_order = 5
      if (status?.order == 4) prox_order = 3
      let connectedTo = !status?.order ? null : this.status_list.filter(
        x => x.order == (order + 1) || x.order == prox_order
      ).map((card) => {
        return card.uuid
      })
      itens.sort(function (a, b) {
        if (a.order > b.order || a.order === null) {
          return 1;
        }
        if (a.order < b.order) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
      if (status.name.toLowerCase() == 'concluída' || status.name.toLowerCase() == 'finalizada'){
        itens.reverse()
      }
      cardsTemp.push({
        id: status.uuid,
        name: status.name,
        order: order,
        itens: itens,
        connectedTo: connectedTo
      });
    };
    this.cards = cardsTemp
  }

  get(){
    let filter = []
    if (this.filter?.inicio){
      filter.push("start_date="+this.filter?.inicio)
    }
    if (this.filter?.termino){
      filter.push("end_date="+this.filter?.termino)
    }
    if (this.installation_uuid){
      filter.push("installation_uuid="+this.installation_uuid)
    }
    let filterStr = filter.length == 0 ? null : filter.join('&')
    this.service.list(filterStr).subscribe(
      success => {
        if (success.success){
          this.models = success[success.data_name]
          this.setCards()
        } else {
          alert('Erro ao buscar ordens de serviço')
        }
      },
      error => {
        alert('Erro ao buscar ordens de serviço')
      }
    )
  }

  dateToString(d: Date){
    if(!d) return d
    var date = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()
    return date
  }

  ngOnInit(): void {
    this.service.genericList("installations").subscribe(
      success => {
        if (success.success){
          this.installations = success[success.data_name]
        } else {
          alert('Erro ao buscar instalações')
        }
      },
      error => {
        alert('Erro ao buscar instalações')
      }
    )
    this.service.genericList("service_orders_status").subscribe(
      success => {
        if (success.success){
          this.status_list = success[success.data_name]
          var dataInicio = new Date();
          // filtro inicio igual 7 dias atras
          dataInicio.setDate(dataInicio.getDate() - 7);
          this.filter.inicio = this.dateToString(dataInicio)
          // filtro termino igual  7 dias a frente
          var dataTermino = new Date();
          dataTermino.setDate(dataTermino.getDate() + 7);
          this.filter.termino = this.dateToString(dataTermino)
          this.get()
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
