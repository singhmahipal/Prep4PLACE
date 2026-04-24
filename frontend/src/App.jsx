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

function App() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return null; 
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
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
