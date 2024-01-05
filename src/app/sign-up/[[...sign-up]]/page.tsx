import { SignUp } from "@clerk/nextjs";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

const SignUpPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
};

export default SignUpPage;
