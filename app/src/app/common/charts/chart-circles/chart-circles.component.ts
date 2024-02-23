import { AfterViewInit, Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-chart-circles',
  templateUrl: './chart-circles.component.html',
  styleUrls: ['./chart-circles.component.scss'],
  providers: [
    {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => ChartCirclesComponent),
       multi: true
    }
  ]
})
export class ChartCirclesComponent implements OnInit, AfterViewInit  {

  uuid: any = null;
  @Input() text: any = null;
  @Input() max: number = 0;
  constructor() { }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  load(){
    if (!this.uuid || (!this._value && !this.text && this._value !== 0 && this.text !== 0)) return;
		var myScript = `Circles.create({
			id:'` + this.uuid + `',
			radius: 45,
			value: ` + (this.text ? this.text : this._value) + `,
			maxValue: ` + (this.max == 0 ? this._value : this.max) + `,
			width: 7,
			text: ` + this._value + `,
			colors:['#f1f1f1', '#FF9E27'],
			duration:400,
			wrpClass:'chart-circles-wrp',
			textClass:'chart-circles-text',
			styleWrapper:true,
			styleText:true
		})`
    eval(myScript);
  }

  ngAfterViewInit() {
    this.load()
  }

  ngOnInit(): void {
    this.uuid = this.uuidv4();
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
    this.load();
  }

  writeValue(obj: any): void {
    this._value = obj;
    this.load()
  }

  // Optional
  onSomeEventOccured(newValue: any){
    this.value = newValue;
  }
}
