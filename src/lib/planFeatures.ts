export interface PlanFeatures {
  maxUploadsPerMonth: number | null; // null = unlimited
  maxStudentsPerUpload: number | null; // null = unlimited
  maxFileSizeMb: number;
  includesPdfReport: boolean;
  includesExcelReport: boolean;
  includesAdvancedAnalytics: boolean;
  includesSchoolBranding: boolean;
  includesPrioritySupport: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_kes: number;
  duration_months: number;
  max_uploads_per_month: number | null;
  max_students_per_upload: number | null;
  max_file_size_mb: number;
  includes_pdf_report: boolean;
  includes_excel_report: boolean;
  includes_advanced_analytics: boolean;
  includes_school_branding: boolean;
  includes_priority_support: boolean;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function getPlanFeatures(plan: Plan): PlanFeatures {
  return {
    maxUploadsPerMonth: plan.max_uploads_per_month,
    maxStudentsPerUpload: plan.max_students_per_upload,
    maxFileSizeMb: plan.max_file_size_mb,
    includesPdfReport: plan.includes_pdf_report,
    includesExcelReport: plan.includes_excel_report,
    includesAdvancedAnalytics: plan.includes_advanced_analytics,
    includesSchoolBranding: plan.includes_school_branding,
    includesPrioritySupport: plan.includes_priority_support,
  };
}

export function getFeatureBullets(plan: Plan): string[] {
  const bullets: string[] = [];

  if (plan.max_uploads_per_month === null) {
    bullets.push('Unlimited uploads per month');
  } else {
    bullets.push(`${plan.max_uploads_per_month} uploads per month`);
  }

  if (plan.max_students_per_upload === null) {
    bullets.push('Unlimited students per upload');
  } else {
    bullets.push(`Up to ${plan.max_students_per_upload} students per upload`);
  }

  bullets.push(`Max file size: ${plan.max_file_size_mb}MB`);

  if (plan.includes_excel_report) {
    bullets.push('Excel report download');
  }

  if (plan.includes_pdf_report) {
    bullets.push('PDF report download');
  }

  if (plan.includes_advanced_analytics) {
    bullets.push('Advanced analytics & charts');
  }

  if (plan.includes_school_branding) {
    bullets.push('School branding on reports');
  }

  if (plan.includes_priority_support) {
    bullets.push('Priority support');
  }

  return bullets;
}

export function checkUploadLimit(
  currentUploads: number,
  plan: Plan
): { allowed: boolean; message: string } {
  if (plan.max_uploads_per_month === null) {
    return { allowed: true, message: '' };
  }

  if (currentUploads >= plan.max_uploads_per_month) {
    return {
      allowed: false,
      message: `You have reached your monthly upload limit of ${plan.max_uploads_per_month}. Upgrade your plan for more uploads.`,
    };
  }

  return { allowed: true, message: '' };
}

export function checkStudentLimit(
  studentCount: number,
  plan: Plan
): { allowed: boolean; message: string } {
  if (plan.max_students_per_upload === null) {
    return { allowed: true, message: '' };
  }

  if (studentCount > plan.max_students_per_upload) {
    return {
      allowed: false,
      message: `Your file contains ${studentCount} students, but your plan allows a maximum of ${plan.max_students_per_upload}. Please upgrade or split your file.`,
    };
  }

  return { allowed: true, message: '' };
}

export function checkFileSize(
  fileSizeBytes: number,
  plan: Plan
): { allowed: boolean; message: string } {
  const fileSizeMb = fileSizeBytes / (1024 * 1024);

  if (fileSizeMb > plan.max_file_size_mb) {
    return {
      allowed: false,
      message: `Your file is ${fileSizeMb.toFixed(1)}MB, but your plan allows a maximum of ${plan.max_file_size_mb}MB. Please upgrade or compress your file.`,
    };
  }

  return { allowed: true, message: '' };
}

// Default free plan for unauthenticated users
export const DEFAULT_FREE_PLAN: Plan = {
  id: 'p1',
  name: 'Free',
  description: 'Perfect for individual teachers getting started with automated grading',
  price_kes: 0,
  duration_months: 12,
  max_uploads_per_month: 5,
  max_students_per_upload: 50,
  max_file_size_mb: 5,
  includes_pdf_report: false,
  includes_excel_report: true,
  includes_advanced_analytics: false,
  includes_school_branding: false,
  includes_priority_support: false,
  is_active: true,
  is_default: true,
  sort_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
