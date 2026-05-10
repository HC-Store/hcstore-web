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

import { AuthGuard } from './guards/auth.guard';

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
    path: 'product-detail/:id',
    component: ProductDetailComponent
  },

  {
    path: 'checkout',
    component: CheckoutComponent
  },
   //Quando criar a página de pagamento
   {
    path: 'pagamento',
    component: PagamentoComponent
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
      component: DashboardComponent
    },
    {
      path: 'produtos',
      component: ProductsComponent
    },
    {
      path: 'pedidos',
      component: OrdersComponent
    },
    {
      path: 'usuarios',
      component: UsersComponent
    },
    {
      path: 'adicionar-produto',
      component: AddProductComponent
    }
  ]
},

  

  {
    path: '**',
    redirectTo: 'home'
  }
];



