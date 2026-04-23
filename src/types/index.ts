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
	| "COVER_LETTER"
	| "NATIONAL_ID"
	| "PASSPORT"
	| "DEGREE"
	| "CERTIFICATE"
	| "OFFER_LETTER"
	| "EMPLOYMENT_CONTRACT"
	| "MEDICAL_CERTIFICATE"
	| "CLEARANCE_LETTER"
	| "EXPERIENCE_LETTER"
	| "TERMINATION_LETTER"
	| "PERFORMANCE_REVIEW"
	| "PROMOTION_LETTER"
	| "OTHER";

export type DocumentPhase =
	| "APPLICATION"
	| "ONBOARDING"
	| "PROBATION"
	| "CONFIRMATION"
	| "TERMINATION"
	| "RESIGNATION"
	| "SHORTLISTING"
	| "INTERVIEW"
	| "OFFER"
	| "OFFBOARDING";

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

export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "PROBATION" | "RESIGNED" | "TERMINATED";

export type ContractTerm = "FIXED" | "OPEN_ENDED";

export interface EmployeeHistoryEntry {
	doneAt: string;
	doneBy: string;
	status: EmployeeStatus;
	comment: string;
	doneByName: string;
}

export interface EmployeeDepartment {
	id: string;
	name: string;
	description: string;
	status: string;
}

export interface EmployeeCompany {
	id: string;
	name: string;
	identificationNumber: number;
	tin: string;
	ownershipType: string;
	type: string;
	status: string;
	branchType: string;
	branchCode: string | null;
}

export interface EmployeePerson {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	firstName: string;
	lastName: string;
	IDNumber: string;
	phoneNumber: string;
	email: string;
	gender: "MALE" | "FEMALE";
}

export interface EmployeeJobPost {
	id: string;
	title: string;
	aboutRole: string;
	mission: string;
	location: string;
	status: string;
	workMode: string;
	applicationDeadline: string;
}

export interface Employee {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	status: EmployeeStatus;
	startDate: string;
	endDate: string | null;
	contractTerm: ContractTerm;
	history: EmployeeHistoryEntry[] | null;
	firstName: string;
	lastName: string;
	IDNumber: string;
	phoneNumber: string;
	email: string;
	gender: "MALE" | "FEMALE";
	jobTitle?: string;
	departmentName?: string;
	// Detail-only fields
	person?: EmployeePerson;
	department?: EmployeeDepartment;
	company?: EmployeeCompany;
	jobPost?: EmployeeJobPost;
}

export interface EmployeeDocument {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	type: DocumentType;
	phase: DocumentPhase;
	url: string;
	isActive: boolean;
	isVerified: boolean;
	verifiedAt: string | null;
	expiresAt: string | null;
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
	contractTerm?: "FIXED" | "OPEN_ENDED";
}

export interface ApplicantHistory {
	doneAt: string;
	status: ApplicantStatus;
	comment: string;
	doneById: string;
	doneByName: string;
}

export interface Applicant {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	IDNumber: string;
	gender: "MALE" | "FEMALE";
	referenceCode: string;
	status: ApplicantStatus;
	score?: number;
	image?: string;
	jobPostId?: string;
	jobPost?: string; // Title from backend
	companyName?: string;
	createdAt: string;
	updatedAt: string;
	history: ApplicantHistory[];
	applicationDocuments?: EmployeeDocument[];
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
