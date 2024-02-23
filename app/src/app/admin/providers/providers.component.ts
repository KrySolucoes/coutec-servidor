import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ProvidersService } from 'src/app/services/providers.service';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  constructor(
    protected service: ProvidersService,
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
          alert('Erro ao buscar fornecedores')
        }
      },
      error => {
        alert('Erro ao buscar fornecedores')
      }
    )
  }

  open(model: any){
    this.route.navigate(['admin/providers/'+model.uuid])
  }
}
