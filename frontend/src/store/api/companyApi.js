import { apiSlice } from "./apiSlice";

export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: (params) => ({
        url: "/companies",
        params,
      }),
      providesTags: ["Company"],
    }),
    getMyCompanies: builder.query({
      query: () => "/companies/my",
      providesTags: ["Company"],
    }),
    getCompanyById: builder.query({
      query: (id) => `/companies/${id}`,
      providesTags: (result, error, id) => [{ type: "Company", id }],
    }),
    createCompany: builder.mutation({
      query: (companyData) => ({
        url: "/companies",
        method: "POST",
        body: companyData,
      }),
      invalidatesTags: ["Company"],
    }),
    updateCompany: builder.mutation({
      query: ({ id, ...companyData }) => ({
        url: `/companies/${id}`,
        method: "PATCH",
        body: companyData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Company",
        { type: "Company", id },
      ],
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetMyCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companyApi;
