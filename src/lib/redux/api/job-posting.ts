import type {
	ApiPaginatedResponse,
	CreateJobPostingRequest,
	JobPosting,
	JobPostingStatus,
} from "@/types";
import { hrmsApi } from "./index";

export const jobPostingApi = hrmsApi.injectEndpoints({
	endpoints: (builder) => ({
		getJobPostings: builder.query<
			ApiPaginatedResponse<JobPosting>,
			| {
					page?: number;
					limit?: number;
					status?: JobPostingStatus;
					companyId?: string;
			  }
			| undefined
		>({
			query: (params) => ({
				url: "/job-posting",
				params: {
					page: params?.page ?? 1,
					limit: params?.limit ?? 20,
					...(params?.status ? { status: params.status } : {}),
					...(params?.companyId ? { companyId: params.companyId } : {}),
				},
			}),
			providesTags: (result) =>
				result
					? [
							...result.items.map(({ id }) => ({
								type: "JobPosting" as const,
								id,
							})),
							{ type: "JobPosting", id: "LIST" },
						]
					: [{ type: "JobPosting", id: "LIST" }],
		}),
		getJobPosting: builder.query<JobPosting, string>({
			query: (id) => `/job-posting/${id}`,
			providesTags: (_result, _error, id) => [{ type: "JobPosting", id }],
		}),
		createJobPosting: builder.mutation<JobPosting, CreateJobPostingRequest>({
			query: (data) => ({
				url: "/job-posting",
				method: "POST",
				body: data,
			}),
			invalidatesTags: [{ type: "JobPosting", id: "LIST" }],
		}),
		changeJobPostingStatus: builder.mutation<
			JobPosting,
			{ id: string; status: JobPostingStatus }
		>({
			query: ({ id, status }) => ({
				url: `/job-posting/${id}/change-status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "JobPosting", id },
				{ type: "JobPosting", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetJobPostingsQuery,
	useGetJobPostingQuery,
	useCreateJobPostingMutation,
	useChangeJobPostingStatusMutation,
} = jobPostingApi;
