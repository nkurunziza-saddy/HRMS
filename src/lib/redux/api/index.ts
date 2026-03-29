import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const hrmsApi = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl:
			import.meta.env.VITE_APP_API_URL || "http://84.247.172.162:7009/api/v1",
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth.token;
			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: [
		"Company",
		"User",
		"Category",
		"Auth",
		"Department",
		"DepartmentReference",
		"JobTitle",
		"JobPosting",
		"Applicant",
		"Employee",
		"Compliance",
	],
	endpoints: () => ({}),
});
