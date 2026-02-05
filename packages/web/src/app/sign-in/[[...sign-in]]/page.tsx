import { SignIn } from "@clerk/nextjs";

export function generateStaticParams() {
  // Required for `output: "export"` with optional catch-all routes.
  return [{ "sign-in": [] as string[] }];
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}
