import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-suporte',
  templateUrl: './suporte.component.html',
  styleUrls: ['./suporte.component.scss']
})
export class SuporteComponent implements OnInit {

  model: any = {}
  constructor(
    private service: UserService,
    @Optional() public dialogRef: MatDialogRef<SuporteComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  @ViewChild('myForm') myForm: any = null;
  ngOnInit(): void {
  }

  send(){
    if (!this.myForm?.valid){
      return;
    }
    this.service.suporte(this.model).subscribe(
      success => {
        if (success.success){
          alert('Mensagem enviada com sucesso!')
        } else {
          alert('Erro ao enviar')
        }
      },
      error => {
        alert('Erro ao enviar')
      }
    )
  }
}
