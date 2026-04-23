import {
	AlertCircleIcon,
	ArrowLeft01Icon,
	Calendar03Icon,
	CheckmarkCircle01Icon,
	NoteIcon,
	UserRemove01Icon,
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
import { Textarea } from "@/components/ui/textarea";
import {
	useChangeEmployeeStatusMutation,
	useGetEmployeesQuery,
} from "@/lib/redux/api/employee";

export const Route = createFileRoute("/dashboard/employees/resign")({
	pendingComponent: DashboardPending,
	component: ResignEmployeePage,
});

const RESIGNATION_REASONS: { value: string; label: string }[] = [
	{ value: "BETTER_OPPORTUNITY", label: "Better Opportunity" },
	{ value: "CAREER_CHANGE", label: "Career Change" },
	{ value: "PERSONAL_REASONS", label: "Personal Reasons" },
	{ value: "HEALTH_REASONS", label: "Health Reasons" },
	{ value: "RELOCATION", label: "Relocation" },
	{ value: "FAMILY_RESPONSIBILITIES", label: "Family Responsibilities" },
	{ value: "EDUCATION", label: "Education" },
	{ value: "RETIREMENT", label: "Retirement" },
	{ value: "CONTRACT_END", label: "Contract End" },
	{ value: "PERFORMANCE", label: "Performance" },
	{ value: "MISCONDUCT", label: "Misconduct" },
	{ value: "POLICY_VIOLATION", label: "Policy Violation" },
	{ value: "ATTENDANCE_ISSUES", label: "Attendance Issues" },
	{ value: "ROLE_NO_LONGER_REQUIRED", label: "Role No Longer Required" },
	{ value: "MUTUAL_AGREEMENT", label: "Mutual Agreement" },
	{ value: "PROBATION_NOT_CONFIRMED", label: "Probation Not Confirmed" },
	{ value: "DEATH", label: "Death" },
	{ value: "OTHER", label: "Other" },
];

function ResignEmployeePage() {
	const navigate = useNavigate();
	const [isSuccess, setIsSuccess] = useState(false);
	const [resignedName, setResignedName] = useState("");

	const { data: employeesData, isLoading: isLoadingEmployees } =
		useGetEmployeesQuery({ status: "ACTIVE", limit: 100 });
	const [changeEmployeeStatus, { isLoading: isSubmitting }] =
		useChangeEmployeeStatusMutation();

	const [formData, setFormData] = useState({
		employeeId: "",
		endDate: new Date().toISOString().split("T")[0],
		lastWorkingDay: "",
		reason: "",
		comment: "",
	});

	const employees = employeesData?.items || [];
	const selectedEmployee = employees.find((e) => e.id === formData.employeeId);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.employeeId || !formData.reason || !formData.lastWorkingDay) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			await changeEmployeeStatus({
				id: formData.employeeId,
				status: "RESIGNED",
				...(formData.endDate ? { endDate: formData.endDate } : {}),
				lastWorkingDay: formData.lastWorkingDay,
				reason: formData.reason,
				...(formData.comment.trim() ? { comment: formData.comment.trim() } : {}),
			}).unwrap();
			setResignedName(
				`${selectedEmployee?.firstName ?? ""} ${selectedEmployee?.lastName ?? ""}`.trim(),
			);
			setIsSuccess(true);
			toast.success("Resignation processed successfully");
		} catch (err: any) {
			toast.error(err?.data?.message || "Failed to process resignation");
		}
	};

	if (isSuccess) {
		return (
			<main className="flex flex-1 flex-col gap-0 overflow-hidden h-full">
				<DashboardHeader
					category="Lifecycle"
					title="Offboarding Initialized"
					description="The employee record has been transitioned to resigned state."
				/>
				<div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-8 pb-20 pt-2 text-start">
					<Frame className="max-w-md w-full">
						<FramePanel className="bg-card">
							<FrameContent className="p-10">
								<div className="h-20 w-20 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-8 animate-in zoom-in duration-500">
									<HugeiconsIcon icon={CheckmarkCircle01Icon} size={40} />
								</div>
								<h2 className="text-2xl font-bold tracking-tight mb-3">
									Processed Successfully
								</h2>
								<p className="text-sm text-muted-foreground font-medium mb-10 leading-relaxed">
									<span className="text-foreground font-semibold">
										{resignedName}
									</span>{" "}
									is no longer active in the primary directory. Payroll
									processing has been halted.
								</p>
								<Button onClick={() => navigate({ to: "/dashboard/employees" })}>
									Return to Directory
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
				title="Employee Resignation"
				description="Formalize the exit process ensuring full compliance and system accuracy."
			>
				<Button
					variant="outline"
					onClick={() => navigate({ to: "/dashboard/employees" })}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} />
					Cancel
				</Button>
			</DashboardHeader>

			<div className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-8 pb-20 pt-2">
				<div className="max-w-4xl w-full">
					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
							{/* Left Column */}
							<div className="lg:col-span-7 space-y-6">
								<Frame>
									<FramePanel className="bg-card">
										<FrameHeader>
											<div className="flex items-center gap-3">
												<div className="h-8 w-8 rounded-lg bg-muted/5 flex items-center justify-center text-muted-foreground/60 border border-border/40">
													<HugeiconsIcon icon={UserRemove01Icon} size={18} />
												</div>
												<div>
													<FrameTitle>Exit Registration</FrameTitle>
													<FrameDescription>
														Primary offboarding details
													</FrameDescription>
												</div>
											</div>
										</FrameHeader>
										<FrameContent className="p-8 space-y-8">
											{/* Employee select */}
											<div className="space-y-2">
												<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
													Select Employee{" "}
													<span className="text-destructive">*</span>
												</Label>
												<Select
													value={formData.employeeId}
													onValueChange={(val) =>
														setFormData({ ...formData, employeeId: val || "" })
													}
												>
													<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background transition-colors font-semibold">
														<span className="flex flex-1 text-start text-sm">
															{selectedEmployee
																? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
																: isLoadingEmployees
																	? "Loading employees..."
																	: "Select employee..."}
														</span>
													</SelectTrigger>
													<SelectContent>
														{employees.map((emp) => (
															<SelectItem key={emp.id} value={emp.id}>
																<div className="flex flex-col text-left">
																	<span className="font-bold">
																		{emp.firstName} {emp.lastName}
																	</span>
																	<span className="text-[10px] text-muted-foreground uppercase tracking-widest">
																		{emp.jobTitle ?? ""}{emp.departmentName ? ` · ${emp.departmentName}` : ""}
																	</span>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											{/* Dates */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<div className="space-y-2">
													<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
														<HugeiconsIcon icon={Calendar03Icon} size={12} />
														End Date
													</Label>
													<Input
														type="date"
														className="h-11 bg-muted/5 border-border/40 focus:bg-background font-medium"
														value={formData.endDate}
														onChange={(e) =>
															setFormData({ ...formData, endDate: e.target.value })
														}
													/>
												</div>
												<div className="space-y-2">
													<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
														<HugeiconsIcon icon={Calendar03Icon} size={12} />
														Last Working Day{" "}
														<span className="text-destructive">*</span>
													</Label>
													<Input
														type="date"
														className="h-11 bg-muted/5 border-border/40 focus:bg-background font-medium"
														value={formData.lastWorkingDay}
														onChange={(e) =>
															setFormData({
																...formData,
																lastWorkingDay: e.target.value,
															})
														}
													/>
												</div>
											</div>

											{/* Reason */}
											<div className="space-y-2">
												<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
													<HugeiconsIcon icon={NoteIcon} size={12} />
													Reason <span className="text-destructive">*</span>
												</Label>
												<Select
													value={formData.reason}
													onValueChange={(val) =>
														setFormData({ ...formData, reason: val || "" })
													}
												>
													<SelectTrigger className="h-11 bg-muted/5 border-border/40 focus:bg-background font-semibold">
														<SelectValue placeholder="Select a reason..." />
													</SelectTrigger>
													<SelectContent>
														{RESIGNATION_REASONS.map((r) => (
															<SelectItem key={r.value} value={r.value}>
																{r.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											{/* Comment */}
											<div className="space-y-2">
												<Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
													Comment (Optional)
												</Label>
												<Textarea
													placeholder="Provide additional context or handover notes..."
													className="min-h-[120px] rounded-xl border-border/40 bg-muted/5 focus:bg-background font-medium resize-none"
													value={formData.comment}
													onChange={(e) =>
														setFormData({ ...formData, comment: e.target.value })
													}
												/>
											</div>
										</FrameContent>
										<FrameFooter className="p-6 flex items-center justify-end bg-muted/5">
											<Button type="submit" disabled={isSubmitting}>
												{isSubmitting ? "Processing..." : "Submit Resignation"}
												<HugeiconsIcon icon={CheckmarkCircle01Icon} />
											</Button>
										</FrameFooter>
									</FramePanel>
								</Frame>
							</div>

							{/* Right Column: Info */}
							<div className="lg:col-span-5 space-y-6">
								<Frame>
									<FramePanel className="bg-primary/[0.02] border-primary/10">
										<FrameContent className="p-6">
											<div className="flex items-start gap-3">
												<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
													<HugeiconsIcon icon={AlertCircleIcon} size={18} />
												</div>
												<div>
													<p className="text-sm font-bold text-foreground/90">
														Operational Impact
													</p>
													<p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
														Transitioning an employee to "Resigned" state will
														automatically halt active payroll processing and
														disable system access.
													</p>
												</div>
											</div>
										</FrameContent>
									</FramePanel>

									{selectedEmployee && (
										<FramePanel className="bg-card">
											<FrameHeader>
												<FrameTitle className="text-xs uppercase tracking-widest">
													Selected Employee
												</FrameTitle>
											</FrameHeader>
											<FrameContent className="p-5 space-y-2">
												<p className="text-sm font-bold text-foreground/90">
													{selectedEmployee.firstName} {selectedEmployee.lastName}
												</p>
												<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
													{selectedEmployee.jobTitle ?? "—"} · {selectedEmployee.departmentName ?? "—"}
												</p>
												<p className="text-[10px] font-semibold text-muted-foreground/50">
													{selectedEmployee.email}
												</p>
											</FrameContent>
										</FramePanel>
									)}
								</Frame>
							</div>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
}
