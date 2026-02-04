import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
