import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn />
    </div>
  );
};

export default SignInPage;
