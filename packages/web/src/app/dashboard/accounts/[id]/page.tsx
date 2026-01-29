import { AccountDetailClient } from "./client";

// Placeholder param satisfies output: "export" requirement for dynamic routes.
// All account pages are rendered client-side via useParams() + API fetch.
export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function AccountDetailPage() {
  return <AccountDetailClient />;
}
