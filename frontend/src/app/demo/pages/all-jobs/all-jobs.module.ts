import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllJobsComponent } from './all-jobs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { SharedModule } from 'src/app/theme/shared/shared.module';  // Import the shared module
import { AllJobsRoutingModule } from './all-jobs-routing.module';  // Import the routing module



@NgModule({
  
  imports: [
    CommonModule,  
    FormsModule, 
    ReactiveFormsModule,
    SharedModule,  // Include the shared module here
    AllJobsRoutingModule,  // Include the routing module here
    AllJobsComponent
  ],
  
})
export class AllJobsModule {}
