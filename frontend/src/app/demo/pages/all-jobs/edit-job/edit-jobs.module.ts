// src/app/demo/pages/all-jobs/edit-job/edit-jobs.module.ts

import { NgModule }                  from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkStepperModule }          from '@angular/cdk/stepper';
import { NgStepperModule }           from 'angular-ng-stepper';

import { SharedModule }              from 'src/app/theme/shared/shared.module';
import { AllJobsRoutingModule }      from '../all-jobs-routing.module';  // your feature routes

import { EditJobsComponent }         from './edit-jobs.component';

@NgModule({
  declarations: [
    EditJobsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkStepperModule,
    NgStepperModule,
    SharedModule,
    AllJobsRoutingModule
  ]
})
export class EditJobsModule {}
