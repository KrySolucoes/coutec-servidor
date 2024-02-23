import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { InstallationsComponent } from './installations/installations.component';
import { InstallationComponent } from './installation/installation.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonComponent } from './person/person.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './product/product.component';
import { AssetsComponent } from './assets/assets.component';
import { AssetComponent } from './asset/asset.component';
import { ProviderComponent } from './provider/provider.component';
import { ProvidersComponent } from './providers/providers.component';
import { ServiceOrdersComponent } from './service-orders/service-orders.component';
import { ServiceOrderComponent } from './service-order/service-order.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ServiceOrdersKanbanComponent } from './service-orders-kanban/service-orders-kanban.component';
import { KanbanComponent } from '../common/kanban/kanban.component';
import { StockComponent } from './stock/stock.component';
import { StocksComponent } from './stocks/stocks.component';
import { AssetTypesComponent } from './asset-types/asset-types.component';
import { AssetTypeComponent } from './asset-type/asset-type.component';
import { SharedModule } from '../common/shared.module';
import { ServiceOrdersCalendarComponent } from './service-orders-calendar/service-orders-calendar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServiceOrderViewComponent } from './service-order-view/service-order-view.component';
import { ServiceOrdersCalendarModalComponent } from './service-orders-calendar-modal/service-orders-calendar-modal.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { ServiceOrderPrintComponent } from './service-order-print/service-order-print.component';
import { PlanoManutencaoPrintComponent } from './plano-manutencao-print/plano-manutencao-print.component';
import { DashboardManutencaoComponent } from './dashboard/dashboard-manutencao/dashboard-manutencao.component';
import { DashboardEstoqueComponent } from './dashboard/dashboard-estoque/dashboard-estoque.component';
import { ServiceOrderWPrintComponent } from './service-order-w-print/service-order-w-print.component';
import { ManutencaoDetalhadaPrintComponent } from './dashboard/manutencao-detalhada-print/manutencao-detalhada-print.component';
import { RelatorioDetalhadoPrintComponent } from './dashboard/relatorio-detalhado-print/relatorio-detalhado-print.component';

@NgModule({
  declarations: [
    InstallationsComponent,
    InstallationComponent,
    PersonsComponent,
    PersonComponent,
    ProductsComponent,
    ProductComponent,
    AssetsComponent,
    AssetComponent,
    ProvidersComponent,
    ProviderComponent,
    ServiceOrdersComponent,
    ServiceOrderComponent,
    ConfigurationsComponent,
    ServiceOrdersKanbanComponent,
    KanbanComponent,
    StockComponent,
    StocksComponent,
    AssetTypesComponent,
    AssetTypeComponent,
    ServiceOrdersCalendarComponent,
    DashboardComponent,
    ServiceOrderViewComponent,
    ServiceOrdersCalendarModalComponent,
    ServiceOrderPrintComponent,
    PlanoManutencaoPrintComponent,
    DashboardManutencaoComponent,
    DashboardEstoqueComponent,
    ServiceOrderWPrintComponent,
    ManutencaoDetalhadaPrintComponent,
    RelatorioDetalhadoPrintComponent
  ],
  imports: [
    AdminRoutingModule,
    CommonModule,
    SharedModule
  ],
  providers: [
    MatDatepickerModule,
    [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true, disableClose: false}}
  ]
})
export class AdminModule { }
