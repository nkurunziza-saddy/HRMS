import { useMemo, useState } from "react";
import type { Employee } from "../types";

export function useEmployees(initialEmployees: Employee[]) {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterDept, setFilterDept] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState("10");

	const filteredEmployees = useMemo(() => {
		return initialEmployees.filter((employee) => {
			const name = employee.name || "";
			const email = employee.email || "";
			const matchesSearch =
				name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				email.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesDept =
				filterDept === "all" || employee.department === filterDept;
			const matchesStatus =
				filterStatus === "all" || employee.status === filterStatus;
			return matchesSearch && matchesDept && matchesStatus;
		});
	}, [initialEmployees, searchTerm, filterDept, filterStatus]);

	const departments = useMemo(() => {
		return ["all", ...new Set(initialEmployees.map((u) => u.department || "General"))];
	}, [initialEmployees]);

	const statuses = ["all", "active", "probation", "resigned", "terminated"];

	const toggleSelectAll = () => {
		if (
			selectedIds.size === filteredEmployees.length &&
			filteredEmployees.length > 0
		) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(filteredEmployees.map((u) => u.id)));
		}
	};

	const toggleSelect = (id: string) => {
		const newSelected = new Set(selectedIds);
		if (newSelected.has(id)) {
			newSelected.delete(id);
		} else {
			newSelected.add(id);
		}
		setSelectedIds(newSelected);
	};

	return {
		searchTerm,
		setSearchTerm,
		filterDept,
		setFilterDept,
		filterStatus,
		setFilterStatus,
		selectedIds,
		setSelectedIds,
		currentPage,
		setCurrentPage,
		rowsPerPage,
		setRowsPerPage,
		filteredEmployees,
		departments,
		statuses,
		toggleSelectAll,
		toggleSelect,
	};
}
