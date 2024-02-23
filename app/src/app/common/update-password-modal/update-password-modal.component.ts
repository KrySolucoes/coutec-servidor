import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-password-modal',
  templateUrl: './update-password-modal.component.html',
  styleUrls: ['./update-password-modal.component.scss']
})
export class UpdatePasswordModalComponent implements OnInit {

  model: any = {}
  selectedMenu: any;
  navMenu = [
    {
      name: 'Alterar Senha',
      id: 1,
      active: false
    }
  ]

  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    protected service: UserService,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() public dialogRef: MatDialogRef<UpdatePasswordModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  ngOnInit(): void {
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  closeDialog() {
    this.dialogRef.close();
  }

  save(){
    if (!this.myForm?.valid){
      return;
    }
    this.service.updatePassword(this.model.password, this.model.new_password).subscribe(
      success => {
        if (success.success){
          this.model.uuid = success.uuid
          this.closeDialog()
          Swal.fire(
            'Senha Alterada!',
            'Para efetivar a troca de senha faça login novamente.',
            'success'
          )
        } else {
          alert('Erro ao salvar')
        }
      },
      error => {
        alert('Erro ao salvar')
      }
    )
  }
}
