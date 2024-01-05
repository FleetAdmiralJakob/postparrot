import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;
