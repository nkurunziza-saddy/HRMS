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
import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
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

	const { data: departmentsData, isLoading: isLoadingDepts } =
		useGetCompanyDepartmentsQuery(
			activeCompanyId ? { companyId: activeCompanyId } : undefined,
		);
	const { data: jobTitlesData, isLoading: isLoadingTitles } =
		useGetJobTitlesQuery(undefined);
	const [onboardEmployee] = useOnboardEmployeeMutation();

	const [step, setStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const [formData, setFormData] = useState({
		firstName: search.firstName || "",
		lastName: search.lastName || "",
		idNumber: "",
		phone: search.phone || "",
		email: search.email || "",
		departmentId: "",
		jobTitleId: "",
		manager: "",
		hireDate: new Date().toISOString().split("T")[0],
		// files status
		cv: false,
		idCopy: false,
		contract: false,
		criminalRecord: false,
		medicalReport: false,
	});

	const departments = departmentsData?.items || [];
	const jobTitles = jobTitlesData?.items || [];

	const handleSubmit = async () => {
		if (!activeCompanyId) {
			toast.error("No active company selected");
			return;
		}

		setIsSubmitting(true);
		try {
			await onboardEmployee({
				firstName: formData.firstName,
				lastName: formData.lastName,
				idNumber: formData.idNumber,
				email: formData.email,
				phone: formData.phone,
				departmentId: formData.departmentId,
				jobTitleId: formData.jobTitleId,
				manager: formData.manager,
				hireDate: formData.hireDate,
				companyId: activeCompanyId,
				status: "probation" as any,
				complianceStatus: "compliant" as any,
				onboardingProgress: 100,
			}).unwrap();
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

	if (isLoadingDepts || isLoadingTitles) return <DashboardPending />;

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
					<HugeiconsIcon icon={ArrowLeft01Icon} />
					Abort
				</Button>
			</DashboardHeader>

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
										<div className="space-y-2">
											<Label
												htmlFor="idNumber"
												className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
											>
												National ID / Passport
											</Label>
											<Input
												id="idNumber"
												placeholder="e.g. 11985..."
												className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
												value={formData.idNumber}
												onChange={(e) =>
													setFormData({ ...formData, idNumber: e.target.value })
												}
											/>
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
													placeholder="+250..."
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.phone}
													onChange={(e) =>
														setFormData({ ...formData, phone: e.target.value })
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
														setFormData({ ...formData, departmentId: val || "" })
													}
												>
													<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background">
														<SelectValue placeholder="Select Department" />
													</SelectTrigger>
													<SelectContent>
														{departments.map((d: any) => (
															<SelectItem key={d.id} value={d.id}>
																{d.name}
															</SelectItem>
														))}
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
														<SelectValue placeholder="Select Position" />
													</SelectTrigger>
													<SelectContent>
														{jobTitles
															.filter(
																(j: any) =>
																	!formData.departmentId ||
																	j.departmentId === formData.departmentId,
															)
															.map((j: any) => (
																<SelectItem key={j.id} value={j.id}>
																	{j.name || j.title}
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label
													htmlFor="manager"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Direct Manager
												</Label>
												<Input
													id="manager"
													placeholder="Manager Name"
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.manager}
													onChange={(e) =>
														setFormData({
															...formData,
															manager: e.target.value,
														})
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor="hireDate"
													className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
												>
													Effective Start Date
												</Label>
												<Input
													id="hireDate"
													type="date"
													className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors"
													value={formData.hireDate}
													onChange={(e) =>
														setFormData({
															...formData,
															hireDate: e.target.value,
														})
													}
												/>
											</div>
										</div>
									</div>
								)}

								{step === 3 && (
									<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
										{[
											{ key: "cv", label: "Curriculum Vitae (CV)" },
											{ key: "idCopy", label: "Identity Document (ID)" },
											{ key: "contract", label: "Signed Employment Contract" },
											{
												key: "criminalRecord",
												label: "Criminal Record Certificate",
											},
											{ key: "medicalReport", label: "Medical Fitness Report" },
										].map((doc) => (
											<div
												key={doc.key}
												className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors"
											>
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
													<div>
														<p className="font-bold text-sm text-foreground/90">
															{doc.label}
														</p>
														<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
															Compliance Required
														</p>
													</div>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setFormData({
															...formData,
															[doc.key]: !(formData as any)[doc.key],
														})
													}
													className={cn(
														"font-bold h-8 text-xs",
														(formData as any)[doc.key]
															? "text-primary hover:bg-primary/5"
															: "text-muted-foreground hover:bg-muted/10",
													)}
												>
													{(formData as any)[doc.key]
														? "Document Ready"
														: "Upload"}
												</Button>
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
													!formData.email)) ||
											(step === 2 &&
												(!formData.departmentId || !formData.jobTitleId))
										}
									>
										Next Stage
										<HugeiconsIcon icon={ArrowRight01Icon} />
									</Button>
								) : (
									<Button onClick={handleSubmit} disabled={isSubmitting}>
										{isSubmitting ? "Inducting..." : "Finalize Onboarding"}
										<HugeiconsIcon icon={CheckmarkCircle01Icon} />
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
