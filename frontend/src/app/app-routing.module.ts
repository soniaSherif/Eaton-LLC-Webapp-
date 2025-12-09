import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { DbJobViewerComponent } from './pages/daily-board/db-job-viewer/db-job-viewer.component';
import { EditJobsComponent } from './pages/all-jobs/edit-job/edit-jobs.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [  
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  // Guest (auth) area
  {
    path: 'auth',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/authentication/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/authentication/forgot-password/forgot-password-request.component')
            .then(m => m.ForgotPasswordRequestComponent)
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },

  // Protected app
  {
    path: '',
    component: AdminComponent,
    // canActivateChild: [authGuard],   // enable after first load works
    children: [
      { path: 'forms', loadChildren: () => import('./pages/form-elements/form-elements.module').then(m => m.FormElementsModule) },
      { path: 'tables', loadChildren: () => import('./pages/tables/tables.module').then(m => m.TablesModule) },
      { path: 'apexchart', loadComponent: () => import('./pages/core-chart/apex-chart/apex-chart.component') },
      { path: 'all-jobs', loadComponent: () => import('./pages/all-jobs/all-jobs.component').then(c => c.AllJobsComponent) },
      { path: 'all-jobs/create', loadComponent: () => import('./pages/all-jobs/create-job/create-job.component').then(c => c.CreateJobComponent) },
      { path: 'fleet', loadComponent: () => import('./pages/fleet/fleet.component').then(c => c.FleetComponent) },
      { path: 'customers', loadComponent: () => import('./pages/customer/customer.component').then(c => c.CustomerComponent) },
      { path: 'customers/create', loadComponent: () => import('./pages/customer/create-customer/create-customer.component').then(c => c.CreateCustomerComponent) },
      { path: 'customers/view/:id', loadComponent: () => import('./pages/customer/view-customer/view-customer.component').then(c => c.ViewCustomerComponent) },
      { path: 'customers/edit/:id', loadComponent: () => import('./pages/customer/edit-customer/edit-customer.component').then(c => c.EditCustomerComponent) },
      { path: 'daily-board', loadComponent: () => import('./pages/daily-board/daily-board.component').then(c => c.DailyBoardComponent) },
      { path: 'dispatch', loadComponent: () => import('./pages/dispatch/dispatch.component').then(c => c.DispatchComponent) },
      { path: 'dispatch/view/:id', loadComponent: () => import('./pages/dispatch/view-dispatch-assignment/view-dispatch-assignment.component').then(c => c.ViewDispatchAssignmentComponent) },
      { path: 'dispatch/edit/:id', loadComponent: () => import('./pages/dispatch/edit-dispatch-assignment/edit-dispatch-assignment.component').then(c => c.EditDispatchAssignmentComponent) },
      { path: 'invoices-report', loadComponent: () => import('./pages/invoices/invoices-report.component').then(c => c.InvoicesReportComponent) },
      { path: 'invoice-detail/:id', loadComponent: () => import('./pages/invoices/invoice-detail/invoice-detail.component').then(c => c.InvoiceDetailComponent) },
      { path: 'db-job-viewer/:id', component: DbJobViewerComponent },
      { path: 'job-edit/:id', component: EditJobsComponent },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
