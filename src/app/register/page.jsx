"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import API from "@/lib/api";
import axios from "axios";
import { signIn } from "next-auth/react";

const registerSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  avatar: Yup.mixed()
    .test('fileSize', 'The file is too large', (value) => {
        if (!value.length) return true;
        return value[0].size <= 2000000;
    })
});

const RegisterPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
        let avatarUrl = null;
        if (data.avatar && data.avatar.length > 0) {
            const formData = new FormData();
            formData.append('avatar', data.avatar[0]);
            const response = await axios.post('/api/upload/avatar', formData);
            avatarUrl = response.data.url;
        }

        await API.post('/auth/register', {
            username: data.username,
            email: data.email,
            password: data.password,
            avatar: avatarUrl,
        });

        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (result.error) {
            toast.error("Login failed after registration.");
        } else {
            toast.success("Registration successful! Welcome.");
            router.push('/');
        }
    } catch (err) {
        toast.error(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Create an Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                    id="username"
                    {...register("username")} 
                    className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                    id="email"
                    type="email" 
                    {...register("email")} 
                    className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    id="password"
                    type="password" 
                    {...register("password")} 
                    className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Avatar (Optional)</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    {...register("avatar")} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-50 hover:file:bg-gray-100"
                />
                {errors.avatar && <p className="text-xs text-red-600 mt-1">{errors.avatar.message}</p>}
            </div>
            <button 
                type="submit" 
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
            >
                Sign Up
            </button>
        </form>
        <p className="text-sm text-center">
          Already have an account? <Link href="/login" className="font-medium text-blue-600">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;