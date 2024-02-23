import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.scss'],
  providers: [
    {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => FormSelectComponent),
       multi: true
    }
  ]
})
export class FormSelectComponent implements OnInit {

  @Input() key: any = null;
  @Input() text: any = null;
  @Input() label: any = null;
  @Input() placeholder: any = null;
  @Input() list: any[] = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() multiple: boolean = false;


  filter: string = "";

  get listFilter(){
    let _return = []
    if (this.list && this.filter == ""){
      _return = this.list
    }
    if (this.list && this.filter && this.filter != ""){
      _return = this.list?.filter(
        x => x.name?.toLowerCase().includes(this.filter?.toLowerCase())
        || x.name?.toLowerCase() == this.filter?.toLowerCase()
      )
    }

    return _return.sort((a, b) => {
      if (a[this.text] < b[this.text])
        return -1;
      if (a[this.text] > b[this.text])
        return 1;
      return 0;
    })
  }

  constructor() { }

  ngOnInit(): void {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  onChange: any = () => { };

  onTouched: any = () => { };

  private _value: any;

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
  }

  // Optional
  onSomeEventOccured(newValue: any){
    this.value = newValue;
  }
}
