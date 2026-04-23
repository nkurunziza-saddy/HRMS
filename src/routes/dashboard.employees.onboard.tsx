import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	CheckmarkCircle01Icon,
	FileUploadIcon,
	HierarchyIcon,
	ShieldIcon,
	UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
	Frame,
	FrameContent,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetCompanyDepartmentsQuery } from "@/lib/redux/api/department";
import { useOnboardEmployeeMutation } from "@/lib/redux/api/employee";
import { useGetJobTitlesQuery } from "@/lib/redux/api/job-title";
import { useAppSelector } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

type OnboardSearch = {
	applicantId?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
};

export const Route = createFileRoute("/dashboard/employees/onboard")({
	validateSearch: (search: Record<string, unknown>): OnboardSearch => {
		return {
			applicantId: search.applicantId as string,
			firstName: search.firstName as string,
			lastName: search.lastName as string,
			email: search.email as string,
			phone: search.phone as string,
		};
	},
	component: OnboardEmployeePage,
});

function OnboardEmployeePage() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const { activeCompanyId } = useAppSelector((state) => state.auth);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeDocKey, setActiveDocKey] = useState<string | null>(null);

	const { data: departmentsData, isLoading: isLoadingDepts } =
		useGetCompanyDepartmentsQuery(
			activeCompanyId ? { companyId: activeCompanyId } : undefined,
			{ skip: !activeCompanyId },
		);
	const [onboardEmployee] = useOnboardEmployeeMutation();

	const [step, setStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

	const [formData, setFormData] = useState({
		firstName: search.firstName || "",
		lastName: search.lastName || "",
		documentNumber: "",
		phoneNumber: search.phone || "",
		email: search.email || "",
		gender: "MALE",
		departmentId: "",
		jobTitleId: "",
		contractType: "FIXED" as "FIXED" | "OPEN_ENDED",
		startDate: new Date().toISOString().split("T")[0],
		endDate: "",
		// files
		cv: null as File | null,
		nationalId: null as File | null,
		passport: null as File | null,
		degree: null as File | null,
		certificate: null as File | null,
		medicalCertificate: null as File | null,
		employmentContract: null as File | null,
		other: null as File | null,
	});

	const { data: jobTitlesData, isLoading: isLoadingTitles } =
		useGetJobTitlesQuery(
			formData.departmentId
				? { departmentId: formData.departmentId }
				: undefined,
			{ skip: !formData.departmentId },
		);

	const departments = departmentsData?.items || [];
	const jobTitles = jobTitlesData?.items || [];

	const CV_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
	const CV_EXTS = [".pdf", ".doc", ".docx"];
	const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
	const DOC_EXTS = [".pdf", ".jpg", ".jpeg", ".png"];

	const handleFileClick = (key: string) => {
		setActiveDocKey(key);
		if (fileInputRef.current) {
			fileInputRef.current.accept = key === "cv" ? ".pdf,.doc,.docx" : ".pdf,.jpg,.jpeg,.png";
		}
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && activeDocKey) {
			const ext = "." + file.name.split(".").pop()?.toLowerCase();
			const isCv = activeDocKey === "cv";
			const allowed = isCv
				? CV_TYPES.includes(file.type) || CV_EXTS.includes(ext)
				: DOC_TYPES.includes(file.type) || DOC_EXTS.includes(ext);
			if (!allowed) {
				setFileErrors((prev) => ({
					...prev,
					[activeDocKey]: isCv
						? "Only PDF, DOC, or DOCX files are allowed"
						: "Only JPG, PNG, or PDF files are allowed",
				}));
				e.target.value = "";
				return;
			}
			setFileErrors((prev) => { const next = { ...prev }; delete next[activeDocKey]; return next; });
			setFormData((prev) => ({ ...prev, [activeDocKey]: file }));
		}
		e.target.value = "";
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		const data = new FormData();
		data.append("firstName", formData.firstName);
		data.append("lastName", formData.lastName);
		data.append("email", formData.email);
		data.append("phoneNumber", formData.phoneNumber);
		data.append("documentNumber", formData.documentNumber);
		data.append("gender", formData.gender);
		data.append("departmentId", formData.departmentId);
		data.append("jobTitleId", formData.jobTitleId);
		data.append("contractTerm", formData.contractType);
		if (search.applicantId) data.append("applicantId", search.applicantId);
		if (formData.startDate) data.append("startDate", formData.startDate);
		if (formData.contractType === "FIXED" && formData.endDate) data.append("endDate", formData.endDate);

		// Append files
		const fileKeys = ["cv", "nationalId", "passport", "degree", "certificate", "medicalCertificate", "employmentContract", "other"];
		fileKeys.forEach(key => {
			const file = (formData as any)[key];
			if (file instanceof File) {
				data.append(key, file);
			}
		});

		try {
			await onboardEmployee(data).unwrap();
			setIsSuccess(true);
			toast.success("Employee onboarded successfully");
		} catch (err: any) {
			console.error(err);
			toast.error(err?.data?.message || "Failed to complete onboarding");
		} finally {
			setIsSubmitting(false);
		}
	};

	const StepIndicator = () => (
		<div className="flex items-center gap-3 mb-10">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex-1 flex items-center gap-2">
					<div
						className={cn(
							"h-1.5 flex-1 rounded-full transition-all duration-500",
							step === i
								? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
								: step > i
									? "bg-primary/40"
									: "bg-border/40",
						)}
					/>
				</div>
			))}
		</div>
	);


	if (isSuccess) {
		return (
			<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full">
				<DashboardHeader
					category="Lifecycle"
					title="Onboarding Complete"
					description="Transmitted record to the primary directory."
				/>
				<div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-8 pb-20 pt-2 text-start">
					<Frame className="max-w-md w-full">
						<FramePanel className="bg-card">
							<FrameContent className="p-10">
								<div className="h-20 w-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 animate-in zoom-in duration-500">
									<HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} />
								</div>
								<h2 className="text-2xl font-bold tracking-tight mb-3 text-start">
									System Inducted
								</h2>
								<p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed text-start">
									<span className="text-foreground font-semibold">
										{formData.firstName} {formData.lastName}
									</span>{" "}
									has been successfully registered. Their profile is now active
									under a probationary period.
								</p>
								<Button
									onClick={() => navigate({ to: "/dashboard/employees" })}
								>
									View Directory
								</Button>
							</FrameContent>
						</FramePanel>
					</Frame>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full">
			<DashboardHeader
				category="Lifecycle"
				title="Employee Onboarding"
				description="Formalize the induction of a new hire into the organization."
			>
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/dashboard/employees" })}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
					Abort
				</Button>
			</DashboardHeader>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept=".pdf,.doc,.docx"
				onChange={handleFileChange}
			/>

			<div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-8 pb-20 pt-2">
				<div className="max-w-3xl w-full">
					<StepIndicator />

					<Frame>
						<FramePanel className="bg-card">
							<FrameHeader>
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
										<HugeiconsIcon
											icon={
												step === 1
													? UserEdit01Icon
													: step === 2
														? HierarchyIcon
														: ShieldIcon
											}
											size={18}
										/>
									</div>{" "}
									<div>
										<FrameTitle>
											{step === 1
												? "Personal Identification"
												: step === 2
													? "Organizational Placement"
													: "Compliance & Documents"}
										</FrameTitle>
										<FrameDescription>Step {step} of 3</FrameDescription>
									</div>
								</div>
							</FrameHeader>

							<FrameContent className="p-8">
								{step === 1 && (
									<div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label
													htmlFor="firstName"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													First Name
												</Label>
												<Input
													id="firstName"
													placeholder="e.g. Jean Paul"
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.firstName}
													onChange={(e) =>
														setFormData({
															...formData,
															firstName: e.target.value,
														})
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="lastName"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Last Name
												</Label>
												<Input
													id="lastName"
													placeholder="e.g. Nkurunziza"
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.lastName}
													onChange={(e) =>
														setFormData({
															...formData,
															lastName: e.target.value,
														})
													}
												/>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label
													htmlFor="documentNumber"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													National ID / Passport
												</Label>
												<Input
													id="documentNumber"
													placeholder="e.g. 11985..."
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.documentNumber}
													onChange={(e) =>
														setFormData({ ...formData, documentNumber: e.target.value })
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="gender"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Gender
												</Label>
												<Select
													value={formData.gender}
													onValueChange={(val) =>
														setFormData({ ...formData, gender: val || "MALE" })
													}
												>
													<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background">
														<SelectValue placeholder="Select Gender" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="MALE">Male</SelectItem>
														<SelectItem value="FEMALE">Female</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label
													htmlFor="email"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Email Address
												</Label>
												<Input
													id="email"
													type="email"
													placeholder="email@example.com"
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="phone"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Phone Number
												</Label>
												<Input
													id="phone"
													placeholder="250..."
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.phoneNumber}
													onChange={(e) =>
														setFormData({ ...formData, phoneNumber: e.target.value })
													}
												/>
											</div>
										</div>
									</div>
								)}

								{step === 2 && (
									<div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label
													htmlFor="department"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Department
												</Label>
												<Select
													value={formData.departmentId}
													onValueChange={(val) =>
														setFormData({ ...formData, departmentId: val || "", jobTitleId: "" })
													}
												>
													<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background">
														<SelectValue placeholder="Select Department">
																{formData.departmentId
																	? departments.find((d: any) => d.id === formData.departmentId)?.name
																	: undefined}
															</SelectValue>
													</SelectTrigger>
													<SelectContent>
														{isLoadingDepts ? (
															<SelectItem value="loading" disabled>
																Loading departments...
															</SelectItem>
														) : departments.length > 0 ? (
															departments.map((d: any) => (
																<SelectItem key={d.id} value={d.id} label={d.name}>
																	{d.name}
																</SelectItem>
															))
														) : (
															<SelectItem value="none" disabled>
																No departments found
															</SelectItem>
														)}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="position"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Job Title
												</Label>
												<Select
													value={formData.jobTitleId}
													onValueChange={(val) =>
														setFormData({ ...formData, jobTitleId: val || "" })
													}
												>
													<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background">
														<SelectValue placeholder="Select Position">
															{formData.jobTitleId
																? jobTitles.find((j: any) => j.id === formData.jobTitleId)?.name
																: undefined}
														</SelectValue>
													</SelectTrigger>
													<SelectContent>
														{isLoadingTitles ? (
															<SelectItem value="loading" disabled>
																Loading positions...
															</SelectItem>
														) : jobTitles.length > 0 ? (
															jobTitles.map((j: any) => (
																<SelectItem key={j.id} value={j.id}>
																	{j.name}
																</SelectItem>
															))
														) : (
															<SelectItem value="none" disabled>
																No positions found
															</SelectItem>
														)}
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor="contractType"
												className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
											>
												Contract Type
											</Label>
											<Select
												value={formData.contractType}
												onValueChange={(val) =>
													setFormData({ ...formData, contractType: val as "FIXED" | "OPEN_ENDED" })
												}
											>
												<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background">
													<SelectValue placeholder="Select Contract Type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="FIXED">Fixed Term</SelectItem>
													<SelectItem value="OPEN_ENDED">Open Ended</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className={cn("grid gap-6", formData.contractType === "FIXED" ? "grid-cols-2" : "grid-cols-1")}>
											<div className="space-y-2">
												<Label
													htmlFor="startDate"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Effective Start Date
												</Label>
												<Input
													id="startDate"
													type="date"
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors font-semibold"
													value={formData.startDate}
													onChange={(e) =>
														setFormData({
															...formData,
															startDate: e.target.value,
														})
													}
												/>
											</div>
											{formData.contractType === "FIXED" && (
												<div className="space-y-2">
													<Label
														htmlFor="endDate"
														className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
													>
														End Date
													</Label>
													<Input
														id="endDate"
														type="date"
														className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors font-semibold"
														value={formData.endDate}
														onChange={(e) =>
															setFormData({
																...formData,
																endDate: e.target.value,
															})
														}
													/>
												</div>
											)}
										</div>
									</div>
								)}

								{step === 3 && (
									<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
										{[
											{ key: "cv", label: "Curriculum Vitae (CV)" },
											{ key: "nationalId", label: "National ID Scan" },
											{ key: "passport", label: "Passport Scan" },
											{ key: "degree", label: "Academic Degree" },
											{ key: "certificate", label: "Professional Certificate" },
											{ key: "medicalCertificate", label: "Medical Certificate" },
											{ key: "employmentContract", label: "Signed Employment Contract" },
											{ key: "other", label: "Other Relevant Document" },
										].map((doc) => (
											<div key={doc.key} className="space-y-1">
												<div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors">
												<div className="flex items-center gap-4">
													<div
														className={cn(
															"h-10 w-10 flex items-center justify-center rounded-lg border transition-all",
															(formData as any)[doc.key]
																? "bg-primary/10 text-primary border-primary/20"
																: "bg-background text-muted-foreground/40 border-border/40",
														)}
													>
														{(formData as any)[doc.key] ? (
															<HugeiconsIcon
																icon={CheckmarkCircle01Icon}
																size={20}
															/>
														) : (
															<HugeiconsIcon icon={FileUploadIcon} size={20} />
														)}
													</div>
													<div className="min-w-0 flex-1">
														<p className="font-bold text-sm text-foreground/90 truncate">
															{doc.label}
														</p>
														<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
															{(formData as any)[doc.key]
																? (formData as any)[doc.key].name
																: doc.key === "cv" ? "PDF, DOC, DOCX · Optional" : "JPG, PNG, PDF · Optional"}
														</p>
													</div>
												</div>
												{(formData as any)[doc.key] ? (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleFileClick(doc.key)}
														className="font-bold h-8 text-xs shrink-0 text-primary hover:bg-primary/5"
													>
														Replace
													</Button>
												) : (
													<Button
														size="sm"
														onClick={() => handleFileClick(doc.key)}
														className="font-bold h-8 text-xs shrink-0"
													>
														Upload
													</Button>
												)}
												</div>
												{fileErrors[doc.key] && (
													<p className="text-xs text-destructive font-semibold px-1">
														{fileErrors[doc.key]}
													</p>
												)}
											</div>
										))}
									</div>
								)}
							</FrameContent>

							<FrameFooter className="p-6 bg-muted/5 flex items-center justify-between">
								<Button
									variant="ghost"
									disabled={step === 1}
									onClick={() => setStep((s) => Math.max(1, s - 1))}
								>
									Previous
								</Button>
								{step < 3 ? (
									<Button
										onClick={() => setStep((s) => Math.min(3, s + 1))}
										disabled={
											(step === 1 &&
												(!formData.firstName ||
													!formData.lastName ||
													!formData.email ||
													!formData.documentNumber)) ||
											(step === 2 &&
												(!formData.departmentId || !formData.jobTitleId))
										}
									>
										Next Stage
										<HugeiconsIcon icon={ArrowRight01Icon} size={14} />
									</Button>
								) : (
									<Button onClick={handleSubmit} disabled={isSubmitting}>
										{isSubmitting ? "Inducting..." : "Finalize Onboarding"}
										<HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
									</Button>
								)}
							</FrameFooter>
						</FramePanel>
					</Frame>
				</div>
			</div>
		</main>
	);
}
