import { UploadsService } from './../../services/uploads.service';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
  providers: [
    {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => ImageViewComponent),
       multi: true
    }
  ]
})
export class ImageViewComponent implements OnInit {

  // @Input() objectName: any = null;
  // @Input() objectUuid: any = null;
  // @Input() objectFileColumn: any = null;
  @Input() disabled: boolean = false;

  _file: any = {}
  onChange: any = () => { };
  onTouched: any = () => { };
  private _value: any;

  constructor(
    protected service: UploadsService
  ) { }

  ngOnInit(): void {
    // this.get()
  }

  get urlImage(){
    if (!this._file?.data) return true
    return "url('" + this._file?.data + "')"
  }

  handleFileInput(event: any) {
    console.log(this.value)
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this._file = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      }
      this.insert(this._file)
    };
  }

  get(){
    if (this.value == null || this.value == ''){
      return
    }
    this.service.get(this.value).subscribe(
      success => {
        if (success.success){
          this._file = success[success.data_name]
          this._value = this._file.uuid;
          this.onChange(this._value);
          this.onTouched();
        } else {
          alert('Erro ao buscar')
        }
      },
      error => {
        alert('Erro ao buscar')
      }
    )
  }

  insert(model: any){
    // model.object = {
    //   name: this.objectName,
    //   uuid: this.objectUuid,
    //   file_column: this.objectFileColumn,
    // }
    this.service.save(model).subscribe(
      success => {
        alert('As alterações serão efetivadas ao salvar')
        if (success.success){
          this._value = success.uuid;
          this.onChange(this._value);
          this.onTouched();
        } else {
          alert('Erro ao salvar')
        }
      },
      error => {
        alert('Erro ao salvar')
      }
    )
  }


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  public get value(){
    return this._value;
  }

  public set value(v){
    this._value = v;
    this.onChange(this._value);
    this.onTouched();
  }

  writeValue(obj: any): void {
    this._value = obj;
    if (obj && obj != ''){
      this.get()
    }
  }

  // Optional
  onSomeEventOccured(newValue: any){
    this.value = newValue;
  }
}
