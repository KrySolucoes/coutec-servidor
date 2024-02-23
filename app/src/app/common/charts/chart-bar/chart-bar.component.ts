import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss']
})
export class ChartBarComponent implements OnInit {

  @Input() showlegend: boolean = true;
  @Input() data: any = null;
  uuid: any = null;
  constructor() { }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  newHexColor(){
    return '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
  }

  load(){
    if (!this.data) return;
    var data = []
    var labels = []
    for (let x of this.data){
      data.push(x.count)
      labels.push(x.label)
    }
		var myScript = `
    var elem = document.getElementById('` + this.uuid + `');
    var barChart = elem.getContext('2d');
    var myBarChart = new Chart(barChart, {
			type: 'bar',
			data: {
				datasets: [{
					data: [` + data.join(', ') + `],
					backgroundColor: [` + labels.map(x => "'" + this.newHexColor() + "'") + `]
				}],
				labels: [` + labels.map(x => "'" + x + "'").join(', ') + `]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
        plugins: {
          legend: {
            display: ` + (this.showlegend ? 'true' : 'false') + `,
          }
        },
				legend : {
					position: 'bottom'
				},
				layout: {
					padding: {
						left: 20,
						right: 20,
						top: 20,
						bottom: 20
					}
				}
			}
		});`
    eval(myScript);
  }

  ngAfterViewInit() {
    this.load()
  }

  ngOnInit(): void {
    this.uuid = this.uuidv4();
  }
}
