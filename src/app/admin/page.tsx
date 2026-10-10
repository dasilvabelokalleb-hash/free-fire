import { AdminDashboard } from "@/components/admin";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  return <AdminDashboard initialAuthenticated={authenticated} />;
}
