import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanoManutencaoService } from 'src/app/services/plano-manutencao.service';

@Component({
  selector: 'app-plano-manutencao-print',
  templateUrl: './plano-manutencao-print.component.html',
  styleUrls: ['./plano-manutencao-print.component.scss']
})
export class PlanoManutencaoPrintComponent implements OnInit {
  model: any = {}
  installations: any[] = []
  constructor(
    protected service: PlanoManutencaoService,
    @Optional() public dialogRef: MatDialogRef<PlanoManutencaoPrintComponent>,
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
    let param = '?start=' + this.model.start + '&end=' + this.model.end
    this.service.get(this.model.installation_uuid + param).subscribe(
      success => {
        if (success.success){
          this.model = success[success.data_name]
          if(this.model?.cronograma_simples){
            for(let cro of this.model?.cronograma_simples){
              if(cro?.assets){
                for(let asset of cro?.assets){
                  var _date = asset?.data.split(' ')
                  asset.order = _date[0].split('/')
                  asset.order = asset.order[2] + '-' + asset.order[1] + '-' + asset.order[0]
                  if (_date.length > 1){
                    asset.order = asset.order + ' ' + _date[1]
                  }
                }
                cro?.assets.sort((n1: any,n2: any) => {
                  if (n1.order > n2.order) {
                      return 1;
                  }
                  if (n1.order < n2.order) {
                      return -1;
                  }
                  return 0;
                });
              }
            }
          }
          if(print){
            setTimeout(() => {
              this.imprimir()
              // let element:HTMLElement = document.getElementById('btPrint') as HTMLElement;
              // element.click();
            }, 500)
          }
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
