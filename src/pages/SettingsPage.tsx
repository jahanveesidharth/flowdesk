import { useState } from 'react';
import { User, Bell, Shield, Building2, Moon, Sun, Globe } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { currentUser, switchRole, isAdminMode, floors } = useAppStore();
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [department, setDepartment] = useState(currentUser.department);
  const [notifs, setNotifs] = useState(currentUser.preferences.notificationsEnabled);
  const [emailReminders, setEmailReminders] = useState(currentUser.preferences.emailReminders);
  const [reminderMins, setReminderMins] = useState(String(currentUser.preferences.reminderMinutes));

  const handleSave = () => {
    toast.success('Settings saved!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
          { id: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
          { id: 'account', label: 'Account', icon: <Shield className="w-4 h-4" /> },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === 'profile' && (
        <Card>
          <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={currentUser.name} size="xl" />
              <div>
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
                <Button variant="outline" size="xs" className="mt-2">Change Photo</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
              <Input label="Department" value={department} onChange={e => setDepartment(e.target.value)} />
              <Select label="Role" value={currentUser.role} options={[
                { value: 'employee', label: 'Employee' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' },
              ]} onChange={() => {}} disabled />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Push Notifications', desc: 'Receive in-app notifications', value: notifs, onChange: setNotifs },
              { label: 'Email Reminders', desc: 'Get email reminders for bookings', value: emailReminders, onChange: setEmailReminders },
            ].map(({ label, desc, value, onChange }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <button
                  onClick={() => onChange(!value)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-brand-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
            <Select
              label="Reminder Time"
              value={reminderMins}
              onChange={e => setReminderMins(e.target.value)}
              options={[
                { value: '15', label: '15 minutes before' },
                { value: '30', label: '30 minutes before' },
                { value: '60', label: '1 hour before' },
                { value: '120', label: '2 hours before' },
              ]}
            />
            <Button onClick={handleSave}>Save Preferences</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'preferences' && (
        <Card>
          <CardHeader><CardTitle>App Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-sm text-gray-900">Theme</p>
                <p className="text-xs text-gray-500">Choose your display theme</p>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[{ icon: <Sun className="w-4 h-4" />, label: 'Light' }, { icon: <Moon className="w-4 h-4" />, label: 'Dark' }].map(t => (
                  <button key={t.label} className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-white shadow text-gray-900">
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Select 
              label="Default Floor" 
              value={currentUser.preferences.defaultFloorId || ''} 
              onChange={() => {}} 
              options={floors.map(f => ({ value: f.id, label: f.name }))} 
            />
            <Button onClick={handleSave}>Save Preferences</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'account' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Role & Permissions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">Current Mode</p>
                  <p className="text-xs text-gray-500">{isAdminMode ? 'Admin mode — full access' : 'Employee mode — standard access'}</p>
                </div>
                <Button variant={isAdminMode ? 'secondary' : 'primary'} size="sm" onClick={switchRole}>
                  Switch to {isAdminMode ? 'Employee' : 'Admin'} Mode
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">These actions are irreversible. Please proceed with caution.</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="text-red-500 border-red-200">Delete all bookings</Button>
                <Button variant="danger" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
