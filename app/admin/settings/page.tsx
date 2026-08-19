import { Truck, Bell, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlatformSettings } from "@/lib/actions/settings";
import { serializeDoc } from "@/lib/firestore/serialize";
import { GeneralSettingsForm } from "./general-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rawSettings = await getPlatformSettings();
  const settings = rawSettings ? serializeDoc(rawSettings) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Platform-wide configuration." />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="max-w-2xl">
            <GeneralSettingsForm settings={settings} />
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <EmptyState
            icon={Truck}
            title="Delivery configuration ships with the Deliveries module"
            description="Yango integration, delivery fee rules, and pickup configuration will live here."
          />
        </TabsContent>

        <TabsContent value="notifications">
          <EmptyState
            icon={Bell}
            title="Notification channel settings coming soon"
            description="Email, SMS, and push notification configuration will live here."
          />
        </TabsContent>

        <TabsContent value="security">
          <EmptyState
            icon={ShieldAlert}
            title="Security settings are Super Admin only"
            description="Session policy, password rules, and access controls will live here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
