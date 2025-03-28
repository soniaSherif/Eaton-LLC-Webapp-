import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driverdialog',
  imports: [

    FormsModule, 
    CommonModule,
  
  ],
  templateUrl: './driverdialog.component.html',
  styleUrl: './driverdialog.component.scss'
  
})

export class DriverdialogComponent {
  constructor(public dialog:MatDialogRef<DriverdialogComponent>) {}

  selectedFirstname: string = '';
  selectedLastname: string = '';
  selectedCDL: string = '';
  selectedBilling_id: string = '';
  selectedUsername: string = '';
  selectedPassword: string = '';
  selectedEmail: string = '';
  selectedAddress: string = '';
  selectedCity: string = '';
  selectedZip: string = '';
  selectedPhone: string = '';
  selectedMarket: string = '';
  selectedCountry: string = '';
  selectedState: string = '';
  
  firstName = [];
  lastName =[];
  CDL =[];
  billingID =[];
  username =[];
  password = [];
  email =[];
  address =[];
  city =[];
  zip =[];
  phone = [];
  market =[];
  country =[];
  state = [];
  
  ngOnInit() { 
    this.firstName =[],
    this.lastName =[],
    this.CDL =[],
    this.billingID =[],
    this.username =[],
    this.password =[],
    this.email =[],
    this.address =[],
    this.city =[],
    this.country =[]
    this.state =[]
    this.zip =[],
    this.phone =[],
    this.market = ['Company Driver', 'Prevailing', 'Proechel Trucking']
    

  }
  
  filteredStates =[];
  countries = ['United States', 'Canada', 'Australia'];

  states = [
    {
      country: 'United States',
      List: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
        'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
        'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
        'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
      ]
    },
    {
      country: 'Canada',
      List: [
        'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
        'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
        'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
        'Saskatchewan', 'Yukon'
      ]
    },
    {
      country: 'Australia',
      List: [
        'Australian Capital Territory', 'New South Wales', 'Northern Territory',
        'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
      ]
    }
  ];
  

  

  onCountrySelect(selectedCountry) {
    this.filteredStates = this.states.find(item => item.country === selectedCountry).List;
  }
  
  submitForm(): void {
    const formData = { 
      driver_id: '',
      user_id: '',
      name: `${this.selectedFirstname} ${this.selectedLastname}`,
      cdl: this.selectedCDL,
      billing_id: this.selectedBilling_id,
      username: this.selectedUsername,
      password: this.selectedPassword,
      email: this.selectedEmail,
      address: this.selectedAddress,
      city: this.selectedCity,
      zip: this.selectedZip,
      phone: this.selectedPhone,
      country: this.selectedCountry,
      state: this.selectedState,
      market: this.selectedMarket,
      created_at: new Date()
    };
  
    console.log('Form Submitted:', formData);
    this.dialog.close(formData);
  }

  closepopup()
  { 
    this.dialog.close()
  }
}

