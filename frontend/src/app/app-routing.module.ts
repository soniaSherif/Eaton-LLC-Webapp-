import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { DbJobViewerComponent } from './pages/daily-board/db-job-viewer/db-job-viewer.component';
import {EditJobsComponent} from './pages/all-jobs/edit-job/edit-jobs.component'

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'daily-board',
        pathMatch: 'full'
      },
      {
        path: 'forms',
        loadChildren: () => import('./pages/form-elements/form-elements.module').then((m) => m.FormElementsModule)
      },
      {
        path: 'tables',
        loadChildren: () => import('./pages/tables/tables.module').then((m) => m.TablesModule)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./pages/core-chart/apex-chart/apex-chart.component')
      },
      {
        path: 'all-jobs',
        loadComponent: () => import('./pages/all-jobs/all-jobs.component').then((c) => c.AllJobsComponent)
      },
      {
        path: 'all-jobs/create',
        loadComponent: () => import('./pages/all-jobs/create-job/create-job.component').then((c) => c.CreateJobComponent)
      },
      {
        path: 'fleet',
        loadComponent: () => import('./pages/fleet/fleet.component').then((c) => c.FleetComponent)      
      },
      { path: 'customers', 
        loadComponent: () => import('./pages/customer/customer.component').then((c) => c.CustomerComponent)
      },
      {

        path: 'customers/create',
        loadComponent: () => import('./pages/customer/create-customer/create-customer.component').then((c) => c.CreateCustomerComponent)
      },
      {
        path: 'daily-board',
        loadComponent: () => import('./pages/daily-board/daily-board.component').then((c) => c.DailyBoardComponent)
      },
      {
        path: 'dispatch',
        loadComponent: () => import('./pages/dispatch/dispatch.component').then((c) => c.DispatchComponent)
      },
      {
        path: 'pay-report',
        loadComponent: () => import('./pages/pay-report/pay-report.component').then((c) => c.PayReportComponent)
      },
      {
        path: 'end-of-day-report',
        loadComponent: () => import('./pages/end-of-day-report/end-of-day-report.component').then((c) => c.EndOfDayReportComponent)

      },
      {
        path: 'db-job-viewer/:id', component: DbJobViewerComponent
      },
      { path: 'job-edit/:id',    component: EditJobsComponent },

    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
