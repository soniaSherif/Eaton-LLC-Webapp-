import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OperatorService } from 'src/app/services/operator.service';
import { TruckService } from 'src/app/services/truck.service';
import { DriverService } from 'src/app/services/driver.service';
import { AssignTruckService } from 'src/app/services/assign-truck.service';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-driverdialog',
  imports: [FormsModule, CommonModule],
  templateUrl: './driverdialog.component.html',
  styleUrl: './driverdialog.component.scss',
})
export class DriverdialogComponent {
  constructor(
    public dialog: MatDialogRef<DriverdialogComponent>,
    private operatorService: OperatorService,
    private truckService: TruckService,
    private driverService: DriverService,
    private assignTruckService: AssignTruckService,
    private userService: UserService
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
    const driverName = `${this.selectedFirstname} ${this.selectedLastname}`;
  
    const createDriverAndAssign = (userId: number, operatorId: number, truckId: number) => {
      const driverPayload = {
        name: driverName,
        email_address: this.selectedEmail,
        address: this.selectedAddress,
        phone_number: this.selectedPhone,
        driver_license: this.selectedCDL,
        contact_info: this.selectedPhone,
        operator: operatorId,
        user: userId  //  Pass the newly created user
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
              market: [this.newTruckData.market]  // Wrap it in an array

            };
  
            this.truckService.createTruck(truckPayload).subscribe((truck) => {
              createDriverAndAssign(userId, operatorId, truck.id);
            });
          } else {
            createDriverAndAssign(userId, operatorId, parseInt(this.selectedTruckId));
          }
        });
      } else {
        const operatorId = parseInt(this.selectedOperatorId);
  
        if (this.creatingNewTruck) {
          const truckPayload = {
            ...this.newTruckData,
            operator: operatorId,
            market: [this.newTruckData.market]  // Wrap it in an array

          };
  
          this.truckService.createTruck(truckPayload).subscribe((truck) => {
            createDriverAndAssign(userId, operatorId, truck.id);
          });
        } else {
          createDriverAndAssign(userId, operatorId, parseInt(this.selectedTruckId));
        }
      }
    });
  }
  

  closepopup() {
    this.dialog.close();
  }
}

