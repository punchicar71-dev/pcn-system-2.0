// Shared constants across the application

export const VEHICLE_BRANDS = [
  'Toyota',
  'Honda',
  'Nissan',
  'Suzuki',
  'Mitsubishi',
  'Mazda',
  'Subaru',
  'Daihatsu',
  'Isuzu',
  'Other',
] as const;

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const;

export const TRANSMISSION_TYPES = ['Manual', 'Automatic'] as const;

export const BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Van', 'Truck'] as const;

export const PAYMENT_TYPES = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'Leasing',
  'Check',
] as const;

export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;

export const USER_STATUS = ['active', 'inactive'] as const;

export const VEHICLE_STATUS = ['available', 'pending', 'sold'] as const;

export const COUNTRIES = [
  'Japan',
  'India',
  'Korea',
  'Malaysia',
  'Singapore',
  'Germany',
  'UK',
  'Other',
] as const;

// API Configuration
export const API_ENDPOINTS = {
  VEHICLES: '/api/vehicles',
  SALES: '/api/sales',
  USERS: '/api/users',
  ANALYTICS: '/api/analytics',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
