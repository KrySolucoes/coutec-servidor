import { DashboardEstoqueComponent } from './dashboard/dashboard-estoque/dashboard-estoque.component';
import { DashboardManutencaoComponent } from './dashboard/dashboard-manutencao/dashboard-manutencao.component';
import { ServiceOrderViewComponent } from './service-order-view/service-order-view.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssetTypesComponent } from './asset-types/asset-types.component';
import { StocksComponent } from './stocks/stocks.component';
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InstallationsComponent } from './installations/installations.component';
import { InstallationComponent } from './installation/installation.component';
import { PersonsComponent } from './persons/persons.component';
import { PersonComponent } from './person/person.component';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from "./product/product.component";
import { AssetsComponent } from "./assets/assets.component";
import { AssetComponent } from "./asset/asset.component";
import { ProvidersComponent } from "./providers/providers.component";
import { ProviderComponent } from "./provider/provider.component";
import { ServiceOrdersComponent } from "./service-orders/service-orders.component";
import { ServiceOrderComponent } from "./service-order/service-order.component";
import { ConfigurationsComponent } from "./configurations/configurations.component";
import { ServiceOrdersKanbanComponent } from "./service-orders-kanban/service-orders-kanban.component";
import { StockComponent } from './stock/stock.component';
import { AssetTypeComponent } from './asset-type/asset-type.component';
import { ServiceOrdersCalendarComponent } from './service-orders-calendar/service-orders-calendar.component';

const adminRouterConfig: Routes = [
  { path: '', redirectTo: 'service-orders-kanban', pathMatch: 'full'},
  { path: 'dashboard/geral', component: DashboardComponent },
  { path: 'dashboard/manutencao', component: DashboardManutencaoComponent },
  { path: 'dashboard/estoque', component: DashboardEstoqueComponent },
  { path: 'installations', component: InstallationsComponent },
  { path: 'installations/:uuid', component: InstallationComponent },
  { path: 'persons', component: PersonsComponent },
  { path: 'persons/:uuid', component: PersonComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:uuid', component: ProductComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'assets/:uuid', component: AssetComponent },
  { path: 'assets/:parent_uuid/:uuid', component: AssetComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'providers/:uuid', component: ProviderComponent },
  { path: 'service-orders', component: ServiceOrdersComponent },
  { path: 'service-orders/:uuid', component: ServiceOrderComponent },
  { path: 'service-orders-kanban', component: ServiceOrdersKanbanComponent },
  { path: 'service-orders-calendar', component: ServiceOrdersCalendarComponent },
  { path: 'service-orders-view/:uuid', component: ServiceOrderViewComponent },
  { path: 'stock', component: StocksComponent },
  { path: 'stock/:uuid', component: StockComponent },
  { path: 'configurations', component: ConfigurationsComponent },
  { path: 'asset-types', component: AssetTypesComponent },
  { path: 'asset-types/:uuid', component: AssetTypeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(adminRouterConfig)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
