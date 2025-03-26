import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ITask } from "../types";

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery(
        {
            baseUrl: 'http://localhost:5000/api',
            prepareHeaders: (headers) => {
                return headers;
            },
            credentials: 'include'
        }
    ),
    tagTypes: ['Task'],
    endpoints: (builder) => ({
        fetchSignIn: builder.mutation({
            query: (userData) => ({
                url: '/auth/sign-in',
                method: 'POST',
                body: userData
            })
        }),
        fetchSignUp: builder.mutation({
            query: (userData) => ({
                url: '/auth/sign-up',
                method: 'POST',
                body: userData
            })
        }),
        fetchAllTasks: builder.query<ITask[], void>({
            query: () => '/tasks',
            providesTags: ['Task'],
        }),
        deleteTask: builder.mutation({
            query: (taskData) => ({
                url: '/deleteTask',
                method: 'DELETE',
                body: taskData
            }),
            invalidatesTags: ['Task'],
        }),
        fetchCreateTask: builder.mutation({
            query: (taskData) => ({
                url: '/tasks',
                method: 'POST',
                body: taskData
            }),
            invalidatesTags: ['Task'],
        }),
        fetchEditTask: builder.mutation({
            query: (taskData) => ({
                url: `/tasks/${taskData.id}`,
                method: 'PUT',
                body: taskData
            }),
            invalidatesTags: ['Task']
        }),
        fetchLogout: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST'
            })
        })
    })
})

export const { useFetchAllTasksQuery, useDeleteTaskMutation, useFetchCreateTaskMutation, useFetchSignUpMutation, useFetchSignInMutation, useFetchEditTaskMutation, useFetchLogoutMutation } = apiSlice