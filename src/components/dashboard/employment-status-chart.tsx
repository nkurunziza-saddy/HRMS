"use client";

import * as React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Frame,
	FrameContent,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

const chartConfig = {
	employees: {
		label: "Employees",
	},
	active: {
		label: "Active",
		color: "var(--chart-1)",
	},
	probation: {
		label: "Probation",
		color: "var(--chart-2)",
	},
	pending: {
		label: "Pending",
		color: "var(--chart-3)",
	},
	resigned: {
		label: "Resigned",
		color: "var(--chart-4)",
	},
	terminated: {
		label: "Terminated",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export const EmploymentStatusChart = React.memo(
	function EmploymentStatusChart() {
		const [selected, setSelected] = React.useState<string>("Active");
		const [chartData, setChartData] = React.useState<any[]>([]);

		React.useEffect(() => {
			async function loadData() {
				// In a real app we would aggregate from api.getEmployees()
				const emps = await api.getEmployees();
				const summary = {
					Active: 0,
					Probation: 0,
					Pending: 0,
					Resigned: 0,
					Terminated: 0,
				};

				emps.forEach((e) => {
					const s = e.status.charAt(0).toUpperCase() + e.status.slice(1);
					if (s in summary) {
						summary[s as keyof typeof summary]++;
					}
				});

				// Make the mock data look a bit more realistic (scale it up for the dash)
				setChartData([
					{
						type: "Active",
						employees: summary.Active * 30 + 120,
						fill: "var(--color-active)",
					},
					{
						type: "Probation",
						employees: summary.Probation * 15 + 18,
						fill: "var(--color-probation)",
					},
					{
						type: "Pending",
						employees: summary.Pending * 5 + 4,
						fill: "var(--color-pending)",
					},
					{
						type: "Resigned",
						employees: summary.Resigned * 8 + 12,
						fill: "var(--color-resigned)",
					},
					{
						type: "Terminated",
						employees: summary.Terminated * 4 + 3,
						fill: "var(--color-terminated)",
					},
				]);
			}
			loadData();
		}, []);

		const totalEmployees = React.useMemo(() => {
			return chartData.reduce((acc, curr) => acc + curr.employees, 0);
		}, [chartData]);

		if (!chartData.length) return null;

		return (
			<Frame className="h-full group/frame">
				<FramePanel className="flex flex-col h-full overflow-hidden">
					<FrameHeader className="flex-col items-start gap-4">
						<div className="space-y-1">
							<FrameTitle>Employment Status</FrameTitle>
							<FrameDescription>Workforce active engagement</FrameDescription>
						</div>

						<ToggleGroup
							value={selected ? [selected] : []}
							onValueChange={(val) => {
								if (val.length > 0) setSelected(val[0]);
							}}
							variant="outline"
							className="h-8 shadow-none w-full bg-muted/20 border-border/5 p-0.5"
						>
							{chartData.slice(0, 3).map((d) => (
								<ToggleGroupItem
									key={d.type}
									value={d.type}
									className="flex-1 text-xs h-7 px-2 font-semibold capitalize tracking-tight data-[state=on]:bg-background data-[state=on]:shadow-xs"
								>
									{d.type}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</FrameHeader>

					<FrameContent className="flex-1 flex flex-col items-center justify-center py-8">
						<ChartContainer
							config={chartConfig}
							className="mx-auto aspect-square max-h-[220px] w-full"
						>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Pie
									data={chartData}
									dataKey="employees"
									nameKey="type"
									innerRadius={65}
									strokeWidth={4}
									paddingAngle={2}
									className="outline-none"
									style={{ cursor: "pointer" }}
									onClick={(data: any) => {
										if (data?.type) {
											setSelected(data.type);
										}
									}}
								>
									{" "}
									{chartData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.fill}
											stroke={entry.fill}
											className="outline-none transition-[fill,stroke,opacity,transform] duration-300"
										/>
									))}
									<Label
										content={({ viewBox }) => {
											if (viewBox && "cx" in viewBox && "cy" in viewBox) {
												const selectedData = chartData.find(
													(d) => d.type === selected,
												);
												return (
													<text
														x={viewBox.cx}
														y={viewBox.cy}
														textAnchor="middle"
														dominantBaseline="middle"
													>
														<tspan
															x={viewBox.cx}
															y={viewBox.cy}
															className="fill-foreground text-3xl font-light tracking-tight tabular-nums"
														>
															{(
																selectedData?.employees || totalEmployees
															).toLocaleString()}
														</tspan>
														<tspan
															x={viewBox.cx}
															y={(viewBox.cy || 0) + 24}
															className="fill-muted-foreground/40 text-xs capitalize tracking-widest font-semibold"
														>
															{selectedData ? selectedData.type : "Total"}
														</tspan>
													</text>
												);
											}
											return null;
										}}
									/>
								</Pie>
							</PieChart>
						</ChartContainer>
					</FrameContent>

					<FrameFooter className="grid grid-cols-2 gap-x-6 gap-y-2">
						{chartData.map((item) => (
							<div
								key={item.type}
								className="flex items-center gap-2.5 min-w-0 group/item cursor-pointer"
								onClick={() => setSelected(item.type)}
							>
								<div
									className={cn(
										"h-1.5 w-1.5 rounded-full shrink-0 transition-[opacity,transform] duration-300",
										selected === item.type
											? "opacity-100 scale-125"
											: "opacity-20",
									)}
									style={{ backgroundColor: item.fill }}
								/>
								<span
									className={cn(
										"text-xs font-semibold capitalize tracking-tight truncate transition-colors duration-300",
										selected === item.type
											? "text-foreground/80"
											: "text-muted-foreground/30",
									)}
								>
									{item.type}{" "}
									<span className="ml-1 opacity-40 tabular-nums">
										{item.employees}
									</span>
								</span>
							</div>
						))}
					</FrameFooter>
				</FramePanel>
			</Frame>
		);
	},
);
