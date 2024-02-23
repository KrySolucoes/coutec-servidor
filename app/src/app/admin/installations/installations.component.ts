import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { InstallationsService } from 'src/app/services/installations.service';

@Component({
  selector: 'app-installations',
  templateUrl: './installations.component.html',
  styleUrls: ['./installations.component.scss']
})
export class InstallationsComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  constructor(
    protected service: InstallationsService,
    private route: Router
  ) { }

  configuration = {
    columns: [
      {
        data: 'name',
        title: 'Nome'
      },
      {
        data: 'cpf_cnpj',
        title: 'CPF / CNPJ'
      },
      {
        data: 'telefone',
        title: 'Telefone'
      },
      {
        data: 'email',
        title: 'Email'
      }
    ]
  }

  callbackTable(event: any){
    this.open(event.element)
  }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
    this.service.list().subscribe(
      success => {
        if (success.success){
          this.dataSource = new MatTableDataSource(success[success.data_name])
        } else {
          alert('Erro ao buscar instalações')
        }
      },
      error => {
        alert('Erro ao buscar instalações')
      }
    )
  }

  open(instalation: any){
    this.route.navigate(['admin/installations/'+instalation.uuid])
  }
}
