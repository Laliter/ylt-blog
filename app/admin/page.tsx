import type { Metadata } from "next";
import { AdminConsole } from "@/components/AdminConsole";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="site-shell admin-shell" id="top">
      <main className="admin-page page-frame">
        <AdminConsole />
      </main>
    </div>
  );
}
