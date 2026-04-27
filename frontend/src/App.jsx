import { useState } from "react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/react";
import { Navigate, Routes } from "react-router";
import { Route } from "react-router";
import Homepage from "./Pages/HomePage.jsx";
import ProblemPage from "./Pages/ProblemsPage.jsx";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./Pages/DashboardPage.jsx";

function App() {
  const { isLoaded, isSignedIn } = useUser();

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
          path="/"
          element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />}
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
