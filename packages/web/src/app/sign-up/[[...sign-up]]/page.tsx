import { SignUp } from "@clerk/nextjs";

export function generateStaticParams() {
  // Required for `output: "export"` with optional catch-all routes.
  return [{ "sign-up": [] as string[] }];
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}
