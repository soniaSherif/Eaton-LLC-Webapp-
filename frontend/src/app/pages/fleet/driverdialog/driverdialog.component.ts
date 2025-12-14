import { Component } from '@angular/core';
//import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperatorService } from 'src/app/services/operator.service';
import { TruckService } from 'src/app/services/truck.service';
import { DriverService } from 'src/app/services/driver.service';
import { AssignTruckService } from 'src/app/services/assign-truck.service';
import { UserService } from 'src/app/services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';


@Component({
  selector: 'app-driverdialog',
  standalone: true,                     // ← add this
  imports: [FormsModule, CommonModule],
  templateUrl: './driverdialog.component.html',
  styleUrl: './driverdialog.component.scss',
})
export class DriverdialogComponent {
  isEditMode = false;
  editingDriverId: number | null = null;
  constructor(
    public dialog: MatDialogRef<DriverdialogComponent>,
    private operatorService: OperatorService,
    private truckService: TruckService,
    private driverService: DriverService,
    private assignTruckService: AssignTruckService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {}

  // Driver info
  selectedFirstname = '';
  selectedLastname = '';
  selectedCDL = '';
  selectedBilling_id = '';
  selectedUsername = '';
  selectedPassword = '';
  selectedEmail = '';
  selectedAddress = '';
  selectedCity = '';
  selectedZip = '';
  selectedPhone = '';
  // selectedMarket = '';
  selectedLicenseIssueDate: string = '';   // 'YYYY-MM-DD'
  selectedLicenseExpiryDate: string = '';  // 'YYYY-MM-DD'
  selectedMedicalCardExpiryDate: string = '';  // 'YYYY-MM-DD'

  selectedCountry = '';
  selectedState = '';

  // Operator logic
  creatingNewOperator = false;
  selectedOperatorId: string = '';
  newOperatorName: string = '';
  newOperatorType: string = 'ITO';
  operatorList: any[] = [];

  // Truck logic
  creatingNewTruck = false;
  selectedTruckId: string = '';
  truckList: any[] = [];
  availableTrucks: any[] = [];
  newTruckData = {
    truck_type: '',
    carrier: '',
    truck_number: '',
    license_plate: '',
    market: '',

  };

  // Dropdowns & location
  filteredStates = [];
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
  // market = ['Company Driver', 'Prevailing', 'Proechel Trucking'];

 ngOnInit() {
  // edit mode: we came from FleetComponent.editDriver(...)
  if (this.data && this.data.mode === 'edit' && this.data.driver) {
    this.isEditMode = true;
    const d = this.data.driver;

    this.editingDriverId = d.id;

    // name comes from fleet mapping: type = driver.name
    const fullName: string = d.type || d.name || '';
    const [first, ...rest] = fullName.split(' ');
    this.selectedFirstname = first || '';
    this.selectedLastname = rest.join(' ') || '';

    // CDL / phone / email / address
    this.selectedCDL = d.number || d.driver_license || '';
    this.selectedPhone = d.phone || d.phone_number || '';
    this.selectedEmail = d.email_address || '';
    this.selectedAddress = d.address || '';

    this.selectedBilling_id = d.billing_id || '';
    this.selectedCity       = d.city || '';
    this.selectedZip        = d.zip || '';
    this.selectedCountry    = d.country || '';
    this.selectedState      = d.state || '';
    this.selectedUsername   = d.username || d.user_username || '';

    // dates
    this.selectedLicenseIssueDate = d.license_issue_date || '';
    this.selectedLicenseExpiryDate = d.license_expiry_date || '';
    this.selectedMedicalCardExpiryDate =
      d.medical_expiry_date || d.medical_card_expiry_date || '';

    // operator id (if present on driver)
    if (d.operator) {
      this.selectedOperatorId = String(d.operator);
    }
    // we are not changing truck assignment in edit mode for now
  } else {
    this.isEditMode = false;
  }

  // keep loading trucks/operators as before
  this.loadAvailableTrucks();
}

  

  loadOperators() {
    this.operatorService.getOperators().subscribe((data) => {
      this.operatorList = data.filter(op => {
        if (op.operator_type === 'MTO') return true;
  
        // Check if operator has unassigned trucks
        const unassignedTrucks = this.truckList.filter(
          (truck) => truck.operator === op.id && !truck.assigned
        );
  
        return unassignedTrucks.length > 0;
      });
    });
  }

  loadAvailableTrucks() {
    this.truckService.getUnassignedTrucks().subscribe((data) => {
      console.log('Unassigned Trucks:', data); // ← Add this
      this.truckList = data;
      this.availableTrucks = data;
  
      this.operatorService.getOperators().subscribe((ops) => {
        this.operatorList = ops.filter(op => {
          if (op.operator_type === 'MTO') return true;
          const hasUnassignedTruck = this.availableTrucks.some(t => t.operator === op.id);
          return hasUnassignedTruck;
        });
      });
    });
  }
  

  

  onCountrySelect(selectedCountry) {
    this.filteredStates = this.states.find(item => item.country === selectedCountry)?.List || [];
  }

   submitForm(): void {
    if (!this.selectedLicenseExpiryDate) {
      alert('License expiry date is required.');
      return;
    }
    if (
      this.selectedLicenseIssueDate &&
      this.selectedLicenseIssueDate > this.selectedLicenseExpiryDate
    ) {
      alert('License issue date cannot be after the expiry date.');
      return;
    }
    if (!this.selectedMedicalCardExpiryDate) {
      alert('Medical card expiry date is required.');
      return;
    }

    const driverName = `${this.selectedFirstname} ${this.selectedLastname}`.trim();

   // EDIT MODE: update existing driver only
    if (this.isEditMode && this.editingDriverId) {
      const original = this.data.driver;

      const payload: any = {
        name: driverName,
        email_address: this.selectedEmail,
        address: this.selectedAddress,
        phone_number: this.selectedPhone,
        driver_license: this.selectedCDL,
        contact_info: this.selectedPhone,
        license_issue_date: this.selectedLicenseIssueDate || null,
        license_expiry_date: this.selectedLicenseExpiryDate,
        medical_card_expiry_date: this.selectedMedicalCardExpiryDate || null,
        // keep existing relationships
        operator: original.operator,
        user: original.user,
      };

      // if operator is selected in the form, override the original
      if (this.selectedOperatorId) {
        payload.operator = parseInt(this.selectedOperatorId, 10);
      }

      this.driverService.updateDriver(this.editingDriverId, payload).subscribe(() => {
        this.dialog.close(true);
      });

      return; // stop here, do not run the "create" flow
    }


    // ADD MODE (your existing logic kept below)

    const createDriverAndAssign = (userId: number, operatorId: number, truckId: number) => {
      const driverPayload = {
        name: driverName,
        email_address: this.selectedEmail,
        address: this.selectedAddress,
        phone_number: this.selectedPhone,
        driver_license: this.selectedCDL,
        contact_info: this.selectedPhone,
        operator: operatorId,
        user: userId,
        license_issue_date: this.selectedLicenseIssueDate || null,
        license_expiry_date: this.selectedLicenseExpiryDate,
        medical_card_expiry_date: this.selectedMedicalCardExpiryDate || null
      };

      this.driverService.createDriver(driverPayload).subscribe((driver) => {
        this.assignTruckService.assignTruckToDriver(driver.id, truckId).subscribe(() => {
          console.log('Driver and truck created + linked.');
          this.dialog.close();
        });
      });
    };

    // Create User first
    const userPayload = {
      username: this.selectedUsername,
      password: this.selectedPassword,
      email: this.selectedEmail
    };

    this.userService.createUser(userPayload).subscribe((user) => {
      const userId = user.id;

      // Handle Operator
      if (this.creatingNewOperator) {
        this.operatorService.createOperator({
          name: this.newOperatorName,
          operator_type: this.newOperatorType as 'ITO' | 'MTO',
        }).subscribe((operator) => {
          const operatorId = operator.id;

          if (this.creatingNewTruck) {
            const truckPayload = {
              ...this.newTruckData,
              operator: operatorId,
              market: [this.newTruckData.market]
            };

            this.truckService.createTruck(truckPayload).subscribe((truck) => {
              createDriverAndAssign(userId, operatorId, truck.id);
            });
          } else {
            createDriverAndAssign(userId, operatorId, parseInt(this.selectedTruckId, 10));
          }
        });
      } else {
        const operatorId = parseInt(this.selectedOperatorId, 10);

        if (this.creatingNewTruck) {
          const truckPayload = {
            ...this.newTruckData,
            operator: operatorId,
            market: [this.newTruckData.market]
          };

          this.truckService.createTruck(truckPayload).subscribe((truck) => {
            createDriverAndAssign(userId, operatorId, truck.id);
          });
        } else {
          createDriverAndAssign(userId, operatorId, parseInt(this.selectedTruckId, 10));
        }
      }
    });
  }


    closepopup() {
    this.dialog.close();
  }

  // NEW: called when you click the "Delete" button in edit mode
  deleteDriver() {
    // Only allow delete in edit mode and with a valid id
    if (!this.isEditMode || !this.editingDriverId) {
      return;
    }

    if (!confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    this.driverService.deleteDriver(this.editingDriverId).subscribe(() => {
      console.log('Driver deleted');
      this.dialog.close(true);  // let FleetComponent refresh the table
    });
  }
}



