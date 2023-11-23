import { SignUp } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp />
    </div>
  );
};

export default SignInPage;
