export type Role = "ADMIN" | "COMPANY_ADMIN" | "EMPLOYEE";

export type Status =
	| "active"
	| "inactive"
	| "pending"
	| "suspended"
	| "paid"
	| "processing"
	| "delayed"
	| "published"
	| "draft"
	| "on-hold"
	| "approved"
	| "rejected"
	| "compliant"
	| "non-compliant";

export type RecruitmentStage =
	| "New Applied"
	| "Screening"
	| "Online Assessment"
	| "First Interview"
	| "Second and Final Interview"
	| "Final Interview"
	| "Offer Sent"
	| "Recruited"
	| "Rejected"
	| "Reserved"
	| "Shortlisted";

export type DocumentType =
	| "CV"
	| "ID"
	| "CONTRACT"
	| "CRIMINAL_CERTIFICATE"
	| "MEDICAL_REPORT"
	| "RESIGNATION_LETTER"
	| "EXPERIENCE_LETTER"
	| "CLEARENCE_LETTER"
	| "POLICY_MANUAL"
	| "TEMPLATE";

export interface Company {
	id: string;
	name: string;
	tin: string;
	identificationNumber: number;
	categoryId: string;
	ownershipType: "PRIVATE" | "PUBLIC" | "GOVERNMENT_OWNED";
	type: "LIMITED_BY_SHARES" | "PARTNERSHIP" | "SOLE_TRADER";
	logoUrl?: string;
	phone?: string;
	email?: string;
	status: "active" | "suspended" | "inactive";
	registeredAt: string;
	employeeCount: number;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
	companyId?: string;
	image?: string;
	status: "online" | "away" | "offline";
}

export interface AuthUser {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	email: string;
	role: Role;
	status: string;
	profilePicture: string | null;
	isPhonenNumberVerified: boolean;
	isEmailVerified: boolean;
	lastLoginAt: string | null;
	passwordResetAt: string | null;
	passwordResetExpires: string | null;
	company: Company | null;
}

export interface LoginResponse {
	accessToken: string;
	user: AuthUser;
}

export interface ApiPaginatedResponse<T> {
	meta: {
		itemCount: number;
		totalItems: number;
		itemsPerPage: number;
		totalPages: number;
		currentPage: number;
	};
	items: T[];
}

export interface PayrollDetails {
	baseSalary: number;
	currency: string;
	bankName: string;
	accountName: string;
	accountNumber: string;
	taxId: string;
}

export interface Employee {
	id: string;
	name: string;
	firstName: string;
	lastName: string;
	idNumber: string;
	email: string;
	department: string;
	position: string;
	status:
		| "active"
		| "inactive"
		| "pending"
		| "probation"
		| "resigned"
		| "terminated";
	hireDate: string;
	image?: string;
	phone?: string;
	manager?: string;
	dob?: string;
	address?: string;
	city?: string;
	country?: string;
	zipCode?: string;
	complianceStatus: "compliant" | "non-compliant";
	onboardingProgress: number;
	payroll?: PayrollDetails;
}

export interface EmployeeDocument {
	id: string;
	employeeId: string;
	employeeName: string;
	type: DocumentType;
	fileName: string;
	fileSize: string;
	uploadedAt: string;
	status: "active" | "replaced";
}

export interface SystemLog {
	id: string;
	timestamp: string;
	level: "info" | "warning" | "error" | "security";
	event: string;
	actor: string;
	companyId?: string;
	ipAddress: string;
}

export interface DepartmentReference {
	id: string;
	name: string;
}

export interface CreateDepartmentReferenceRequest {
	name: string;
}

export interface Department {
	id: string;
	name: string;
	description: string;
	departmentReferenceId?: string;
	companyId?: string;
	status: "active" | "inactive";
	employeeCount: number;
}

export interface CreateCompanyDepartmentRequest {
	name: string;
	description?: string;
	departmentReferenceId: string;
	companyId: string;
}
export interface JobTitle {
	id: string;
	name: string;
	title?: string;
	description?: string;
	departmentId: string;
	companyId?: string;
	status: "active" | "inactive";
	employeeCount: number;
}

export interface CreateJobTitleRequest {
	name: string;
	description: string;
	departmentId: string;
	companyId: string;
}

export interface UpdateJobTitleRequest {
	id: string;
	name?: string;
	description?: string;
	departmentId?: string;
}

export type JobPostingStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type WorkMode = "HYBRID" | "REMOTE" | "ONSITE";
export type SkillCategory = "TECHNICAL" | "SOFT" | "OTHER";
export type SectionType =
	| "KEY_RESPONSIBILITIES"
	| "REQUIREMENTS"
	| "BENEFITS"
	| "ABOUT_COMPANY";

export interface JobPostingHistoryEntry {
	doneAt: string;
	doneBy: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	};
	status: JobPostingStatus;
	doneByName: string;
}

export interface JobPostingSectionItem {
	content: string;
	order: number;
}

export interface JobPostingSection {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	type: SectionType;
	title: string;
	order?: number;
	items?: JobPostingSectionItem[];
}

export interface JobPostingSkill {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	name: string;
	category: SkillCategory;
	isRequired: boolean;
}

export interface JobPosting {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	title: string;
	aboutRole: string;
	mission: string;
	location: string;
	status: JobPostingStatus;
	workMode: WorkMode;
	applicationDeadline: string;
	history: JobPostingHistoryEntry[] | null;
	sections: JobPostingSection[];
	skills: JobPostingSkill[];
}

export interface CreateJobPostingRequest {
	title: string;
	jobTitleId: string;
	aboutRole: string;
	mission: string;
	location: string;
	workMode: WorkMode;
	applicationDeadline: string;
	sections: JobPostingSection[];
	skills: JobPostingSkill[];
}

export interface CreateApplicantRequest {
	jobPostId: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	documentNumber: string;
	gender: "MALE" | "FEMALE";
}

export interface PolicyCompliance {
	onboarding: {
		compliant: number;
		nonCompliant: number;
		total: number;
		nonCompliantEmployees: { id: string; name: string; missingDoc: string }[];
	};
	offboarding: {
		compliant: number;
		nonCompliant: number;
		total: number;
		nonCompliantEmployees: { id: string; name: string; missingDoc: string }[];
	};
}

export interface ApplicantPipelineStage {
	stage: RecruitmentStage;
	count: number;
}

export type ApplicantStatus =
	| "APPLIED"
	| "INTERVIEWED"
	| "INTERVIEW_SCHEDULED"
	| "OFFERED"
	| "REJECTED";

export interface ChangeApplicantStatusRequest {
	status: ApplicantStatus;
	comment?: string;
}

export interface Applicant {
	id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	phoneNumber?: string; // added for consistency with CreateApplicantRequest
	image?: string;
	jobPostId?: string;
	referenceCode: string;
	status: ApplicantStatus;
	score?: number;
	gender?: "MALE" | "FEMALE";
	documentNumber?: string;
	createdAt: string;
	appliedAt?: string;
	history?:
		| {
				status: ApplicantStatus;
				doneBy: string;
				doneAt: string;
				comment: string;
		  }[]
		| null;
}
export interface LeaveRequest {
	id: string;
	employeeId: string;
	employeeName: string;
	image?: string;
	type: "Annual" | "Sick" | "Maternity" | "Paternity" | "Unpaid";
	startDate: string;
	endDate: string;
	days: number;
	reason: string;
	status: "pending" | "approved" | "rejected";
	appliedAt: string;
}

export interface LeaveBalance {
	employeeId: string;
	annual: number;
	sick: number;
	maternity: number;
	used: number;
}

export interface PerformanceGoal {
	id: string;
	perspective: "Financial" | "Customer" | "Internal Process" | "Growth";
	objective: string;
	target: string;
	weight: number;
	rating?: 1 | 2 | 3 | 4;
	feedback?: string;
}

export interface PerformanceReview {
	id: string;
	employeeId: string;
	employeeName: string;
	image?: string;
	quarter: "Q1" | "Q2" | "Q3" | "Q4";
	year: number;
	status: "draft" | "submitted" | "reviewed" | "completed";
	goals: PerformanceGoal[];
	selfRating?: number;
	managerRating?: number;
	overallFeedback?: string;
}

export interface TaxBracket {
	min: number;
	max: number | null;
	rate: number;
}

export interface TaxConfig {
	rraBrackets: TaxBracket[];
	rssbEmployee: number;
	rssbEmployer: number;
	maternityEmployee: number;
	maternityEmployer: number;
	cbhiRate: number;
}

export interface PayrollRun {
	id: string;
	month: string;
	year: number;
	currentStep: 1 | 2 | 3 | 4 | 5 | 6;
	status: "draft" | "processing" | "completed";
	totalGross: number;
	totalDeductions: number;
	totalNet: number;
}

export interface PayrollRecord {
	id: string;
	employee: string;
	image?: string;
	role: string;
	amount: number;
	method: string;
	date: string;
	status: "paid" | "processing" | "delayed";
	account?: string;
	base?: number;
	bonus?: number;
	tax?: number;
	deductions?: number;
	net?: number;
}

export interface JobOpening {
	id: string;
	title: string;
	dept: string;
	type: string;
	location: string;
	description?: string;
	applicants: number;
	status: "published" | "draft" | "on-hold";
	date: string;
}

export interface Activity {
	user: string;
	image?: string;
	action: string;
	target: string;
	time: string;
	status: "online" | "away" | "offline";
}
