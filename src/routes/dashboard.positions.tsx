import {
	Briefcase02Icon,
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
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetCompanyDepartmentsQuery } from "@/lib/redux/api/department";
import {
	useCreateJobTitleMutation,
	useGetJobTitlesQuery,
	useUpdateJobTitleMutation,
} from "@/lib/redux/api/job-title";
import type { RootState } from "@/lib/redux/store";
import type { JobTitle } from "@/types";

export const Route = createFileRoute("/dashboard/positions")({
	component: PositionsPage,
});

function PositionsPage() {
	const activeCompanyId = useSelector(
		(state: RootState) => state.auth.activeCompanyId,
	);

	const {
		data: jobTitlesData,
		isLoading,
		isError,
	} = useGetJobTitlesQuery(undefined);

	const { data: departmentsData } = useGetCompanyDepartmentsQuery(
		{ companyId: activeCompanyId || "" },
		{ skip: !activeCompanyId },
	);

	const [createJobTitle] = useCreateJobTitleMutation();
	const [updateJobTitle] = useUpdateJobTitleMutation();

	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newPosition, setNewPosition] = useState({
		name: "",
		description: "",
		departmentId: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [editingPosition, setEditingPosition] = useState<JobTitle | null>(null);
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
		departmentId: "",
	});
	const [isEditSubmitting, setIsEditSubmitting] = useState(false);

	const openEditDialog = (position: JobTitle) => {
		setEditingPosition(position);
		setEditForm({
			name: position.name,
			description: position.description ?? "",
			departmentId: position.departmentId,
		});
	};

	const handleEditPosition = async () => {
		if (!editingPosition || !editForm.name || !editForm.departmentId) return;
		setIsEditSubmitting(true);
		try {
			await updateJobTitle({
				id: editingPosition.id,
				name: editForm.name.trim(),
				description: editForm.description.trim() || editForm.name.trim(),
				departmentId: editForm.departmentId,
			}).unwrap();
			setEditingPosition(null);
			toast.success("Position updated successfully");
		} catch (err) {
			console.error(err);
			toast.error("Failed to update position");
		} finally {
			setIsEditSubmitting(false);
		}
	};

	if (isLoading) return <DashboardPending />;
	if (isError) return <div>Error loading positions.</div>;

	const positions = jobTitlesData?.items || [];

	const filteredPositions = positions.filter(
		(p) =>
			p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false),
	);

	const handleAddPosition = async () => {
		if (!newPosition.name || !newPosition.departmentId || !activeCompanyId)
			return;
		setIsSubmitting(true);
		try {
			await createJobTitle({
				name: newPosition.name.trim(),
				description: newPosition.description.trim() || newPosition.name.trim(),
				departmentId: newPosition.departmentId,
				companyId: activeCompanyId,
			}).unwrap();
			setIsDialogOpen(false);
			setNewPosition({ name: "", description: "", departmentId: "" });
			toast.success("Position created successfully");
		} catch (err) {
			console.error(err);
			toast.error("Failed to create position");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<main className="flex flex-1 flex-col gap-0 overflow-hidden">
				<DashboardHeader
					category="Organization"
					title="Positions"
					description="Manage job titles and roles within the organization."
				>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger>
							<Button>
								<HugeiconsIcon icon={PlusSignCircleIcon} />
								Add Position
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-106.25">
							<DialogHeader>
								<DialogTitle>Add New Position</DialogTitle>
								<DialogDescription>
									Create a new job title or role within the organization.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="name">Position Name</Label>
									<Input
										id="name"
										placeholder="e.g. Senior Software Engineer"
										value={newPosition.name}
										onChange={(e) =>
											setNewPosition({ ...newPosition, name: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="department">Department</Label>
									<Select
										value={newPosition.departmentId}
										onValueChange={(value) =>
											setNewPosition({
												...newPosition,
												departmentId: value || "",
											})
										}
									>
										<SelectTrigger id="department">
											<SelectValue>
												{newPosition.departmentId
													? departmentsData?.items.find(
															(d) => d.id === newPosition.departmentId,
														)?.name || "Select a department"
													: "Select a department"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{departmentsData?.items.length ? (
												departmentsData.items.map((dept) => (
													<SelectItem key={dept.id} value={dept.id}>
														{dept.name}
													</SelectItem>
												))
											) : (
												<SelectItem value="no-departments" disabled>
													No departments available
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description (Optional)</Label>
									<textarea
										id="description"
										className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
										placeholder="Brief description of the position's responsibilities..."
										value={newPosition.description}
										onChange={(e) =>
											setNewPosition({
												...newPosition,
												description: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									onClick={handleAddPosition}
									disabled={
										isSubmitting ||
										!newPosition.name.trim() ||
										!newPosition.departmentId
									}
								>
									{isSubmitting ? "Saving..." : "Create Position"}
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
							placeholder="Search positions..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9 h-9 rounded-lg border-border/40 bg-background transition-all text-xs"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/5">
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{filteredPositions.map((position) => (
							<div
								key={position.id}
								className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm hover:shadow-md transition-shadow group"
							>
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-lg font-bold tracking-tight text-foreground/90 mb-1">
											{position.name}
										</h3>
										<Badge
											variant={
												position.status === "active" ? "success" : "muted"
											}
											className="capitalize"
										>
											{position.status}
										</Badge>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger>
											<Button
												variant="ghost"
												size="icon-sm"
												className="opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<HugeiconsIcon
													icon={MoreHorizontalIcon}
													className="size-4"
												/>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onSelect={() => openEditDialog(position)}
											>
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

								<p className="text-sm font-medium text-muted-foreground/80 leading-relaxed mb-6 line-clamp-2 min-h-10">
									{position.description || position.title || position.name}
								</p>

								<div className="flex items-center gap-3 pt-4 border-t border-border/10">
									<div className="flex items-center gap-2 bg-primary/5 px-2.5 py-1.5 rounded-md text-primary font-bold text-xs tracking-widest border border-primary/10">
										<HugeiconsIcon icon={UserMultiple02Icon} size={14} />
										{position.employeeCount}
										<span className="font-medium text-primary/60 ml-0.5">
											EMPLOYEES
										</span>
									</div>
									<div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1.5 rounded-md text-muted-foreground font-medium text-xs border border-border/20">
										<HugeiconsIcon icon={Briefcase02Icon} size={14} />
										Position
									</div>
								</div>
							</div>
						))}

						{filteredPositions.length === 0 && (
							<div className="col-span-full py-12 text-center text-muted-foreground font-medium">
								No positions found matching your search.
							</div>
						)}
					</div>
				</div>
			</main>
			<Dialog
				open={!!editingPosition}
				onOpenChange={(open) => !open && setEditingPosition(null)}
			>
				<DialogContent className="sm:max-w-106.25">
					<DialogHeader>
						<DialogTitle>Edit Position</DialogTitle>
						<DialogDescription>
							Update the details for this job title.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-name">Position Name</Label>
							<Input
								id="edit-name"
								placeholder="e.g. Senior Software Engineer"
								value={editForm.name}
								onChange={(e) =>
									setEditForm({ ...editForm, name: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-department">Department</Label>
							<Select
								value={editForm.departmentId}
								onValueChange={(value) =>
									setEditForm({ ...editForm, departmentId: value || "" })
								}
							>
								<SelectTrigger id="edit-department">
									<SelectValue>
										{editForm.departmentId
											? departmentsData?.items.find(
													(d) => d.id === editForm.departmentId,
												)?.name || "Select a department"
											: "Select a department"}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{departmentsData?.items.length ? (
										departmentsData.items.map((dept) => (
											<SelectItem key={dept.id} value={dept.id}>
												{dept.name}
											</SelectItem>
										))
									) : (
										<SelectItem value="no-departments" disabled>
											No departments available
										</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-description">Description (Optional)</Label>
							<textarea
								id="edit-description"
								className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Brief description of the position's responsibilities..."
								value={editForm.description}
								onChange={(e) =>
									setEditForm({ ...editForm, description: e.target.value })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingPosition(null)}>
							Cancel
						</Button>
						<Button
							onClick={handleEditPosition}
							disabled={
								isEditSubmitting ||
								!editForm.name.trim() ||
								!editForm.departmentId
							}
						>
							{isEditSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
