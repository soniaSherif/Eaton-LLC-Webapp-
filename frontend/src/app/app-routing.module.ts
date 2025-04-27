import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'forms',
        loadChildren: () => import('./demo/pages/form-elements/form-elements.module').then((m) => m.FormElementsModule)
      },
      {
        path: 'tables',
        loadChildren: () => import('./demo/pages/tables/tables.module').then((m) => m.TablesModule)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component')
      },
      {
        path: 'all-jobs',
        loadComponent: () => import('./demo/pages/all-jobs/all-jobs.component').then((c) => c.AllJobsComponent)
      },
      {
        path: 'all-jobs/create',
        loadComponent: () => import('./demo/pages/all-jobs/create-job/create-job.component').then((c) => c.CreateJobComponent)
      },
      {
        path: 'fleet',
        loadComponent: () => import('./demo/pages/fleet/fleet.component').then((c) => c.FleetComponent)      
      },
      { path: 'customers', 
        loadComponent: () => import('./demo/pages/customer/customer.component').then((c) => c.CustomerComponent)
      },
      {

        path: 'customers/create',
        loadComponent: () => import('./demo/pages/customer/create-customer/create-customer.component').then((c) => c.CreateCustomerComponent)
      },
      {
        path: 'daily-board',
        loadComponent: () => import('./demo/pages/daily-board/daily-board.component').then((c) => c.DailyBoardComponent)
      },
      {
        path: 'dispatch',
        loadComponent: () => import('./demo/pages/dispatch/dispatch.component').then((c) => c.DispatchComponent)
      },
      {
        path: 'pay-report',
        loadComponent: () => import('./demo/pages/pay-report/pay-report.component').then((c) => c.PayReportComponent)
      },
      {
        path: 'end-of-day-report',
        loadComponent: () => import('./demo/pages/end-of-day-report/end-of-day-report.component').then((c) => c.EndOfDayReportComponent)

      },
      {
        path: 'db-job-viewer/:jobNumber',
        loadComponent: () => import('./demo/pages/daily-board/db-job-viewer/db-job-viewer.component').then((c) => c.DbJobViewerComponent)

      },

    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
