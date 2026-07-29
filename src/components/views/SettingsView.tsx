import { Settings, User, Bell, Shield, Database, Palette, Globe, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const settingsSections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

export function SettingsView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="glass-card p-4 h-fit">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-left"
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Settings */}
          <div className="glass-card p-6">
            <h3 className="text-base font-display font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue="Anderson" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="john.anderson@truckpulse.com" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input defaultValue="Anderson Trucking Co." />
              </div>
              <Button>Save Changes</Button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-card p-6">
            <h3 className="text-base font-display font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Critical Alerts</p>
                  <p className="text-sm text-muted-foreground">Engine faults, tire blowouts, accidents</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Reminders</p>
                  <p className="text-sm text-muted-foreground">Oil changes, tire rotations, inspections</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Fuel Alerts</p>
                  <p className="text-sm text-muted-foreground">Low fuel, theft detection, efficiency reports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Driver Updates</p>
                  <p className="text-sm text-muted-foreground">Check-ins, HOS violations, performance</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Daily summaries and weekly reports</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="glass-card p-6">
            <h3 className="text-base font-display font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <Button variant="secondary">Change Password</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
