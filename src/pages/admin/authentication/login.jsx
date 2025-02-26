import React, { useEffect } from 'react';
import { useRouter } from 'next/router'; 
import AdminHeader from "../components/adminHeader";
import LoginForm from "../components/loginForm";
import AdminFooter from "../components/adminfooter";

const Login = () => {

  return (
    <div>
      <AdminHeader />
      <LoginForm />
      <AdminFooter />
    </div>
  );
};

export default Login;
