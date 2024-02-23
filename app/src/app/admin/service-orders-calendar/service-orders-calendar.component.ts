import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CalendarComponent } from 'src/app/common/calendar/calendar.component';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';
import { PlanoManutencaoPrintComponent } from '../plano-manutencao-print/plano-manutencao-print.component';
import { ServiceOrdersCalendarModalComponent } from '../service-orders-calendar-modal/service-orders-calendar-modal.component';

@Component({
  selector: 'app-service-orders-calendar',
  templateUrl: './service-orders-calendar.component.html',
  styleUrls: ['./service-orders-calendar.component.scss']
})
export class ServiceOrdersCalendarComponent implements OnInit {

  start: any = null
  end: any = null
  installation_uuid: any = null
  models: any[] = []
  installations: any[] = []

  @ViewChild('calendar') calendarComponent!: CalendarComponent;

  constructor(
    protected service: ServiceOrdersService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
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
  }

  callbackCalendar(event: any){
    if (event?.type == 'navigation'){
      this.start = event.start
      this.end = event.end
      this.list()
    }
    if (event?.type == 'click'){
      // let click_event = this.models.filter(x => x.uuid == event.event.extendedProps.uuid)[0]
      // let dialogRef = this.dialog.open(ServiceOrdersCalendarModalComponent, {
      //   width: '600px',
      //   data: click_event
      // });
      // window.open('admin/service-orders/' + event.event.extendedProps.uuid, '_blank');
      this.router.navigate(['admin/service-orders/' + event.event.extendedProps.uuid])
    }
  }

  get endString(){
    if (this.end){
      return ("0" + this.end.getDate()).slice(-2) + "/" + ("0"+(this.end.getMonth()+1)).slice(-2) + "/" + this.end.getFullYear()
    }
    return null
  }

  get startString(){
    if (this.start){
      return ("0" + this.start.getDate()).slice(-2) + "/" + ("0"+(this.start.getMonth()+1)).slice(-2) + "/" + this.start.getFullYear()
    }
    return null
  }

  prepareDateEvent(date: any){
    if(!date) return null
    var _date = date.split(' ')
    date = _date[0].split('/')
    date = date[2] + '-' + date[1] + '-' + date[0]
    if (_date.length > 1){
      date = date + ' ' + _date[1]
    }
    return date
  }

  setEventsCalendar(){
    let events: any[] = []
    for (let event of this.models){
      let start = event?.data_prevista_inicio
      let end = event?.data_prev_entrega
      if (event?.data_inicio){
        start = event?.data_inicio
      }
      if (event?.data_conclusao){
        end = event?.data_conclusao
      }
      // verifica se tem espaço na data
      if (start?.indexOf(' ') > -1){
        start = start.split(' ')[0]
      }
      if (end?.indexOf(' ') > -1){
        end = end.split(' ')[0]
      }
      events.push({
        uuid: event.uuid,
        title: '#' + event?.codigo_identificador,
        // title: 'OS ' + event.numero + ' - ' + event?.installation?.name,
        date: end && start ? null : this.prepareDateEvent(start),
        start: end && start ? this.prepareDateEvent(start) + ' 00:00:00': null,
        // start: '2022-01-01 00:00:00',
        end: end && start ? this.prepareDateEvent(end) + ' 23:59:59' : null
      })
    }
    this.calendarComponent.setEvents(events)
  }

  list(){
    let filter = "filter=maintenance_type ne 'Corretiva'"
    if (this.installation_uuid){
      filter = filter + " and installation_uuid eq '" + this.installation_uuid + "'"
    }
    this.service.list(filter+"&start_date="+this.startString+"&end_date="+this.endString).subscribe(
      success => {
        if (success.success){
          this.models = success[success.data_name]
          this.setEventsCalendar()
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
  }

  print(){
    let dialogRef = this.dialog.open(PlanoManutencaoPrintComponent, {
      width: '600px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(data=>{
    })
    // window.open('admin/service-orders-view/' + this.model.uuid, '_blank');
  }
}
