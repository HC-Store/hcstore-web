import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ColecoesComponent } from './pages/colecoes/colecoes.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
// import { PagamentoComponent } from './pages/pagamento/pagamento.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: HomeComponent
  },

  {
    path: 'colecoes',
    component: ColecoesComponent
  },

  {
    path: 'product-list',
    component: ProductListComponent
  },

  {
    path: 'product-detail',
    component: ProductDetailComponent
  },

  {
    path: 'checkout',
    component: CheckoutComponent
  },

  // Quando criar a página de pagamento
  // {
  //   path: 'pagamento',
  //   component: PagamentoComponent
  // },

  {
    path: '**',
    redirectTo: 'home'
  }
];