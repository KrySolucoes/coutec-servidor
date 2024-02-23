import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-date',
  templateUrl: './form-date.component.html',
  styleUrls: ['./form-date.component.scss'],
  providers: [
    {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => FormDateComponent),
       multi: true
    }
  ]
})
export class FormDateComponent implements OnInit {

  @Input() label: any = null;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;

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

  setDatepicker(event: any){
    var d = event.value
    // var date = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" +
    // d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2)
    var date = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()
    this._value = date;
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
