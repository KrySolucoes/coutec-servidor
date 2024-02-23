import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Calendar, CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular';
import ptLocale from '@fullcalendar/core/locales/pt';
import { CrudBaseService } from 'src/app/services/crud-base.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarApi!: Calendar;
  @Input() events: any[] = [];
  @Input() eventColor: any = null;
  @Output() callback: EventEmitter<any> = new EventEmitter();

  constructor() { }
  ngAfterViewInit(): void {
    this.calendarApi = this.calendarComponent.getApi();
    this.calendarApi.addEventSource(this.events)
  }

  setEvents(events: any[]){
    this.events = events
    this.calendarApi.removeAllEvents()
    this.calendarApi.addEventSource(this.events)
  }

  calendarOptions: any = null;

  ngOnInit(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      locale: ptLocale,
      firstDay: 0,
      selectable: true,
      editable: true,
      events: [],
      eventColor: this.eventColor,
      eventDisplay: 'block',
      select: this.handleDateClick.bind(this),
      dateClick: this.handleDateClick.bind(this),
      navLinkDayClick: this.handleDateClick.bind(this),
      moreLinkClick: this.handleDateClick.bind(this),
      navLinkWeekClick: this.handleDateClick.bind(this),
      eventClick: this.handleDateClick.bind(this),
      customButtons: {
        next: {
            click: this.nextMonth.bind(this),
        },
        prev: {
            click: this.prevMonth.bind(this),
        },
        today: {
            text: "Hoje",
            click: this.todayMonth.bind(this),
        },
      },
    };
    setTimeout(() => {
      this.todayMonth()
    }, 1000)
  }

  todayMonth(): void {
    this.calendarApi.today();
    this.callback.emit({
      type: 'navigation',
      start: this.calendarApi.currentData.dateProfile.activeRange?.start,
      end: this.calendarApi.currentData.dateProfile.activeRange?.end,
    })
  }

  prevMonth(): void {
    this.calendarApi.prev();
    this.callback.emit({
      type: 'navigation',
      start: this.calendarApi.currentData.dateProfile.activeRange?.start,
      end: this.calendarApi.currentData.dateProfile.activeRange?.end,
    })
  }

  nextMonth(): void {
    this.calendarApi.next();
    this.callback.emit({
      type: 'navigation',
      start: this.calendarApi.currentData.dateProfile.activeRange?.start,
      end: this.calendarApi.currentData.dateProfile.activeRange?.end,
    })
  }

  handleDateClick(arg: any) {
    this.callback.emit({
      type: 'click',
      event: arg.event,
    })
  }

}
