import type { ApiPaginatedResponse, Employee, EmployeeDocument, PolicyCompliance } from "@/types";
import { hrmsApi } from "./index";

export const employeeApi = hrmsApi.injectEndpoints({
	endpoints: (builder) => ({
		getEmployees: builder.query<
			ApiPaginatedResponse<Employee>,
			| {
					page?: number;
					limit?: number;
					status?: string;
					jobTitleId?: string;
					departmentId?: string;
					searchTerm?: string;
			  }
			| undefined
		>({
			query: (params) => ({
				url: "/employee",
				params: {
					page: params?.page ?? 1,
					limit: params?.limit ?? 20,
					...(params?.status ? { status: params.status } : {}),
					...(params?.jobTitleId ? { jobTitleId: params.jobTitleId } : {}),
					...(params?.departmentId ? { departmentId: params.departmentId } : {}),
					...(params?.searchTerm ? { searchTerm: params.searchTerm } : {}),
				},
			}),
			providesTags: (result) =>
				result
					? [
							...result.items.map(({ id }) => ({
								type: "Employee" as const,
								id,
							})),
							{ type: "Employee", id: "LIST" },
						]
					: [{ type: "Employee", id: "LIST" }],
		}),
		getEmployee: builder.query<Employee, string>({
			query: (id) => `/employee/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Employee", id }],
		}),
		getCompliance: builder.query<PolicyCompliance, string>({
			query: (companyId) => `/employee/compliance/${companyId}`,
			providesTags: [{ type: "Compliance", id: "LATEST" }],
		}),
		onboardEmployee: builder.mutation<Employee, FormData>({
			query: (formData) => ({
				url: "/employee",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: [{ type: "Employee", id: "LIST" }],
		}),
		updateEmployee: builder.mutation<
			Employee,
			{ id: string } & Partial<Employee>
		>({
			query: ({ id, ...body }) => ({
				url: `/employee/${id}`,
				method: "PATCH",
				body,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Employee", id },
				{ type: "Employee", id: "LIST" },
			],
		}),
		deleteEmployee: builder.mutation<void, string>({
			query: (id) => ({
				url: `/employee/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: [{ type: "Employee", id: "LIST" }],
		}),
		changeEmployeeStatus: builder.mutation<
			Employee,
			{
				id: string;
				status: "PENDING" | "ACTIVE" | "RESIGNED" | "TERMINATED";
				comment?: string;
				endDate?: string;
				lastWorkingDay?: string;
				reason?: string;
			}
		>({
			query: ({ id, ...params }) => ({
				url: `/employee/${id}/change-status`,
				method: "PATCH",
				params,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Employee", id },
				{ type: "Employee", id: "LIST" },
			],
		}),
		addEmployeeDocument: builder.mutation<EmployeeDocument, { id: string; formData: FormData }>({
			query: ({ id, formData }) => ({
				url: `/employee/${id}/add-document`,
				method: "POST",
				body: formData,
			}),
		}),
		bulkUploadEmployees: builder.mutation<{ imported: number; errors?: any[] }, FormData>({
			query: (formData) => ({
				url: "/employee/bulk/upload",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: [{ type: "Employee", id: "LIST" }],
		}),
		getEmployeeDocuments: builder.query<
			ApiPaginatedResponse<EmployeeDocument>,
			{ id: string; page?: number; limit?: number; type?: string; phase?: string }
		>({
			query: ({ id, page = 1, limit = 20, type, phase }) => ({
				url: `/employee/${id}/documents`,
				params: {
					page,
					limit,
					...(type ? { type } : {}),
					...(phase ? { phase } : {}),
				},
			}),
		}),
	}),
});

export const {
	useGetEmployeesQuery,
	useGetEmployeeQuery,
	useGetComplianceQuery,
	useOnboardEmployeeMutation,
	useUpdateEmployeeMutation,
	useDeleteEmployeeMutation,
	useGetEmployeeDocumentsQuery,
	useChangeEmployeeStatusMutation,
	useAddEmployeeDocumentMutation,
	useBulkUploadEmployeesMutation,
} = employeeApi;
