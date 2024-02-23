import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { SuporteComponent } from '../suporte/suporte.component';
import { ManutencaoDetalhadaPrintComponent } from 'src/app/admin/dashboard/manutencao-detalhada-print/manutencao-detalhada-print.component';
import { RelatorioDetalhadoPrintComponent } from 'src/app/admin/dashboard/relatorio-detalhado-print/relatorio-detalhado-print.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  static counts: any[] = []

  constructor(
    private service: UserService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  get user(){
    return this.service?.user
  }

  get configurations(){
    return this.service?.configurations
  }

  updatePassword(){
    this.service.updatePasswordModal()
  }

  logoff(){
    this.service.logoffButton()
  }

  ngOnInit(): void {
  }

  backgroundColor(route: any){
    if (this.router.url.startsWith(route + '/') || route == this.router.url)
      return this.service?.configurations?.color_02
    return null
  }

  getCount(objeto: any){
    let count = SidebarComponent.counts.filter(x => x?.objeto == objeto)
    if (count.length == 0){
      SidebarComponent.counts.push({
        objeto: objeto,
        count: 0
      })
      count = SidebarComponent.counts.filter(x => x?.objeto == objeto)
      this.service.genericCount(objeto).subscribe(
        success => {
          if (success.success){
            let _get = SidebarComponent.counts.filter(x => x?.objeto == objeto)
            _get[0].count = success[success.data_name]
          } else {
            console.log('Erro ao buscar')
          }
        },
        error => {
          console.log('Erro ao buscar')
        }
      )
    }
    return count[0]?.count
  }

  planoManutencao(){
    let dialogRef = this.dialog.open(ManutencaoDetalhadaPrintComponent, {
      width: '600px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(data=>{

    })
  }

  relatorioDetalhado(){
    let dialogRef = this.dialog.open(RelatorioDetalhadoPrintComponent, {
      width: '600px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(data=>{

    })
  }

  suporte(){
    let dialogRef = this.dialog.open(SuporteComponent, {
      width: '600px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(data=>{

    })
  }

}
