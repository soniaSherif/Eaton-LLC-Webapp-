export interface Job {
    job_title: string;
    project_title: string;
    customer: number; // ID of the customer
    job_number: number;
    order_number: number;
    material: string;
    driver: number; // ID of the driver
    truck: number; // ID of the truck
    rate_type: string;
    rate: number;
    haul_rate_type: string;
    haul_rate: number;
    amount: number;
    start_date: string; // "YYYY-MM-DD"
    end_date: string;
    date: string; // ISO string "YYYY-MM-DDTHH:mm:ss"
    start_time: string; // "HH:mm:ss"
    end_time: string;
    truck_type: string[];
    loading_address: string;
    unloading_address: string;
  }
  