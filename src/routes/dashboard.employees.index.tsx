import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Delete02Icon,
	Download01Icon,
	FileUploadIcon,
	Mail01Icon,
	MoreHorizontalIcon,
	PlusSignCircleIcon,
	Search01Icon,
	Upload01Icon,
	UserMinus01Icon,
	ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { ErrorComponent } from "@/components/error-component";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetCompanyDepartmentsQuery } from "@/lib/redux/api/department";
import {
	useBulkUploadEmployeesMutation,
	useDeleteEmployeeMutation,
	useGetEmployeesQuery,
} from "@/lib/redux/api/employee";
import { useGetJobTitlesQuery } from "@/lib/redux/api/job-title";
import { useAppSelector } from "@/lib/redux/store";

export const Route = createFileRoute("/dashboard/employees/")({
	component: EmployeesPage,
});

const EMPLOYEE_STATUSES = ["ACTIVE", "RESIGNED", "TERMINATED"];

function EmployeesPage() {
	const { activeCompanyId, token } = useAppSelector((state) => state.auth);
	const navigate = useNavigate();

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [status, setStatus] = useState("ACTIVE");
	const [departmentId, setDepartmentId] = useState("");
	const [jobTitleId, setJobTitleId] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [importDialogOpen, setImportDialogOpen] = useState(false);
	const [importFile, setImportFile] = useState<File | null>(null);
	const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
	const importFileRef = useRef<HTMLInputElement>(null);

	// Debounce search input by 400ms
	useEffect(() => {
		const timer = setTimeout(() => { setSearchTerm(searchInput); setPage(1); }, 400);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const { data: employeesData, isLoading, isError } = useGetEmployeesQuery({
		page,
		limit,
		...(status ? { status } : {}),
		...(departmentId ? { departmentId } : {}),
		...(jobTitleId ? { jobTitleId } : {}),
		...(searchTerm ? { searchTerm } : {}),
	});

	const { data: departmentsData } = useGetCompanyDepartmentsQuery(
		activeCompanyId ? { companyId: activeCompanyId } : undefined,
		{ skip: !activeCompanyId },
	);

	const { data: jobTitlesData } = useGetJobTitlesQuery(
		departmentId ? { departmentId } : undefined,
		{ skip: !departmentId },
	);

	const [deleteEmployee] = useDeleteEmployeeMutation();
	const [bulkUploadEmployees, { isLoading: isImporting }] = useBulkUploadEmployeesMutation();

	const employees = employeesData?.items || [];
	const departments = departmentsData?.items || [];
	const jobTitles = jobTitlesData?.items || [];

	const handleTerminate = async (id: string, fullName: string) => {
		try {
			await deleteEmployee(id).unwrap();
			toast.success(`Contract for ${fullName} has been formally terminated`);
		} catch (_err) {
			toast.error("Failed to process termination");
		}
	};

	const handleDepartmentChange = (val: string) => {
		setDepartmentId(val === "all" ? "" : val);
		setJobTitleId("");
		setPage(1);
	};

	const handleDownloadTemplate = async () => {
		setIsDownloadingTemplate(true);
		try {
			const baseUrl = import.meta.env.VITE_APP_API_URL || "http://84.247.172.162:7009/api/v1";
			const res = await fetch(`${baseUrl}/employee/bulk/download-template`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Failed to download template");
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "employee_import_template.xlsx";
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			toast.error("Failed to download template");
		} finally {
			setIsDownloadingTemplate(false);
		}
	};

	const handleImport = async () => {
		if (!importFile) return;
		const data = new FormData();
		data.append("employeeFile", importFile);
		try {
			const result = await bulkUploadEmployees(data).unwrap();
			toast.success(`Successfully imported ${result.imported} employees`);
			setImportDialogOpen(false);
			setImportFile(null);
		} catch (err: any) {
			toast.error(err?.data?.message || "Failed to import employees");
		}
	};

	if (isLoading) return <DashboardPending />;
	if (isError)
		return (
			<ErrorComponent
				error={new Error("The employee directory could not be loaded.")}
			/>
		);

	return (
    <main className="flex flex-1 flex-col gap-0 overflow-hidden bg-muted/20">
      <input
        ref={importFileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          setImportFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) setImportFile(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Employees</DialogTitle>
            <DialogDescription>
              Upload a filled spreadsheet to bulk-import employees. Make sure
              you are using the official template — other formats may be
              rejected.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div
              className="border-2 border-dashed border-border/40 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-muted/5 transition-colors"
              onClick={() => importFileRef.current?.click()}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <HugeiconsIcon icon={FileUploadIcon} size={24} />
              </div>
              {importFile ? (
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground/90">
                    {importFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-medium mt-0.5">
                    Click to replace
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground/80">
                    Click to select file
                  </p>
                  <p className="text-xs text-muted-foreground/50 font-medium mt-0.5">
                    XLSX, XLS or CSV
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground/60 font-semibold leading-relaxed bg-muted/10 rounded-lg px-3 py-2.5 border border-border/20">
              Use the official template to ensure correct formatting. Download
              it from the employee directory header if you haven't already.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
            >
              {isImporting ? "Importing..." : "Import Employees"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DashboardHeader
        category="Organization"
        title="Employees"
        description="Manage and monitor your global workforce directory"
      >
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          disabled={isDownloadingTemplate}
        >
          <HugeiconsIcon icon={Download01Icon} />
          {isDownloadingTemplate ? "Downloading..." : "Download Template"}
        </Button>

        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
          <HugeiconsIcon icon={Upload01Icon} />
          Import
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate({ to: "/dashboard/employees/resign" })}
          >
            <HugeiconsIcon icon={UserMinus01Icon} />
            Resign
          </Button>
          <Button
            onClick={() => navigate({ to: "/dashboard/employees/onboard" })}
          >
            <HugeiconsIcon icon={PlusSignCircleIcon} />
            Onboard
          </Button>
        </div>
      </DashboardHeader>

      <div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
        <section>
          <Frame className="group/frame">
            <FramePanel className="p-0 overflow-hidden bg-card shadow-sm border-border/40">
              <FrameHeader className="border-b-0 pb-2 px-8 pt-8">
                <div>
                  <FrameTitle className="text-xl font-bold">
                    Employee Directory
                  </FrameTitle>
                  <FrameDescription className="text-xs font-medium">
                    Centralized management of workforce profiles and lifecycles
                  </FrameDescription>
                </div>
              </FrameHeader>

              <div className="px-8 pb-6 pt-4 flex flex-col xl:flex-row items-center justify-between gap-4 border-b border-border/5">
                <div className="relative flex-1 w-full max-w-sm">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40"
                    strokeWidth={2}
                  />
                  <Input
                    placeholder="Search by name, email or ID…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 h-10 rounded-xl border-border/40 bg-muted/5 focus:bg-background transition-all text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  {/* Status */}
                  <Select
                    value={status}
                    onValueChange={(val) => {
                      setStatus(val === "all" ? "" : val);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 w-36">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest shrink-0">
                          Status:
                        </span>
                        <span className="truncate text-xs font-semibold">
                          <SelectValue placeholder="All" />
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-medium">
                        All States
                      </SelectItem>
                      {EMPLOYEE_STATUSES.map((s) => (
                        <SelectItem
                          key={s}
                          value={s}
                          className="text-xs font-medium"
                        >
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Department */}
                  <Select
                    value={departmentId || "all"}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 w-48">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest shrink-0">
                          Dept:
                        </span>
                        <span className="truncate text-xs font-semibold">
                          {departmentId
                            ? departments.find((d) => d.id === departmentId)
                                ?.name
                            : "All"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-medium">
                        All Departments
                      </SelectItem>
                      {departments.map((d) => (
                        <SelectItem
                          key={d.id}
                          value={d.id}
                          className="text-xs font-medium"
                        >
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Job Title — only shown when a department is selected */}
                  {departmentId && (
                    <Select
                      value={jobTitleId || "all"}
                      onValueChange={(val) => {
                        setJobTitleId(val === "all" ? "" : val);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-border/40 bg-muted/5 w-48">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest shrink-0">
                            Title:
                          </span>
                          <span className="truncate text-xs font-semibold">
                            {jobTitleId
                              ? jobTitles.find((j) => j.id === jobTitleId)?.name
                              : "All"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs font-medium">
                          All Titles
                        </SelectItem>
                        {jobTitles.map((j) => (
                          <SelectItem
                            key={j.id}
                            value={j.id}
                            className="text-xs font-medium"
                          >
                            {j.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <FrameContent className="p-0">
                {employees.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-muted/5">
                      <TableRow className="hover:bg-transparent border-border/5">
                        <TableHead className="pl-8 py-3">Employee</TableHead>
                        <TableHead className="px-4 py-3">Gender</TableHead>
                        <TableHead className="px-4 py-3">Department</TableHead>
                        <TableHead className="px-4 py-3">Job Title</TableHead>
                        <TableHead className="px-4 py-3">Contact</TableHead>
                        <TableHead className="px-4 py-3">Contract</TableHead>
                        <TableHead className="px-4 py-3">Status</TableHead>
                        <TableHead className="pr-8 py-3 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => {
                        const fullName = `${employee.firstName} ${employee.lastName}`;
                        return (
                          <TableRow
                            key={employee.id}
                            className="border-border/5 group transition-colors"
                          >
                            <TableCell className="pl-8 py-3">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  name={fullName}
                                  size="default"
                                  className="h-10 w-10 rounded-xl"
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors">
                                    {fullName}
                                  </span>
                                  <span className="text-[11px] font-semibold text-muted-foreground/50">
                                    {employee.startDate}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                variant="muted"
                                className="bg-muted/10 border-none font-bold text-[10px] uppercase tracking-widest"
                              >
                                {employee.gender}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                variant="muted"
                                className="bg-muted/10 border-none font-bold text-[10px] uppercase tracking-widest"
                              >
                                {employee.departmentName ?? "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <span className="text-xs font-semibold text-foreground/70">
                                {employee.jobTitle ?? "—"}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/60">
                                  <HugeiconsIcon icon={Mail01Icon} size={12} />
                                  <span className="truncate max-w-40">
                                    {employee.email}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                variant={
                                  employee.contractTerm === "FIXED"
                                    ? "warning"
                                    : employee.contractTerm === "OPEN_ENDED"
                                      ? "success"
                                      : "muted"
                                }
                                className="font-bold text-[10px] uppercase tracking-widest"
                              >
                                {employee.contractTerm === "OPEN_ENDED"
                                  ? "Open Ended"
                                  : employee.contractTerm === "FIXED"
                                    ? "Fixed"
                                    : "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                variant={
                                  employee.status === "ACTIVE"
                                    ? "success"
                                    : employee.status === "PROBATION" || employee.status === "PENDING"
                                      ? "warning"
                                      : employee.status === "RESIGNED"
                                        ? "muted"
                                        : "destructive"
                                }
                                className="h-5 text-[9px] font-black uppercase tracking-widest w-fit"
                              >
                                {employee.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-8 py-3 text-right">
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label="Employee actions"
                                      >
                                        <HugeiconsIcon
                                          icon={MoreHorizontalIcon}
                                        />
                                      </Button>
                                    }
                                  />
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-52 rounded-2xl border-border/40 shadow-2xl p-2"
                                  >
                                    <DropdownMenuItem
                                      render={
                                        <Link
                                          to="/dashboard/employees/$id"
                                          params={{ id: employee.id }}
                                        />
                                      }
                                      className="rounded-xl py-1.5 font-semibold text-sm"
                                    >
                                      <HugeiconsIcon
                                        icon={ViewIcon}
                                        className="size-4 mr-3 text-muted-foreground/60"
                                      />
                                      <span>Profile Details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl py-1.5 font-semibold text-sm">
                                      <HugeiconsIcon
                                        icon={Mail01Icon}
                                        className="size-4 mr-3 text-muted-foreground/60"
                                      />
                                      <span>Messaging</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/5 my-1" />
                                    <AlertDialog>
                                      <AlertDialogTrigger
                                        render={
                                          <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="rounded-xl py-1.5 font-semibold text-sm text-destructive focus:bg-destructive/5"
                                          >
                                            <HugeiconsIcon
                                              icon={Delete02Icon}
                                              className="size-4 mr-3"
                                            />
                                            <span>Terminate</span>
                                          </DropdownMenuItem>
                                        }
                                      />
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Permanent Termination
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to terminate{" "}
                                            {fullName}'s employment? This will
                                            immediately halt payroll and revoke
                                            all system access.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Abort
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleTerminate(
                                                employee.id,
                                                fullName,
                                              )
                                            }
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            Finalize Termination
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="size-16 rounded-3xl bg-muted/5 flex items-center justify-center text-muted-foreground/20 border border-border/5">
                      <HugeiconsIcon icon={Search01Icon} size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-foreground/80">
                        No results matched
                      </p>
                      <p className="text-sm font-medium text-muted-foreground/40 max-w-xs">
                        Adjust your filters or search term to find what you're
                        looking for.
                      </p>
                    </div>
                  </div>
                )}
              </FrameContent>

              <FrameFooter className="px-8 py-5 border-t border-border/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.25em] shrink-0">
                    {employeesData?.meta.totalItems ?? 0} records
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest shrink-0">
                      Rows:
                    </span>
                    <Select
                      value={String(limit)}
                      onValueChange={(val) => {
                        setLimit(Number(val));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-7 w-16 rounded-lg border-border/30 bg-muted/5 text-xs font-bold px-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 50, 100].map((n) => (
                          <SelectItem
                            key={n}
                            value={String(n)}
                            className="text-xs font-medium"
                          >
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg text-muted-foreground/40 hover:text-primary transition-colors"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      size={14}
                      strokeWidth={2.5}
                    />
                  </Button>
                  <div className="h-8 px-3 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-black flex items-center justify-center min-w-8">
                    {page}
                  </div>
                  <span className="text-[10px] text-muted-foreground/30 font-bold">
                    / {employeesData?.meta.totalPages ?? 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 rounded-lg text-muted-foreground/40 hover:text-primary transition-colors"
                    disabled={page >= (employeesData?.meta.totalPages ?? 1)}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(employeesData?.meta.totalPages ?? 1, p + 1),
                      )
                    }
                  >
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      strokeWidth={2.5}
                    />
                  </Button>
                </div>
              </FrameFooter>
            </FramePanel>
          </Frame>
        </section>
      </div>
    </main>
  );
}
