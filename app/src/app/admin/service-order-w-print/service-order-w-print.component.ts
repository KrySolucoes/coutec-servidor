import { Component, OnInit } from '@angular/core';
import { DashboardsService } from 'src/app/services/deshboards.service';

@Component({
  selector: 'app-service-order-w-print',
  templateUrl: './service-order-w-print.component.html',
  styleUrls: ['./service-order-w-print.component.scss']
})
export class ServiceOrderWPrintComponent implements OnInit {

  model: any = {}
  data: any[] = []
  installations: any[] = []
  anos: any[] = [
    {id: 2020, name: '2020'},
    {id: 2021, name: '2021'},
    {id: 2022, name: '2022'},
    {id: 2023, name: '2023'},
  ]

  constructor(
    private service: DashboardsService
  ) { }


  ngOnInit(): void {
    if (this.data){
      this.model = this.data
    }
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
    this.get()
  }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  getRowSpan(data: any){
    if(data?.length){
      return data.length
    }
    return 1
  }

  print(){
    setTimeout(() => {
      this.imprimir()
    }, 500)
  }

  imprimir(){
    const printContent = document.getElementById("print-section");
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    if(printContent?.innerHTML)
      WindowPrt?.document.write(printContent?.innerHTML);
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.47/assets/css/bootstrap4.4.min.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.47/assets/css/atlantis.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.47/assets/css/demo.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.47/assets/css/printlandscape.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.47/styles.css">');
    WindowPrt?.document.close();
    WindowPrt?.focus();
    WindowPrt?.addEventListener('load', function() {
      // WindowPrt?.print();
      // WindowPrt?.close();
    }, false);
  }

  get instalacaoSelecionada(){
    if (this.model?.installations_uuid){
      return this.installations.find(i => i.uuid == this.model.installations_uuid)
    }
    return null
  }

  get(){
    let filter = ''
    if (this.model?.installations_uuid){
      filter = 'installations_uuid=' + this.model.installations_uuid
    }
    if (this.model?.ano){
      filter += filter ? '&' : ''
      filter += 'ano=' + this.model.ano
    }
    this.service.get('52w', filter).subscribe(
      success => {
        if (success.success){
          this.data = success[success.data_name]['instalacoes']
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
