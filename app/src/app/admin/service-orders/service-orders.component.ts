import { ServiceOrderWPrintComponent } from './../service-order-w-print/service-order-w-print.component';
import { CrudBaseService } from './../../services/crud-base.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-service-orders',
  templateUrl: './service-orders.component.html',
  styleUrls: ['./service-orders.component.scss']
})
export class ServiceOrdersComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  constructor(
    protected service: ServiceOrdersService,
    private route: Router,
    public dialog: MatDialog
  ) { }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  configuration = {
    columns: [
      {
        data: 'numero',
        title: 'Número'
      },
      {
        data: 'maintenance_type',
        title: 'Tipo'
      },
      {
        data: 'status',
        title: 'Status'
      },
      {
        data: 'equipamento',
        title: 'Equipamento'
      },
      {
        data: 'instalacao',
        title: 'Instalação'
      },
      {
        data: 'data_entrada',
        title: 'Data de Abertura',
        dataType: 'date'
      },
      {
        data: 'data_prevista_inicio',
        title: 'Data Prev. Início',
        dataType: 'date'
      },
      {
        data: 'data_finalizacao',
        title: 'Data de Finalização',
        dataType: 'date'
      },
      {
        data: 'hora_inicio',
        title: 'Hora Início',
      },
      {
        data: 'hora_fim',
        title: 'Hora Fim',
      },
      {
        data: 'tecnicos_str',
        title: 'Executante'
      }
    ]
  }

  callbackTable(event: any){
    this.open(event.element)
  }

  print52w(){
    let dialogRef = this.dialog.open(ServiceOrderWPrintComponent, {
      width: '600px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(data=>{
    })
    // window.open('admin/service-orders-view/' + this.model.uuid, '_blank');
  }

  ngOnInit(): void {
    this.service.list().subscribe(
      success => {
        if (success.success){
          // this.models = success[success.data_name]
          for(let x of success[success.data_name]){
            x.data_entrada = x.data_entrada?.split(' ')[0]
            x.data_finalizacao = x.data_finalizacao?.split(' ')[0]
          }
          success[success.data_name].sort(function (a: any, b: any) {
            if (a.numero > b.numero) {
              return 1;
            }
            if (a.numero < b.numero) {
              return -1;
            }
            return 0;
          });
          success[success.data_name].reverse();
          this.dataSource = new MatTableDataSource(success[success.data_name])
        } else {
          alert('Erro ao buscar ordens de serviço')
        }
      },
      error => {
        alert('Erro ao buscar ordens de serviço')
      }
    )
  }

  open(model: any){
    this.route.navigate(['admin/service-orders/'+model.uuid])
  }
}
