import { useState, useEffect } from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/react";
import { Navigate, Routes } from "react-router";
import { Route } from "react-router";
import Homepage from "./Pages/HomePage.jsx";
import ProblemPage from "./Pages/ProblemPage.jsx";
import ProblemsPage from "./Pages/ProblemsPage.jsx";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./Pages/DashboardPage.jsx";
import axiosInstance from "./lib/axios";
import SessionPage from "./Pages/SessionPage.jsx";

function App() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error setting Clerk auth header:", error);
      }
      return config;
    });
    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  // this will get rid of flickering effect
  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <Homepage /> : <Navigate to={"/dashboard"} />}
        />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />}
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
