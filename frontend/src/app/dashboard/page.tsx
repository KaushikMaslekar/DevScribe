"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { me } from "@/lib/auth-api";
import { clearAccessToken } from "@/lib/auth-storage";

export default function DashboardPage() {
  const router = useRouter();
  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: me,
  });

  function handleLogout() {
    clearAccessToken();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-14 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your writing control center.
      </p>

      <div className="mt-6 rounded-xl border bg-card p-6 text-card-foreground">
        {profileQuery.isLoading ? <p>Loading profile...</p> : null}
        {profileQuery.isError ? (
          <p className="text-red-500">Session expired. Please sign in again.</p>
        ) : null}
        {profileQuery.data ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">User:</span>{" "}
              {profileQuery.data.username}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {profileQuery.data.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              {profileQuery.data.role}
            </p>
          </div>
        ) : null}

        <Button variant="outline" className="mt-5" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </main>
  );
}
