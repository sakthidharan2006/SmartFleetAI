import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Truck, User, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'owner' | 'driver'>('driver');
  const [signupError, setSignupError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Validate
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setLoginError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setLoginError('Invalid email or password. Please try again.');
      } else {
        setLoginError(error.message);
      }
      return;
    }

    toast.success('Welcome back!');
    navigate('/');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    
    // Validate
    try {
      nameSchema.parse(signupName);
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setSignupError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setSignupError('This email is already registered. Please log in instead.');
      } else {
        setSignupError(error.message);
      }
      return;
    }

    toast.success('Account created successfully!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary">
          <Truck className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-foreground tracking-tight">TruckPulse</h1>
          <p className="text-sm text-muted-foreground font-medium">Pro Fleet Manager</p>
        </div>
      </div>

      <Card className="w-full max-w-md glass-card-elevated">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Welcome to TruckPulse</CardTitle>
          <CardDescription>
            Sign in to manage your fleet or create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-sm text-danger">
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Anderson"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup 
                    value={signupRole} 
                    onValueChange={(v) => setSignupRole(v as 'owner' | 'driver')}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="role-owner"
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        signupRole === 'owner' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <RadioGroupItem value="owner" id="role-owner" className="sr-only" />
                      <Shield className="w-6 h-6 text-primary" />
                      <span className="font-medium">Fleet Owner</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Full access to all vehicles & analytics
                      </span>
                    </Label>
                    <Label
                      htmlFor="role-driver"
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        signupRole === 'driver' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <RadioGroupItem value="driver" id="role-driver" className="sr-only" />
                      <User className="w-6 h-6 text-primary" />
                      <span className="font-medium">Driver</span>
                      <span className="text-xs text-muted-foreground text-center">
                        View assigned vehicles & trips
                      </span>
                    </Label>
                  </RadioGroup>
                </div>

                {signupError && (
                  <div className="flex items-center gap-2 text-sm text-danger">
                    <AlertCircle className="w-4 h-4" />
                    {signupError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground text-center max-w-md">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
