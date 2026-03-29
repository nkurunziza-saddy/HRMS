import {
	Delete01Icon,
	Edit01Icon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useCreateCompanyDepartmentMutation,
	useCreateDepartmentReferenceMutation,
	useGetCompanyDepartmentsQuery,
	useGetDepartmentReferencesQuery,
} from "@/lib/redux/api/department";
import type { RootState } from "@/lib/redux/store";

export const Route = createFileRoute("/dashboard/departments")({
	component: DepartmentsPage,
});

function DepartmentsPage() {
	const activeCompanyId = useSelector(
		(state: RootState) => state.auth.activeCompanyId,
	);
	const {
		data: departmentsData,
		isLoading,
		isError,
	} = useGetCompanyDepartmentsQuery(
		activeCompanyId ? { companyId: activeCompanyId } : undefined,
		{ skip: !activeCompanyId },
	);
	const { data: referencesData } = useGetDepartmentReferencesQuery(undefined);
	const [createDepartment] = useCreateCompanyDepartmentMutation();
	const [createReference] = useCreateDepartmentReferenceMutation();

	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
	const [newDept, setNewDept] = useState({
		name: "",
		description: "",
		departmentReferenceId: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [referenceName, setReferenceName] = useState("");
	const [isReferenceSubmitting, setIsReferenceSubmitting] = useState(false);

	if (isLoading) return <DashboardPending />;
	if (isError) return <div>Error loading departments.</div>;

	const departments = departmentsData?.items || [];

	const filteredDepts = departments.filter((d) => {
		const search = searchTerm.toLowerCase().trim();
		if (!search) return true;
		
		// Search in all available fields to ensure nothing is hidden
		const name = (d.name || "").toLowerCase();
		const description = (d.description || "").toLowerCase();
		const status = (d.status || "").toLowerCase();
		
		return name.includes(search) || description.includes(search) || status.includes(search);
	});

	const handleAddDepartment = async () => {
		if (!newDept.name || !newDept.departmentReferenceId || !activeCompanyId)
			return;
		setIsSubmitting(true);
		try {
			await createDepartment({
				name: newDept.name.trim(),
				description: newDept.description.trim() || newDept.name.trim(),
				departmentReferenceId: newDept.departmentReferenceId,
				companyId: activeCompanyId,
			}).unwrap();
			setIsDialogOpen(false);
			setNewDept({ name: "", description: "", departmentReferenceId: "" });
			toast.success("Department created successfully");
		} catch (err: any) {
			console.error(err);
			const errorMessage = err?.data?.message || "";
			if (errorMessage.includes("duplicate key") || err?.status === 409) {
				toast.error("This department or reference is already registered for this company.");
			} else {
				toast.error(err?.data?.message || "Failed to create department");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCreateReference = async () => {
		if (!referenceName.trim()) return;
		setIsReferenceSubmitting(true);
		try {
			const created = await createReference({
				name: referenceName.trim(),
			}).unwrap();
			setNewDept((prev) => ({
				...prev,
				departmentReferenceId: created.id,
				name: prev.name || created.name,
			}));
			setReferenceName("");
			setIsReferenceDialogOpen(false);
			toast.success("Department reference created");
		} catch (err) {
			console.error(err);
			toast.error("Failed to create department reference");
		} finally {
			setIsReferenceSubmitting(false);
		}
	};

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden">
			<DashboardHeader
				category="Organization"
				title="Departments"
				description={
					departments.length > 0 
						? `Managing ${departments.length} departments for this organization.`
						: "Create and organize your company divisions."
				}
			>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger
						render={
							<Button />
						}
					>
						<HugeiconsIcon icon={PlusSignCircleIcon} />
						Add Department
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add New Department</DialogTitle>
							<DialogDescription>
								Create a new organizational department within the company.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="reference">Department Reference</Label>
								<Select
									value={newDept.departmentReferenceId}
									onValueChange={(value) =>
										setNewDept({
											...newDept,
											departmentReferenceId: value || "",
										})
									}
								>
									<SelectTrigger id="reference">
										<SelectValue>
											{newDept.departmentReferenceId
												? referencesData?.items.find(
														(r) => r.id === newDept.departmentReferenceId,
													)?.name || "Select a global department"
												: "Select a global department"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{referencesData?.items.length ? (
											referencesData.items.map((ref) => (
												<SelectItem key={ref.id} value={ref.id}>
													{ref.name}
												</SelectItem>
											))
										) : (
											<SelectItem value="no-references" disabled>
												No references yet
											</SelectItem>
										)}
										<SelectSeparator />
										<SelectItem value="create-reference" disabled>
											Need a new reference? Use the button below.
										</SelectItem>
									</SelectContent>
								</Select>
								<div className="flex items-center justify-between">
									<p className="text-xs text-muted-foreground">
										Missing a department reference?
									</p>
									<AlertDialog
										open={isReferenceDialogOpen}
										onOpenChange={setIsReferenceDialogOpen}
									>
										<AlertDialogTrigger
											render={
												<Button variant="ghost" size="sm" className="px-2" />
											}
										>
											Create new
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>
													Create Department Reference
												</AlertDialogTitle>
												<AlertDialogDescription>
													Add a global reference so this department can be
													reused across the company.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<div className="py-2 space-y-2">
												<Label htmlFor="reference-name">Reference Name</Label>
												<Input
													id="reference-name"
													value={referenceName}
													onChange={(e) => setReferenceName(e.target.value)}
													placeholder="e.g. Engineering"
												/>
											</div>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleCreateReference}
													disabled={
														isReferenceSubmitting || !referenceName.trim()
													}
												>
													{isReferenceSubmitting ? "Creating..." : "Create"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="name">Display Name</Label>
								<Input
									id="name"
									placeholder="e.g. Marketing & Communications"
									value={newDept.name}
									onChange={(e) =>
										setNewDept({ ...newDept, name: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description (Optional)</Label>
								<textarea
									id="description"
									className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Brief description of the department's function..."
									value={newDept.description}
									onChange={(e) =>
										setNewDept({ ...newDept, description: e.target.value })
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleAddDepartment}
								disabled={
									isSubmitting ||
									!newDept.name.trim() ||
									!newDept.departmentReferenceId
								}
							>
								{isSubmitting ? "Saving..." : "Create Department"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DashboardHeader>

			<div className="px-4 lg:px-6 py-6 border-b border-border/5 bg-muted/5 flex items-center justify-between">
				<div className="relative w-full max-w-sm">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-3 top-2.5 size-4 text-muted-foreground/40"
						strokeWidth={2}
					/>
					<Input
						placeholder="Search departments..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 h-9 rounded-lg border-border/40 bg-background transition-all text-xs"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/5">
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{filteredDepts.map((dept) => (
						<div
							key={dept.id}
							className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm hover:shadow-md transition-shadow group"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-bold tracking-tight text-foreground/90 mb-1">
										{dept.name}
									</h3>
									<Badge
										variant={dept.status === "active" ? "success" : "muted"}
										className="capitalize"
									>
										{dept.status}
									</Badge>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant="ghost"
												size="icon-sm"
												className="opacity-0 group-hover:opacity-100 transition-opacity"
											/>
										}
									>
										<HugeiconsIcon
											icon={MoreHorizontalIcon}
											className="size-4"
										/>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>
											<HugeiconsIcon
												icon={Edit01Icon}
												className="size-4 mr-2"
											/>
											Edit Details
										</DropdownMenuItem>
										<DropdownMenuItem className="text-destructive">
											<HugeiconsIcon
												icon={Delete01Icon}
												className="size-4 mr-2"
											/>
											Deactivate
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<p className="text-sm font-medium text-muted-foreground/80 leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
								{dept.description}
							</p>

							<div className="flex items-center gap-3 pt-4 border-t border-border/10">
								<div className="flex items-center gap-2 bg-primary/5 px-2.5 py-1.5 rounded-md text-primary font-bold text-xs tracking-widest border border-primary/10">
									<HugeiconsIcon icon={UserMultiple02Icon} size={14} />
									{dept.employeeCount}
									<span className="font-medium text-primary/60 ml-0.5">
										EMPLOYEES
									</span>
								</div>
							</div>
						</div>
					))}

					{filteredDepts.length === 0 && (
						<div className="col-span-full py-12 text-center text-muted-foreground font-medium">
							No departments found matching your search.
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
