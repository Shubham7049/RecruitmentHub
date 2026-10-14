import { apiSlice } from "./apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query({
      query: () => "/admin/stats",
      providesTags: ["Admin"],
    }),
    getAllUsersAdmin: builder.query({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getUserByIdAdmin: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Admin", id }],
    }),
    deleteUserAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin", "User"],
    }),
    deleteJobAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin", "Job"],
    }),
    deleteCompanyAdmin: builder.mutation({
      query: (id) => ({
        url: `/admin/companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin", "Company"],
    }),
    getAllApplicationsAdmin: builder.query({
      query: (params) => ({
        url: "/admin/applications",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getAllInterviewsAdmin: builder.query({
      query: (params) => ({
        url: "/admin/interviews",
        params,
      }),
      providesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useGetAllUsersAdminQuery,
  useGetUserByIdAdminQuery,
  useDeleteUserAdminMutation,
  useDeleteJobAdminMutation,
  useDeleteCompanyAdminMutation,
  useGetAllApplicationsAdminQuery,
  useGetAllInterviewsAdminQuery,
} = adminApi;
