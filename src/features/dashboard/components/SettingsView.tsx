"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { appConfig } from "@/config/app.config";

export function SettingsView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="System configuration and preferences"
      />
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>General application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Application Name</Label>
                <p className="text-sm text-muted-foreground">{appConfig.fullName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Country</Label>
                <p className="text-sm text-muted-foreground">{appConfig.country}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Prototype Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Using mock data repositories
                </p>
              </div>
              <Switch checked={appConfig.useMockData} disabled />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email notifications</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Chief approval alerts</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Audit log digests</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
