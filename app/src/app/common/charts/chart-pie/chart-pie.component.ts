import { AfterViewInit, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-pie',
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.scss']
})
export class ChartPieComponent implements OnInit, AfterViewInit  {

  uuid: any = null;
  constructor() { }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  load(){
    // if (!this.uuid || !this._value) return;
		// var myScript = `Circles.create({
		// 	id:'` + this.uuid + `',
		// 	radius: 45,
		// 	value: ` + this._value + `,
		// 	maxValue: 100,
		// 	width: 7,
		// 	text: ` + this._value + `,
		// 	colors:['#f1f1f1', '#FF9E27'],
		// 	duration:400,
		// 	wrpClass:'chart-circles-wrp',
		// 	textClass:'chart-circles-text',
		// 	styleWrapper:true,
		// 	styleText:true
		// })`
    // eval(myScript);
  }

  ngAfterViewInit() {
    this.load()
  }

  ngOnInit(): void {
    this.uuid = this.uuidv4();
  }

}
