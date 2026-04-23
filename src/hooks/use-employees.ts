import { useMemo, useState } from "react";
import type { Employee } from "../types";

export function useEmployees(initialEmployees: Employee[]) {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState("10");

	const filteredEmployees = useMemo(() => {
		return initialEmployees.filter((employee) => {
			const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
			const matchesSearch =
				fullName.includes(searchTerm.toLowerCase()) ||
				employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employee.IDNumber.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesStatus =
				filterStatus === "all" || employee.status === filterStatus;
			return matchesSearch && matchesStatus;
		});
	}, [initialEmployees, searchTerm, filterStatus]);

	const statuses = ["all", "ACTIVE", "INACTIVE", "PROBATION", "RESIGNED", "TERMINATED"];

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
		filterStatus,
		setFilterStatus,
		selectedIds,
		setSelectedIds,
		currentPage,
		setCurrentPage,
		rowsPerPage,
		setRowsPerPage,
		filteredEmployees,
		statuses,
		toggleSelectAll,
		toggleSelect,
	};
}
