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
  last_name?: string;
  email?: string;
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

// Booking Types
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface BookingCreate {
  space_id: string;
  booking_date: string; // ISO date string
  start_time: string; // "09:00" format
  end_time: string; // "17:00" format
  guest_emails?: string; // Comma-separated emails
  notify_guests?: boolean;
}

export interface BookingResponse extends BaseEntity {
  user_id: string;
  space_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  guest_emails?: string;
  notify_guests: boolean;
  qr_code_url?: string;
  // Relationships (populated by API)
  user?: UserResponse;
  space?: SpaceResponse;
}

export interface BookingUpdate {
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  guest_emails?: string;
  notify_guests?: boolean;
}

// Check-in Types
export type CheckInStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface CheckInCreate {
  user_id: string;
  building_id: string;
  floor: string;
  block: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  purpose?: string;
}

export interface CheckInResponse extends BaseEntity {
  user_id: string;
  building_id: string;
  floor: string;
  block: string;
  laptop_model?: string;
  laptop_asset_number?: string;
  purpose?: string;
  status: CheckInStatus;
  check_in_time: string;
  check_out_time?: string;
  qr_code?: string;
  // Relationships (populated by API)
  user?: UserResponse;
  building?: BuildingResponse;
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
  company: string;
  mobile: string;
  host_employee_id: string;
  host_employee_name: string;
  floor: string;
  block: string;
  visit_purpose: string;
  has_weapons: boolean;
  weapon_details?: string;
  photo_url?: string;
}

export interface VisitorResponse extends BaseEntity {
  first_name: string;
  last_name: string;
  company: string;
  mobile: string;
  host_employee_id: string;
  host_employee_name: string;
  floor: string;
  block: string;
  visit_purpose: string;
  has_weapons: boolean;
  weapon_details?: string;
  photo_url?: string;
  status: VisitorStatus;
  check_in_time?: string;
  check_out_time?: string;
  // Relationships (populated by API)
  host_employee?: UserResponse;
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

// Utility Types
export type APIEndpoint = string;
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Feature Flags
export interface FeatureFlags {
  USE_AZURE_API: boolean;
  FALLBACK_TO_MOCK: boolean;
  ENABLE_LOGGING: boolean;
}
