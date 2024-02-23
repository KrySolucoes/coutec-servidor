import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DashboardsService } from 'src/app/services/deshboards.service';

@Component({
  selector: 'app-manutencao-detalhada-print',
  templateUrl: './manutencao-detalhada-print.component.html',
  styleUrls: ['./manutencao-detalhada-print.component.scss']
})
export class ManutencaoDetalhadaPrintComponent implements OnInit {
  model: any = {}
  installations: any[] = []

  constructor(
    private service: DashboardsService,
    @Optional() public dialogRef: MatDialogRef<ManutencaoDetalhadaPrintComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
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
  }

  get user(){
    return this.service?.user
  }

  get installation_name() {
    return this.installations?.find(x => x.uuid == this.model?.installation_uuid)?.name
  }

  get configurations(){
    return this.service?.configurations
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
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.41:443/assets/css/bootstrap4.4.min.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.41:443/assets/css/atlantis.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.41:443/assets/css/demo.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.41:443/assets/css/print.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.41:443/assets/css/printlandscape.css">');
    WindowPrt?.document.write('<link rel="stylesheet" type="text/css" href="http://200.98.136.41:443/styles.css">');
    WindowPrt?.document.close();
    WindowPrt?.focus();
    WindowPrt?.addEventListener('load', function() {
      // WindowPrt?.print();
      // WindowPrt?.close();
    }, false);
  }

  get(print: boolean = false){
    if(!this.model?.start) return
    if(!this.model?.end) return
    if(!this.model?.installation_uuid) return
    let filter = ''
    if (this.model?.installation_uuid){
      filter = 'installations_uuid=' + this.model.installation_uuid
    }
    if (this.model?.start){
      filter += filter ? '&' : ''
      filter += 'data_inicio=' + this.model.start
    }
    if (this.model?.end){
      filter += filter ? '&' : ''
      filter += 'data_final=' + this.model.end
    }
    filter += filter ? '&' : ''
    filter += 'not_maintenance_type=\'Corretiva\''
    this.service.get('manutencao_detalhado', filter).subscribe(
      success => {
        if (success.success){
          this.model.cronograma = null
          setTimeout(() => {
            this.model.cronograma = success[success.data_name]
            if(print){
              setTimeout(() => {
                this.imprimir()
                // let element:HTMLElement = document.getElementById('btPrint') as HTMLElement;
                // element.click();
              }, 500)
            }
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
}
