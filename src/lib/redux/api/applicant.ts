import type {
	Applicant,
	ApplicantPipelineStage,
	ChangeApplicantStatusRequest,
	CreateApplicantRequest,
} from "@/types";
import { hrmsApi } from "./index";

export const applicantApi = hrmsApi.injectEndpoints({
	endpoints: (builder) => ({
		getApplicants: builder.query<
			{ items: Applicant[]; total: number },
			| {
					page?: number;
					limit?: number;
					jobPostId?: string;
					companyId?: string;
			  }
			| undefined
		>({
			query: (params) => ({
				url: "/applicant",
				params: {
					page: params?.page ?? 1,
					limit: params?.limit ?? 100,
					jobPostId: params?.jobPostId,
					companyId: params?.companyId,
				},
			}),
			providesTags: (result) =>
				result
					? [
							...result.items.map(({ id, jobPostId }) => ({
								type: "Applicant" as const,
								id,
								jobPostId,
							})),
							{ type: "Applicant", id: "LIST" },
						]
					: [{ type: "Applicant", id: "LIST" }],
		}),
		getApplicant: builder.query<Applicant, string>({
			query: (id) => `/applicant/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Applicant", id }],
		}),
		getRecruitmentPipeline: builder.query<ApplicantPipelineStage[], string>({
			query: (companyId) => `/applicant/pipeline/${companyId}`,
			providesTags: [{ type: "Applicant", id: "PIPELINE" }],
		}),
		createApplicant: builder.mutation<Applicant, FormData>({
			query: (formData) => ({
				url: "/applicant",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: (result) => [
				{ type: "Applicant" as const, id: "LIST" },
				...(result
					? [{ type: "Applicant" as const, jobPostId: result.jobPostId }]
					: []),
			],
		}),
		changeApplicantStatus: builder.mutation<
			Applicant,
			{ id: string } & ChangeApplicantStatusRequest
		>({
			query: ({ id, ...body }) => ({
				url: `/applicant/${id}/change-status`,
				method: "PATCH",
				body,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Applicant", id },
				{ type: "Applicant", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetApplicantsQuery,
	useGetApplicantQuery,
	useCreateApplicantMutation,
	useChangeApplicantStatusMutation,
	useGetRecruitmentPipelineQuery,
} = applicantApi;
