import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImageViewComponent } from "./image-view/image-view.component";
import { CalendarComponent } from './calendar/calendar.component';
import { FullCalendarModule } from "@fullcalendar/angular";
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction';
import { TableComponent } from './table/table.component'; // a plugin!
import { ChartCirclesComponent } from "./charts/chart-circles/chart-circles.component";
import { ChartPieComponent } from './charts/chart-pie/chart-pie.component';
import { ChartDoughnutComponent } from './charts/chart-doughnut/chart-doughnut.component';
import { UpdatePasswordModalComponent } from './update-password-modal/update-password-modal.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { NavTabComponent } from "./nav-tab/nav-tab.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { NgChartsModule } from "ng2-charts";
import { ColorPickerModule } from "ngx-color-picker";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { NgxPrintModule } from "ngx-print";
import { FormsModule } from "@angular/forms";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { TipoDefeitoModalComponent } from './tipo-defeito-modal/tipo-defeito-modal.component';
import { FormSelectComponent } from "./form-select/form-select.component";
import { ChartBarComponent } from './charts/chart-bar/chart-bar.component';
import { FormCurrencyComponent } from './form-currency/form-currency.component';
import { IConfig, NgxMaskModule } from "ngx-mask";
import { FormTimeComponent } from "./form-time/form-time.component";
import { FormDateComponent } from "./form-date/form-date.component";
import { CurrencyMaskModule } from "ng2-currency-mask";
import { SuporteComponent } from './suporte/suporte.component';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

const maskConfig: Partial<IConfig> = {
  validation: true,
};

@NgModule({
  declarations: [
    NavTabComponent,
    FormSelectComponent,
    ImageViewComponent,
    CalendarComponent,
    ChartCirclesComponent,
    TableComponent,
    ChartPieComponent,
    ChartDoughnutComponent,
    UpdatePasswordModalComponent,
    TipoDefeitoModalComponent,
    ChartBarComponent,
    FormTimeComponent,
    FormDateComponent,
    FormCurrencyComponent,
    SuporteComponent
  ],
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    ColorPickerModule,
    DragDropModule,
    NgChartsModule,
    FormsModule,
    NgxPrintModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    CurrencyMaskModule,
    NgxMaskModule.forRoot(maskConfig),
  ],
  exports: [
    FormsModule,
    NavTabComponent,
    FormSelectComponent,
    ImageViewComponent,
    CalendarComponent,
    ChartCirclesComponent,
    TableComponent,
    ChartPieComponent,
    ChartDoughnutComponent,
    UpdatePasswordModalComponent,
    MatDialogModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    ColorPickerModule,
    DragDropModule,
    NgChartsModule,
    NgxPrintModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    ChartBarComponent,
    FormTimeComponent,
    FormDateComponent,
    FormCurrencyComponent
  ]
})
export class SharedModule {}
