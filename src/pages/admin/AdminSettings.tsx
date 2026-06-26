import { useState } from 'react';
import { Building2, Mail, Globe, Bell, Shield, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import toast from 'react-hot-toast';
import { useAppStore } from '../../store/useAppStore';

export function AdminSettings() {
  const [tab, setTab] = useState('general');
  const [general, setGeneral] = useState({
    timezone: 'America/Los_Angeles',
    officeStart: '08:00',
    officeEnd: '18:00',
  });
  
  const { integrations, toggleIntegration } = useAppStore();

  const handleSave = () => toast.success('Settings saved!');

  return (
    <div id="tour-admin-settings-page" className="max-w-3xl space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-gray-900">Admin Settings</h1>

      <Tabs tabs={[
        { id: 'general', label: 'General' },
        { id: 'email', label: 'Email' },
        { id: 'integrations', label: 'Integrations' },
        { id: 'security', label: 'Security' },
      ]} activeTab={tab} onChange={setTab} />

      {tab === 'general' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Organization Name" defaultValue="GrabDesk Inc." />
              <Input label="Admin Email" defaultValue="admin@grabdesk.io" type="email" />
              <Select label="Timezone" value={general.timezone} options={[
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'Europe/London', label: 'GMT / London' },
                { value: 'Europe/Paris', label: 'Central European Time' },
                { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
              ]} onChange={e => setGeneral(s => ({ ...s, timezone: e.target.value }))} />
              <Select label="Office Hours Start" value={general.officeStart} options={[
                { value: '07:00', label: '7:00 AM' },
                { value: '08:00', label: '8:00 AM' },
                { value: '09:00', label: '9:00 AM' },
              ]} onChange={e => setGeneral(s => ({ ...s, officeStart: e.target.value }))} />
              <Select label="Office Hours End" value={general.officeEnd} options={[
                { value: '17:00', label: '5:00 PM' },
                { value: '18:00', label: '6:00 PM' },
                { value: '20:00', label: '8:00 PM' },
              ]} onChange={e => setGeneral(s => ({ ...s, officeEnd: e.target.value }))} />
              <Button onClick={handleSave} iconLeft={<Save className="w-4 h-4" />}>Save General Settings</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'email' && (
        <Card>
          <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Booking Confirmation', desc: 'Send email when a booking is made', enabled: true },
              { label: 'Check-in Reminder', desc: 'Remind users before their booking', enabled: true },
              { label: 'Cancellation Notice', desc: 'Notify when a booking is cancelled', enabled: true },
              { label: 'Waitlist Updates', desc: 'Notify when a waitlist spot opens', enabled: false },
              { label: 'Weekly Summary', desc: 'Weekly report to admin', enabled: true },
            ].map(({ label, desc, enabled }) => (
              <SettingRow key={label} label={label} desc={desc} enabled={enabled} />
            ))}
            <Button onClick={handleSave}>Save Email Settings</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          {integrations.map(({ name, desc, icon, connected }) => (
            <Card key={name}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <Button
                  size="sm"
                  variant={connected ? 'outline' : 'primary'}
                  onClick={() => toggleIntegration(name)}
                >
                  {connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', desc: 'Require 2FA for admin accounts', enabled: true },
                { label: 'IP Allowlist', desc: 'Restrict access to office IP ranges', enabled: false },
                { label: 'Session Timeout', desc: 'Auto-logout after inactivity', enabled: true },
                { label: 'Audit Log', desc: 'Log all admin actions', enabled: true },
              ].map(({ label, desc, enabled }) => (
                <SettingRow key={label} label={label} desc={desc} enabled={enabled} />
              ))}
              <Button onClick={handleSave}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, desc, enabled }: { label: string; desc: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-sm text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} className={`relative w-12 h-6 rounded-full transition-colors ${on ? 'bg-brand-500' : 'bg-gray-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
