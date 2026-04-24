import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/react";
import toast from "react-hot-toast";

function Homepage() {
  const { isSignedIn } = useUser();

  return (
    <div>
      {!isSignedIn ? (
        <SignInButton>
          <button className="btn btn-primary">Sign In</button>
        </SignInButton>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <UserButton />
            <SignOutButton>
              <button className="btn btn-secondary">Sign Out</button>
            </SignOutButton>
          </div>

          <br />

          <button
            className="btn btn-primary"
            onClick={() => toast.success("success toast")}
          >
            click me
          </button>
        </>
      )}
    </div>
  );
}

export default Homepage;