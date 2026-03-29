import {
  Calendar03Icon,
  Cancel01Icon,
  Clock01Icon,
  InformationCircleIcon,
  PlusSignCircleIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardPending } from "@/components/dashboard/dashboard-pending";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import { ErrorComponent } from "@/components/error-component";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/mock-api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/leaves")({
  loader: async () => {
    const [requests, balance] = await Promise.all([
      api.getLeaves(),
      api.getLeaveBalance("EMP-001"),
    ]);
    return { requests, balance };
  },
  pendingComponent: DashboardPending,
  errorComponent: ErrorComponent,
  component: LeavesPage,
});

function LeavesPage() {
  const { requests, balance } = Route.useLoaderData();

  return (
    <main className="flex flex-1 flex-col gap-0 overflow-hidden">
      <DashboardHeader
        category="Time Off"
        title="Leave Management"
        description="Track availability, balances, and absence requests"
      >
        <Button
          size="lg"
          className="text-xs font-bold shadow-sm gap-2 capitalize"
        >
          <HugeiconsIcon icon={PlusSignCircleIcon} size={14} strokeWidth={2} />
          Request Leave
        </Button>
      </DashboardHeader>

      <div className="flex flex-col gap-6 pb-12 flex-1 overflow-auto no-scrollbar px-4 lg:px-6">
        {/* Reusable Stat Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Annual Leave"
            value={`${balance?.annual || 0} Days`}
            icon={Calendar03Icon}
            variant="primary"
            sub="1.5 days/mo accrual"
          />
          <StatCard
            label="Sick Leave"
            value={`${balance?.sick || 0} Days`}
            icon={InformationCircleIcon}
            variant="warning"
            sub="Standard yearly limit"
          />
          <StatCard
            label="Used this year"
            value={`${balance?.used || 0} Days`}
            icon={Clock01Icon}
            variant="info"
            sub="Total absences"
          />
        </section>

        {/* Row Direction Tabs Layout */}
        <section className="flex-1 min-h-0">
          <Tabs
            defaultValue="all"
            className="flex flex-col lg:flex-row gap-6 h-full items-start"
          >
            <div className="w-full lg:w-[240px] flex-shrink-0">
              <TabsList className="flex flex-col h-auto w-full bg-muted/10 border border-border/5 p-1.5 rounded-2xl gap-1 items-stretch justify-start">
                <LeaveTabTrigger
                  value="all"
                  label="All Requests"
                  count={requests.length}
                />
                <LeaveTabTrigger
                  value="pending"
                  label="Pending Approval"
                  count={requests.filter((r) => r.status === "pending").length}
                />
                <LeaveTabTrigger value="history" label="My History" />
              </TabsList>
            </div>

            <div className="flex-1 w-full min-w-0">
              <TabsContent
                value="all"
                className="mt-0 animate-in fade-in slide-in-from-right-1 duration-300"
              >
                <Frame>
                  <FramePanel className="p-0 overflow-hidden bg-card">
                    <FrameHeader>
                      <div>
                        <FrameTitle>Leave Pipeline</FrameTitle>
                        <FrameDescription>
                          Active absence requests requiring attention
                        </FrameDescription>
                      </div>
                    </FrameHeader>
                    <FrameContent className="p-0">
                      <Table>
                        <TableHeader className="bg-muted/10">
                          <TableRow className="hover:bg-transparent border-border/5">
                            <TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest pl-6">
                              Employee
                            </TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
                              Type
                            </TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
                              Duration
                            </TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2 text-center">
                              Days
                            </TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2">
                              Status
                            </TableHead>
                            <TableHead className="text-xs font-bold text-muted-foreground/40 capitalize tracking-widest px-2 text-right pr-6">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.map((req) => (
                            <TableRow
                              key={req.id}
                              className="border-border/5 hover:bg-muted/5 transition-colors group"
                            >
                              <TableCell className="pl-6 py-3">
                                <UserAvatar
                                  src={req.image}
                                  name={req.employeeName}
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell className="px-2">
                                <Badge
                                  variant="muted"
                                  className="bg-muted/10 border-none font-bold text-xs uppercase tracking-wider"
                                >
                                  {req.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-2 text-xs font-medium text-muted-foreground/60 tabular-nums">
                                {formatDate(req.startDate)} —{" "}
                                {formatDate(req.endDate)}
                              </TableCell>
                              <TableCell className="px-2 text-center text-sm font-bold text-foreground/80 tabular-nums">
                                {req.days}
                              </TableCell>
                              <TableCell className="px-2">
                                <Badge
                                  variant={
                                    req.status === "approved"
                                      ? "success"
                                      : req.status === "pending"
                                        ? "warning"
                                        : "destructive"
                                  }
                                  showDot
                                >
                                  {req.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                {req.status === "pending" ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      className="text-success hover:bg-success/10 rounded-lg"
                                      aria-label="Approve"
                                    >
                                      <HugeiconsIcon
                                        icon={Tick01Icon}
                                        size={14}
                                        strokeWidth={3}
                                      />
                                    </Button>
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      className="text-destructive hover:bg-destructive/10 rounded-lg"
                                      aria-label="Reject"
                                    >
                                      <HugeiconsIcon
                                        icon={Cancel01Icon}
                                        size={14}
                                        strokeWidth={3}
                                      />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="  transition-opacity"
                                  >
                                    <HugeiconsIcon
                                      icon={InformationCircleIcon}
                                      size={14}
                                      className="text-muted-foreground/40"
                                    />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </FrameContent>
                    <FrameFooter>
                      <span className="text-xs text-muted-foreground/40 font-bold capitalize tracking-widest">
                        Total {requests.length} records processed
                      </span>
                    </FrameFooter>
                  </FramePanel>
                </Frame>
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </div>
    </main>
  );
}

function LeaveTabTrigger({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger value={value}>
      <span className="text-xs font-semibold tracking-tight">{label}</span>
      {count !== undefined && (
        <Badge
          variant="muted"
          className="h-5 min-w-[20px] px-1.5 bg-muted/10 border-none font-bold text-xs group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary"
        >
          {count}
        </Badge>
      )}
    </TabsTrigger>
  );
}
