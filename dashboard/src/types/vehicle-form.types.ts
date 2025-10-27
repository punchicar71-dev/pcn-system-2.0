// Shared Types for Vehicle Form Wizard

export type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface VehicleFormState {
  currentStep: FormStep;
  vehicleDetails: VehicleDetailsData;
  sellerDetails: SellerDetailsData;
  vehicleOptions: VehicleOptionsData;
  sellingDetails: SellingDetailsData;
  specialNotes: SpecialNotesData;
}

export interface VehicleDetailsData {
  vehicleNumber: string;
  brandId: string;
  modelId: string;
  modelNumberOther: string;
  manufactureYear: number | null;
  countryId: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  engineCapacity: string;
  exteriorColor: string;
  registeredYear: number | null;
  vehicleImages: File[];
  vehicleImagePreviews: string[];
  crImages: File[];
  crImagePreviews: string[];
}

export interface SellerDetailsData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  nicNumber: string;
  mobileNumber: string;
  landPhoneNumber: string;
  emailAddress: string;
}

export interface VehicleOptionsData {
  standardOptions: {
    [key: string]: boolean;
  };
  specialOptions: {
    [key: string]: boolean;
  };
  customOptions: string[];
}

export interface SellingDetailsData {
  sellingAmount: string;
  mileage: string;
  entryType: string;
  entryDate: string;
  status: string;
}

export interface SpecialNotesData {
  tagNotes: string;
  specialNotePrint: string;
}

// Dropdown Options
export const BODY_TYPES = [
  'SUV',
  'Sedan',
  'Hatchback',
  'Wagon',
  'Coupe',
  'Convertible',
  'Van',
  'Truck',
] as const;

export const FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Petrol + Hybrid',
  'Diesel + Hybrid',
  'EV',
] as const;

export const TRANSMISSIONS = [
  'Automatic',
  'Manual',
  'Auto',
] as const;

export const ENTRY_TYPES = [
  'PVC Pvt Ltd.',
  'PCN Import',
  'Consignment',
] as const;

export const VEHICLE_STATUS = [
  'In Sale',
  'Out of Sale',
  'Reserved',
] as const;

export const STANDARD_OPTIONS = [
  'A/C',
  '5 Speed',
  'Bluetooth',
  'Crystal Light',
  'MP3',
  'Alloy Wheels',
  'Reverse Camera',
  'Full Option',
  'Remote C / Lock',
  'Power Shutters',
  'Digital Meter',
] as const;

export const SPECIAL_OPTIONS = [
  'A/C',
  '5 Speed',
  'Bluetooth',
  'Crystal Light',
  'MP3',
  'Alloy Wheels',
  'Reverse Camera',
  'Full Option',
  'Remote C / Lock',
  'Power Shutters',
  'Digital Meter',
] as const;

// Helper to generate years array
export const getYearRange = (startYear: number = 1980): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};

// Initial form state
export const initialVehicleDetails: VehicleDetailsData = {
  vehicleNumber: '',
  brandId: '',
  modelId: '',
  modelNumberOther: '',
  manufactureYear: null,
  countryId: '',
  bodyType: '',
  fuelType: '',
  transmission: '',
  engineCapacity: '',
  exteriorColor: '',
  registeredYear: null,
  vehicleImages: [],
  vehicleImagePreviews: [],
  crImages: [],
  crImagePreviews: [],
};

export const initialSellerDetails: SellerDetailsData = {
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  nicNumber: '',
  mobileNumber: '',
  landPhoneNumber: '',
  emailAddress: '',
};

export const initialVehicleOptions: VehicleOptionsData = {
  standardOptions: {},
  specialOptions: {},
  customOptions: [],
};

export const initialSellingDetails: SellingDetailsData = {
  sellingAmount: '',
  mileage: '',
  entryType: 'PVC Pvt Ltd.',
  entryDate: new Date().toISOString().split('T')[0],
  status: 'In Sale',
};

export const initialSpecialNotes: SpecialNotesData = {
  tagNotes: '',
  specialNotePrint: '',
};

export const initialFormState: VehicleFormState = {
  currentStep: 1,
  vehicleDetails: initialVehicleDetails,
  sellerDetails: initialSellerDetails,
  vehicleOptions: initialVehicleOptions,
  sellingDetails: initialSellingDetails,
  specialNotes: initialSpecialNotes,
};
