"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-8 text-center border border-gray-200">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to view this page. Please contact your administrator if you
          believe this is a mistake.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full">Go to Homepage</Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" className="w-full">
              Back to Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

