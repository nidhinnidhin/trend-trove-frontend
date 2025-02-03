import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; 
import AdminHeader from "../components/adminHeader";
import LoginForm from "../components/loginForm";
import AdminFooter from "../components/adminfooter";

const Login = () => {
  const router = useRouter();
  useEffect(() => {
    // Check if the admin token is present in localStorage
    const token = localStorage.getItem("admintoken");

    // If token exists, redirect to the dashboard
    if (token) {
      router.push("/admin/dashboard/dashboard");
    }
  }, [router]);

  return (
    <div>
      <AdminHeader />
      <LoginForm />
      <AdminFooter />
    </div>
  );
};

export default Login;
