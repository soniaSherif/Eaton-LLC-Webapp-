import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'signin',
        loadComponent: () =>
          import('./auth-signin/auth-signin.component')
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./auth-signup/auth-signup.component')
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
