"use client";

import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/features/user-profile-management";
import { SlackSettingsSection } from "@/features/slack-integration";

export function UserSettingsWidget() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile information and preferences
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-8">
            <ProfileForm />
            <SlackSettingsSection />
          </div>
        </div>
      </div>
    </div>
  );
}
