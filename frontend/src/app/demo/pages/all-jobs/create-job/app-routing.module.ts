import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllJobsComponent } from '../all-jobs.component';
import { CreateJobComponent } from './create-job.component';


const routes: Routes = [
  { path: 'jobs', component: AllJobsComponent },
  { path: 'jobs/create', component: CreateJobComponent },
  { path: '', redirectTo: 'jobs', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
