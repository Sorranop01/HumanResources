import type { Timestamp } from 'firebase/firestore';

/**
 * Address structure for organization
 */
export type OrganizationAddress = {
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string; // ตำบล/แขวง
  district: string; // อำเภอ/เขต
  province: string; // จังหวัด
  postalCode: string;
  country: string; // Default: 'Thailand'
};

/**
 * Main organization/company settings
 * Single document per tenant
 */
export type Organization = {
  id: string; // Tenant ID
  companyName: string; // ชื่อบริษัท (TH)
  companyNameEn: string; // Company Name (EN)
  registrationNumber: string; // เลขทะเบียนนิติบุคคล
  taxNumber: string; // เลขประจำตัวผู้เสียภาษี

  // Address
  address: OrganizationAddress;

  // Contact
  phone: string;
  email: string;
  website?: string;

  // Branding
  logoUrl?: string;
  primaryColor?: string; // HEX color
  secondaryColor?: string; // HEX color

  // Financial
  currency: string; // Default: 'THB'
  fiscalYearStart: string; // 'MM-DD' format (e.g., '01-01')

  // Settings
  timezone: string; // Default: 'Asia/Bangkok'
  defaultLanguage: 'th' | 'en'; // Default: 'th'

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
};

/**
 * Input type for creating organization
 */
export type CreateOrganizationInput = Omit<
  Organization,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Input type for updating organization
 */
export type UpdateOrganizationInput = Partial<
  Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
>;

/**
 * Firestore document type (before ID mapping)
 */
export type OrganizationDocument = Omit<Organization, 'id'>;
