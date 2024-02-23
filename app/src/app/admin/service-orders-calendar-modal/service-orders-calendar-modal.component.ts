import { map } from 'rxjs/operators';
import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceOrdersService } from 'src/app/services/service-orders.service';

@Component({
  selector: 'app-service-orders-calendar-modal',
  templateUrl: './service-orders-calendar-modal.component.html',
  styleUrls: ['./service-orders-calendar-modal.component.scss']
})
export class ServiceOrdersCalendarModalComponent implements OnInit {

  model: any = {}
  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    protected service: ServiceOrdersService,
    @Optional() public dialogRef: MatDialogRef<ServiceOrdersCalendarModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    if (this.data){
      this.model = this.data
    }
    this.get()
    console.log(this.model)
  }

  closeDialog() {
    if (this.data){
      this.dialogRef.close();
    }
  }

  get servicesNames(){
    return this.model?.products?.filter((x: any) => x.product.type == 'Serviço').map((x: any) => x.product_name).join(', ').trim()
  }

  get(){
    if (this.model?.uuid == null){
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
