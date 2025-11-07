/**
 * API Types
 * TypeScript interfaces generated from Azure P-Connect API specification
 */

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Authentication Types
export interface SecurityRegister {
  badge_number: string;
  pin: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
}

export interface AdminCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active?: boolean;
}

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  building_id?: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  photo_url?: string;
  is_active?: boolean;
  programme_id?: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AdminLogin {
  email: string;
  password: string;
}

export interface SecurityLogin {
  badge_number: string;
  pin: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface Token {
  access_token: string;
  token_type?: string;
  user?: any;
}

// User Types
export interface UserResponse extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  building_id?: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  photo_url?: string;
  is_active: boolean;
  programme_id?: string;
  role?: string; // Optional role field (may not be present in all API responses)
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  is_active?: boolean;
  role?: string;
}

export interface UserProfileUpdate {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  building_id?: string;
  programme_id?: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  photo_url?: string;
}

// Building Types
export interface BuildingCreate {
  building_code: string;
  name: string;
  address: string;
  floors_count: number;
  blocks_count: number;
}

export interface BuildingResponse extends BaseEntity {
  building_code: string;
  name: string;
  address: string;
  floors_count: number;
  blocks_count: number;
  total_spaces: number;
  spaces: SpaceResponse[];
  floors: FloorResponse[];
  blocks: BlockResponse[];
}

export interface BuildingUpdate {
  name?: string;
  address?: string;
  floors_count?: number;
  blocks_count?: number;
}

// Space Types
export type SpaceType = 'DESK' | 'OFFICE' | 'ROOM';

export interface SpaceCreate {
  type: SpaceType;
  quantity: number;
}

export interface SpaceResponse extends BaseEntity {
  type: SpaceType;
  quantity: number;
  building_id: string;
}

export interface SpaceUpdate {
  quantity?: number;
}

// Floor Types
export interface FloorCreate {
  floor_index: number;
}

export interface FloorResponse extends BaseEntity {
  floor_index: number;
  building_id: string;
}

export interface FloorUpdate {
  floor_index?: number;
}

// Block Types
export interface BlockCreate {
  block_label: string;
}

export interface BlockResponse extends BaseEntity {
  block_label: string;
  building_id: string;
}

export interface BlockUpdate {
  block_label?: string;
}

// Booking Types - Updated to match new API spec
// Note: Booking status uses CheckInStatus enum, not separate BookingStatus
// Deprecated: BookingStatus type (kept for backward compatibility if needed)
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// Updated BookingCreate - matches new API spec
export interface BookingCreate {
  user_id: string; // UUID - Required
  building_id: string; // UUID - Required
  floor: number; // Integer - Required (not string)
  space_type: SpaceType; // 'DESK' | 'OFFICE' | 'ROOM' - Required
  booking_date: string; // ISO date-time string - Required
  start_time: string; // Time format (e.g., "09:00") - Required
  end_time: string; // Time format (e.g., "17:00") - Required
}

// Updated BookingResponse - matches BookingOut from API spec
export interface BookingResponse extends BaseEntity {
  user_id: string;
  space_id: string; // Auto-assigned by backend based on building_id, floor, space_type
  building_id?: string; // Building ID - may be included in API response
  space_type?: SpaceType; // Space type (DESK, OFFICE, ROOM) - may be included in API response
  booking_date: string; // ISO date-time string
  start_time: string; // Time format
  end_time: string; // Time format
  status: CheckInStatus; // Changed: Uses CheckInStatus ('pending' | 'checked_in' | 'checked_out')
  qr_code_url: string; // Included in response
  // Relationships (may be populated by API)
  user?: UserResponse;
  space?: SpaceResponse;
}

// Updated BookingUpdate - matches BookingCreate but all fields optional
export interface BookingUpdate {
  user_id?: string;
  building_id?: string;
  floor?: number;
  space_type?: SpaceType;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
}

// Check-in Types - Updated to match new API spec
export type CheckInStatus = 'pending' | 'checked_in' | 'checked_out';
export type UserType = 'employee' | 'visitor';

// Updated to match new API spec - all fields required except booking_id
export interface CheckInCreate {
  user_id: string;
  floor: string;
  block: string;
  laptop_model: string;  // Required by API
  laptop_asset_number: string;  // Required by API
  booking_id?: string;  // NEW - Optional link to booking for booking-linked check-ins
}

// Updated to match new API spec - CheckInOut schema + laptop fields from CheckInCreate
export interface CheckInResponse extends BaseEntity {
  user_id?: string;
  visitor_id?: string;
  building_id?: string;
  floor?: string;
  block?: string;
  programme_id?: string;
  status: CheckInStatus;
  user_type?: UserType;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
  qr_code_data?: string;  // This is the QR code (check-in ID)
  expires_at?: string;
  laptop_model?: string;  // From CheckInCreate - should be stored and returned
  laptop_asset_number?: string;  // From CheckInCreate - should be stored and returned
  // Relationships (may be populated by API)
  user?: UserResponse;
  building?: BuildingResponse;
}

// Status endpoint response - returns rich check-in data
export interface CheckInStatusResponse {
  checkin_id: string;
  status: CheckInStatus;
  user_id: string;
  floor?: string;
  block?: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  expires_at?: string;
}

export interface CheckInUpdate {
  floor?: string;
  block?: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  purpose?: string;
  status?: CheckInStatus;
}

export interface QRCodeGenerate {
  user_id: string;
  building_id: string;
  floor: string;
  block: string;
  laptop_model?: string;
  laptop_asset_number?: string;
}

export interface QRCodeScan {
  qr_code: string;
  scan_type: 'CHECK_IN' | 'CHECK_OUT';
}

// Visitor Types
export type VisitorStatus = 'REGISTERED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'EXPIRED';

export interface VisitorCreate {
  first_name: string;
  last_name: string;
  company?: string | null;
  mobile: string;
  email?: string | null;
  photo_url?: string | null;
  purpose: string; // Required: purpose of visit (not visit_purpose)
  host_employee_id?: string | null;
  host_employee_name?: string | null;
  other_reason?: string | null; // Optional: additional reason if purpose is "Other"
  building_id?: string | null;
  floor?: string | null;
  block?: string | null;
  has_weapons?: boolean | null; // Default: false
  weapon_details?: string | null;
  device_id?: string | null;
}

export interface VisitorResponse extends BaseEntity {
  first_name: string;
  last_name: string;
  company?: string | null;
  mobile: string;
  email?: string | null;
  photo_url?: string | null;
  purpose: string; // Purpose of visit
  host_employee_id?: string | null;
  host_employee_name?: string | null;
  other_reason?: string | null;
  building_id?: string | null;
  floor?: string | null;
  block?: string | null;
  registered_at?: string | null;
  // Note: status, check_in_time, check_out_time are in VisitorLogResponse
}

export interface VisitorUpdate {
  first_name?: string;
  last_name?: string;
  company?: string;
  mobile?: string;
  host_employee_id?: string;
  host_employee_name?: string;
  floor?: string;
  block?: string;
  visit_purpose?: string;
  has_weapons?: boolean;
  weapon_details?: string;
  photo_url?: string;
  status?: VisitorStatus;
}

export interface VisitorSearch {
  query: string;
  limit?: number;
}

export interface VisitorByPhone {
  phone: string;
}

// Error Types
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Query Parameters
export interface UserListParams {
  skip?: number;
  limit?: number;
  building_id?: string;
  programme_id?: string;
  search?: string;
}

export interface UserSearchParams {
  q: string;
  limit?: number;
}

export interface UserCountParams {
  building_id?: string;
  programme?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface CountResponse {
  count: number;
}

// Programme Types
export interface ProgrammeCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface ProgrammeResponse extends BaseEntity {
  name: string;
  description?: string;
  is_active: boolean;
}

export interface ProgrammeUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Utility Types
export type APIEndpoint = string;
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Feature Flags
export interface FeatureFlags {
  USE_AZURE_API: boolean;
  FALLBACK_TO_MOCK: boolean;
  ENABLE_LOGGING: boolean;
}
