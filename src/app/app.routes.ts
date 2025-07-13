import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout'),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/components/home/home'),
      },
      // Rutas de administración protegidas
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/components/admin-dashboard').then(
                (m) => m.default
              ),
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./features/admin/components/product-list').then(
                (m) => m.default
              ),
          },
          {
            path: 'products/create',
            loadComponent: () =>
              import('./features/admin/components/product-create').then(
                (m) => m.default
              ),
          },
          {
            path: 'products/edit/:codigo',
            loadComponent: () =>
              import('./features/admin/components/product-edit').then(
                (m) => m.default
              ),
          },
          {
            path: 'products/:codigo',
            loadComponent: () =>
              import('./features/admin/components/product-detail').then(
                (m) => m.default
              ),
          },
          {
            path: 'categories',
            loadComponent: () =>
              import('./features/admin/components/category-manager').then(
                (m) => m.default
              ),
          },
          {
            path: 'images',
            loadComponent: () =>
              import('./features/admin/components/image-manager').then(
                (m) => m.default
              ),
          },
        ],
      },
      // Rutas públicas de productos
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search-results').then((m) => m.default),
      },
      {
        path: 'product/:codigo',
        loadComponent: () =>
          import('./features/product/product-detail').then((m) => m.default),
      },
      {
        path: 'products/category/:category',
        loadComponent: () =>
          import('./features/product/category-products').then(
            (m) => m.CategoryProductsComponent
          ),
      },
      {
        path: 'products/subcategory/:subcategory',
        loadComponent: () =>
          import('./features/product/subcategory-products').then(
            (m) => m.SubcategoryProductsComponent
          ),
      },
      // Rutas de checkout
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout').then(
            (m) => m.CheckoutComponent
          ),
      },
      {
        path: 'checkout/success',
        loadComponent: () =>
          import('./features/checkout/checkout-success').then(
            (m) => m.CheckoutSuccessComponent
          ),
      },
      // Rutas de pedidos
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/order-history').then(
            (m) => m.OrderHistoryComponent
          ),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
