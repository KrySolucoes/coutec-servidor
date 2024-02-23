import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-currency',
  templateUrl: './form-currency.component.html',
  styleUrls: ['./form-currency.component.scss'],
  providers: [
    {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => FormCurrencyComponent),
       multi: true
    }
  ]
})
export class FormCurrencyComponent implements OnInit {

  @Input() prefix: any = 'R$ ';
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

  format(){
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
