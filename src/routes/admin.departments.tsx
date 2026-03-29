import {
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	useCreateDepartmentReferenceMutation,
	useGetDepartmentReferencesQuery,
} from "@/lib/redux/api/department";

export const Route = createFileRoute("/admin/departments")({
	component: AdminDepartmentsPage,
});

function AdminDepartmentsPage() {
	const { data, isLoading, isError } =
		useGetDepartmentReferencesQuery(undefined);
	const [createReference] = useCreateDepartmentReferenceMutation();

	const [searchTerm, setSearchTerm] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isLoading) return <DashboardPending />;
	if (isError) return <div>Error loading department references.</div>;

	const references = data?.items || [];
	const filtered = references.filter((ref) => {
		const name = ref.name || "";
		return name.toLowerCase().includes(searchTerm.toLowerCase());
	});

	const handleCreate = async () => {
		if (!newName) return;
		setIsSubmitting(true);
		try {
			await createReference({ name: newName }).unwrap();
			toast.success("Global department created");
			setIsDialogOpen(false);
			setNewName("");
		} catch (err) {
			console.error(err);
			toast.error("Failed to create global department");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="flex flex-1 flex-col gap-0 overflow-hidden">
			<DashboardHeader
				category="Platform"
				title="Department References"
				description="Manage global department categories available to all companies."
			>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger
						render={
							<Button>
								<HugeiconsIcon icon={PlusSignCircleIcon} />
								New Reference
							</Button>
						}
					/>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Global Department</DialogTitle>
							<DialogDescription>
								This department will be available for all companies to select.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<Label htmlFor="name">Department Name</Label>
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="e.g. Engineering"
							/>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={handleCreate}
								disabled={isSubmitting || !newName}
							>
								{isSubmitting ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DashboardHeader>

			<div className="px-6 py-4 border-b border-border/10 bg-muted/5">
				<div className="relative max-w-sm">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-3 top-2.5 size-4 text-muted-foreground/40"
					/>
					<Input
						placeholder="Search references..."
						className="pl-9"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="flex-1 overflow-auto p-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead className="w-[100px] text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.map((ref) => (
							<TableRow key={ref.id}>
								<TableCell className="font-bold">{ref.name}</TableCell>
								<TableCell className="text-right">
									<Button variant="ghost" size="icon-sm">
										<HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
									</Button>
								</TableCell>
							</TableRow>
						))}
						{filtered.length === 0 && (
							<TableRow>
								<TableCell colSpan={3} className="text-center py-10">
									No department references found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</main>
	);
}
