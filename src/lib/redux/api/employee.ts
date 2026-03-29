import type { ApiPaginatedResponse, Employee, PolicyCompliance } from "@/types";
import { hrmsApi } from "./index";

export const employeeApi = hrmsApi.injectEndpoints({
	endpoints: (builder) => ({
		getEmployees: builder.query<
			ApiPaginatedResponse<Employee>,
			| { page?: number; limit?: number; companyId?: string; status?: string }
			| undefined
		>({
			query: (params) => ({
				url: "/employee",
				params: {
					page: params?.page ?? 1,
					limit: params?.limit ?? 20,
					...(params?.companyId ? { companyId: params.companyId } : {}),
					...(params?.status ? { status: params.status } : {}),
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
	}),
});

export const {
	useGetEmployeesQuery,
	useGetEmployeeQuery,
	useGetComplianceQuery,
	useOnboardEmployeeMutation,
	useUpdateEmployeeMutation,
	useDeleteEmployeeMutation,
} = employeeApi;
