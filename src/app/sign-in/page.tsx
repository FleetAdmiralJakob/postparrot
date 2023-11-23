import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignIn />
    </div>
  );
};

export default SignInPage;
