import { PersonsService } from './../../services/persons.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent implements OnInit {

  installations: any[] = [];
  profiles: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  constructor(
    protected service: PersonsService,
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
        title: 'CPF'
      },
      {
        data: 'telefone',
        title: 'Telefone'
      },
      {
        data: 'email',
        title: 'Email'
      },
      {
        data: 'installation_name',
        title: 'Instalação'
      },
      {
        data: 'profile_name',
        title: 'Perfil'
      },
      {
        data: 'status',
        title: 'Status'
      }
    ]
  }

  callbackTable(event: any){
    this.open(event.element)
  }

  get configurations(){
    return this.service?.configurations
  }

  getInstallatio(uuid: any){
    var tipo = this.installations.filter(x => x.uuid == uuid);
    if (tipo.length == 0) return null;
    return tipo[0]
  }

  getProfile(uuid: any){
    var tipo = this.profiles.filter(x => x.uuid == uuid);
    if (tipo.length == 0) return null;
    return tipo[0]
  }

  ngOnInit(): void {
    this.service.genericList("profiles").subscribe(
      success => {
        if (success.success){
          this.profiles = success[success.data_name]
          this.service.genericList("installations").subscribe(
            success => {
              if (success.success){
                this.installations = success[success.data_name]
                this.service.list().subscribe(
                  success => {
                    if (success.success){
                      for(let x of success[success.data_name]){
                        x.installation_name = ''
                        if (x?.installation_uuid){
                          for(let y of x?.installation_uuid){
                            x.installation_name += this.getInstallatio(y)?.name+', '
                          }
                          if (x.installation_name.length > 0){
                            x.installation_name = x.installation_name.substring(0, x.installation_name.length-2)
                          }
                        }
                        x.profile_name = this.getProfile(x?.profile_uuid)?.name
                      }
                      this.dataSource = new MatTableDataSource(success[success.data_name])
                    } else {
                      alert('Erro ao buscar pessoa')
                    }
                  },
                  error => {
                    alert('Erro ao buscar pessoa')
                  }
                )
              } else {
                alert('Erro ao buscar instalações')
              }
            },
            error => {
              alert('Erro ao buscar instalações')
            }
          )
        } else {
          alert('Erro ao buscar perfil')
        }
      },
      error => {
        alert('Erro ao buscar perfil')
      }
    )
  }

  open(objeto: any){
    this.route.navigate(['admin/persons/'+objeto.uuid])
  }

}
