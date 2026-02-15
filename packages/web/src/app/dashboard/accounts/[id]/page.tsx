import { AccountDetailClient } from "./client";

// Placeholder + demo IDs satisfy static export mode requirement for dynamic routes.
// All account pages are rendered client-side via useParams() + API fetch.
// Non-demo IDs are accessed via client-side navigation from the dashboard.
export function generateStaticParams() {
  return [
    { id: "_" },
    { id: "demo-acc-001" },
    { id: "demo-acc-002" },
    { id: "demo-acc-003" },
  ];
}

export default function AccountDetailPage() {
  return <AccountDetailClient />;
}
