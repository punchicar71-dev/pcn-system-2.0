// Vehicle Types
export interface Vehicle {
  id: string;
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  transmission: 'Manual' | 'Automatic';
  bodyType: 'Sedan' | 'Hatchback' | 'SUV' | 'Van' | 'Truck';
  color: string;
  country: string;
  engineCapacity?: number;
  images: string[];
  features?: string[];
  description?: string;
  status: 'available' | 'advance_paid' | 'reserved' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleFormData {
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  country: string;
  engineCapacity?: number;
  features?: string[];
  description?: string;
}

// Seller Types
export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  nicNumber: string;
  createdAt: Date;
}

// Customer Types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  landPhone?: string;
  address: string;
  town: string;
  nicNumber: string;
  createdAt: Date;
}

// Sales Types
export interface Sale {
  id: string;
  vehicleId: string;
  customerId: string;
  salesAgentId: string;
  salePrice: number;
  paymentType: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Leasing' | 'Check';
  downPayment?: number;
  leasingAmount?: number;
  leasingPeriod?: number;
  interestRate?: number;
  status: 'advance_paid' | 'completed' | 'cancelled';
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DashboardStats {
  availableVehicles: {
    total: number;
    sedan: number;
    hatchback: number;
    suv: number;
  };
  advancePaidVehicles: {
    total: number;
    sedan: number;
    hatchback: number;
    suv: number;
  };
  soldToday: {
    total: number;
    sedan: number;
    hatchback: number;
    suv: number;
  };
}

export interface SalesAnalytics {
  totalSales: number;
  salesByCategory: {
    category: string;
    count: number;
  }[];
  salesByAgent: {
    agentName: string;
    count: number;
  }[];
}
