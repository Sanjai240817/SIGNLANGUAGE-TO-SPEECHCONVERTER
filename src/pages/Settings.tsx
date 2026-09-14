import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';

import {
  ArrowLeft,
  Lock,
  LogOut,
  Mail,
  Save,
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }
    };

    loadUser();
  }, []);

  // Change password
  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Password updated successfully.');

    setNewPassword('');
  };

  // Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Logged out successfully.');

    navigate('/auth', {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">

      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold">
              Settings
            </h1>

            <p className="text-muted-foreground">
              Manage your SignSpeak AI account
            </p>
          </div>

        </div>

        {/* Account */}
        <Card className="mb-6">

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>

          <CardContent>

            <Label htmlFor="email">
              Email address
            </Label>

            <Input
              id="email"
              value={email}
              disabled
              className="mt-2"
            />

            <p className="mt-2 text-sm text-muted-foreground">
              This is the email address associated with your SignSpeak AI account.
            </p>

          </CardContent>

        </Card>

        {/* Change Password */}
        <Card className="mb-6">

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div>

              <Label htmlFor="new-password">
                New password
              </Label>

              <Input
                id="new-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2"
              />

            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={loading || !newPassword}
            >

              <Save className="mr-2 h-4 w-4" />

              {loading
                ? 'Updating...'
                : 'Update Password'}

            </Button>

          </CardContent>

        </Card>

        {/* Logout */}
        <Card>

          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>

          <CardContent>

            <p className="mb-4 text-sm text-muted-foreground">
              Sign out of your SignSpeak AI account on this device.
            </p>

            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>

          </CardContent>

        </Card>

      </div>

    </div>
  );
};

export default Settings;