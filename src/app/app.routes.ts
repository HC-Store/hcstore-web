import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ColecoesComponent } from './pages/colecoes/colecoes.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { PagamentoComponent } from './pages/pagamento/pagamento.component';

import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { ProductsComponent } from './pages/admin/products/products.component';
import { OrdersComponent } from './pages/admin/orders/orders.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { AddProductComponent } from './pages/admin/add-product/add-product.component';
import { ConfigHomeComponent } from './pages/admin/config-home/config-home.component';
import { AuthGuard } from './guards/auth.guard';
import { ConfigColecoesComponent } from './pages/admin/config-colecoes/config-colecoes.component';
import { CuponsComponent } from './pages/admin/cupons/cupons.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: HomeComponent,
    title: 'HC Store'
  },

  {
    path: 'colecoes',
    component: ColecoesComponent,
    title: 'Colecoes | HC Store'
  },

  {
    path: 'product-list',
    component: ProductListComponent,
    title: 'Produtos | HC Store'
  },

  {
    path: 'product-detail/:id',
    component: ProductDetailComponent,
    title: 'Detalhes do produto | HC Store'
  },

  {
    path: 'checkout',
    component: CheckoutComponent,
    title: 'Checkout | HC Store'
  },
   //Quando criar a página de pagamento
   {
    path: 'pagamento',
    component: PagamentoComponent,
    title: 'Pagamento | HC Store'
   },

   {
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [AuthGuard],
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      title: 'Dashboard | HC Store Admin'
    },
    {
      path: 'produtos',
      component: ProductsComponent,
      title: 'Produtos | HC Store Admin'
    },
    {
      path: 'pedidos',
      component: OrdersComponent,
      title: 'Pedidos | HC Store Admin'
    },
    {
      path: 'usuarios',
      component: UsersComponent,
      title: 'Usuarios | HC Store Admin'
    },
    {
      path: 'adicionar-produto',
      component: AddProductComponent,
      title: 'Adicionar produto | HC Store Admin'
    },
    {
      path: 'config-home',
      component: ConfigHomeComponent
    },
    {
     path: 'cupons',
     component: CuponsComponent,
     title: 'Cupons | HC Store Admin'
    },
    {
      path: 'config-colecoes',
      component: ConfigColecoesComponent
    }

  ]
},

  {
  path: 'pagamento/sucesso',
  loadComponent: () =>
    import('./pages/pagamento-sucesso/pagamento-sucesso.component')
      .then(m => m.PagamentoSucessoComponent)
},

{
  path: 'pagamento/erro',
  loadComponent: () =>
    import('./pages/pagamento-erro/pagamento-erro.component')
      .then(m => m.PagamentoErroComponent)
},

{
  path: 'pagamento/pendente',
  loadComponent: () =>
    import('./pages/pagamento-pendente/pagamento-pendente.component')
      .then(m => m.PagamentoPendenteComponent)
},
{
    path: '**',
    redirectTo: 'home'
  }
];
