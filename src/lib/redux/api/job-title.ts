import type {
	ApiPaginatedResponse,
	CreateJobTitleRequest,
	JobTitle,
	UpdateJobTitleRequest,
} from "@/types";
import { hrmsApi } from "./index";

export const jobTitleApi = hrmsApi.injectEndpoints({
	endpoints: (builder) => ({
		getJobTitles: builder.query<
			ApiPaginatedResponse<JobTitle>,
			{ page?: number; limit?: number; companyId?: string; departmentId?: string } | undefined
		>({
			query: (params) => ({
				url: "/job-title",
				params: {
					page: params?.page ?? 1,
					limit: params?.limit ?? 50,
					companyId: params?.companyId,
					departmentId: params?.departmentId,
				},
			}),
			providesTags: (result) =>
				result
					? [
							...result.items.map(({ id }) => ({
								type: "JobTitle" as const,
								id,
							})),
							{ type: "JobTitle", id: "LIST" },
						]
					: [{ type: "JobTitle", id: "LIST" }],
		}),
		getJobTitle: builder.query<JobTitle, string>({
			query: (id) => `/job-title/${id}`,
			providesTags: (_result, _error, id) => [{ type: "JobTitle", id }],
		}),
		createJobTitle: builder.mutation<JobTitle, CreateJobTitleRequest>({
			query: (data) => ({
				url: "/job-title",
				method: "POST",
				body: data,
			}),
			invalidatesTags: [{ type: "JobTitle", id: "LIST" }],
		}),
		updateJobTitle: builder.mutation<JobTitle, UpdateJobTitleRequest>({
			query: ({ id, ...data }) => ({
				url: `/job-title/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "JobTitle", id },
				{ type: "JobTitle", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetJobTitlesQuery,
	useGetJobTitleQuery,
	useCreateJobTitleMutation,
	useUpdateJobTitleMutation,
} = jobTitleApi;
