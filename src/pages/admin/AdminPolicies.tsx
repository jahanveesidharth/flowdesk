import { useState } from 'react';
import { Shield, Save, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { BOOKING_POLICY } from '../../data/mockData';
import toast from 'react-hot-toast';

export function AdminPolicies() {
  const [policy, setPolicy] = useState({ ...BOOKING_POLICY });

  const handleSave = () => {
    toast.success('Policy saved successfully!');
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Booking Policies</h1>
        <Button iconLeft={<Save className="w-4 h-4" />} onClick={handleSave}>Save Policies</Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          These policies apply to all users and resource types. Changes take effect immediately.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Booking Rules</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Advance Booking (days)"
              type="number"
              value={String(policy.maxAdvanceDays)}
              onChange={e => setPolicy({ ...policy, maxAdvanceDays: parseInt(e.target.value) })}
              hint="How far ahead users can book"
            />
            <Input
              label="Max Duration (hours)"
              type="number"
              value={String(policy.maxDurationHours)}
              onChange={e => setPolicy({ ...policy, maxDurationHours: parseInt(e.target.value) })}
              hint="Max hours per single booking"
            />
            <Input
              label="Max Concurrent Bookings"
              type="number"
              value={String(policy.maxConcurrentBookings)}
              onChange={e => setPolicy({ ...policy, maxConcurrentBookings: parseInt(e.target.value) })}
              hint="Max active bookings per user"
            />
            <Input
              label="Max Bookings Per Day"
              type="number"
              value={String(policy.maxBookingsPerDay)}
              onChange={e => setPolicy({ ...policy, maxBookingsPerDay: parseInt(e.target.value) })}
              hint="Max bookings a user can make per day"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Check-in Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Check-in Window (minutes)"
              type="number"
              value={String(policy.checkInWindowMinutes)}
              onChange={e => setPolicy({ ...policy, checkInWindowMinutes: parseInt(e.target.value) })}
              hint="How early users can check in"
            />
            <Input
              label="Auto-release After (minutes)"
              type="number"
              value={String(policy.autoReleaseMinutes)}
              onChange={e => setPolicy({ ...policy, autoReleaseMinutes: parseInt(e.target.value) })}
              hint="Release desk if no check-in"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recurring Bookings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <p className="font-medium text-sm text-gray-900">Allow Recurring Bookings</p>
              <p className="text-xs text-gray-500">Let users set up repeating bookings</p>
            </div>
            <button
              onClick={() => setPolicy({ ...policy, allowRecurring: !policy.allowRecurring })}
              className={`relative w-12 h-6 rounded-full transition-colors ${policy.allowRecurring ? 'bg-brand-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${policy.allowRecurring ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {policy.allowRecurring && (
            <Input
              label="Max Recurring Weeks"
              type="number"
              value={String(policy.maxRecurringWeeks)}
              onChange={e => setPolicy({ ...policy, maxRecurringWeeks: parseInt(e.target.value) })}
              hint="Max duration for recurring series"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Approval Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm text-gray-900">Require Manager Approval</p>
              <p className="text-xs text-gray-500">All bookings must be approved by a manager</p>
            </div>
            <button
              onClick={() => setPolicy({ ...policy, requiresApproval: !policy.requiresApproval })}
              className={`relative w-12 h-6 rounded-full transition-colors ${policy.requiresApproval ? 'bg-brand-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${policy.requiresApproval ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} iconLeft={<Save className="w-4 h-4" />}>Save All Policies</Button>
        <Button variant="outline" onClick={() => setPolicy({ ...BOOKING_POLICY })}>Reset to Defaults</Button>
      </div>
    </div>
  );
}
