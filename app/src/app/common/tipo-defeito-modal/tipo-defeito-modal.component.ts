import { Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StockComponent } from 'src/app/admin/stock/stock.component';
import { CrudBaseService } from 'src/app/services/crud-base.service';

@Component({
  selector: 'app-tipo-defeito-modal',
  templateUrl: './tipo-defeito-modal.component.html',
  styleUrls: ['./tipo-defeito-modal.component.scss']
})
export class TipoDefeitoModalComponent implements OnInit {

  model: any = {}
  selectedMenu: any;
  navMenu = [
    {
      name: 'Tipo de Defeito',
      id: 1,
      active: false
    }
  ]

  @ViewChild('myForm')
  private myForm: any = null;
  constructor(
    private service: CrudBaseService,
    @Optional() public dialogRef: MatDialogRef<StockComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  get configurations(){
    return this.service?.configurations
  }

  selectMenu(menu: any){
    this.navMenu.forEach(element => {
      element.active = false
    });
    this.selectedMenu = menu
    menu.active = true
  }

  ngOnInit(): void {
  }

  save(){
    if (!this.myForm?.valid){
      return;
    }
    this.dialogRef.close(this.model);
  }
}
