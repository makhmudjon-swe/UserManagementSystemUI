import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function Registration() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful! Please check your email for confirmation.');
      setName('');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        navigate('/login');
        toast.info('Redirecting to login...');
      }, 2000);
    } catch (err: any) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      
      if (status === 409 || errorMessage.includes('already exists') || errorMessage.includes('email')) {
        toast.error('This email is already registered! Redirecting to login...', {
          action: {
            label: 'Login Now',
            onClick: () => navigate('/login')
          }
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (status === 500) {
        toast.error('Server error occurred. Please try again later.');
        setErrors({ general: 'Internal server error. Please try again.' });
      } else {
        toast.error(errorMessage);
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-8">
          <h2 className="text-center mb-6">Create account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2 text-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-input-background rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
              />
              {errors.name && (
                <div className="text-destructive text-sm mt-1">
                  {errors.name}
                </div>
              )}
              {errors.name && (
                <div className="text-destructive text-sm mt-1">
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-input-background rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
              {errors.email && (
                <div className="text-destructive text-sm mt-1">
                  {errors.email}
                </div>
              )}
              {errors.email && (
                <div className="text-destructive text-sm mt-1">
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-input-background rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
              {errors.password && (
                <div className="text-destructive text-sm mt-1">
                  {errors.password}
                </div>
              )}
              {errors.password && (
                <div className="text-destructive text-sm mt-1">
                  {errors.password}
                </div>
              )}
            </div>

            {errors.general && (
              <div className="text-destructive text-sm mt-2">
                {errors.general}
              </div>
            )}

            {errors.general && (
              <div className="text-destructive text-sm mt-2">
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="text-center text-sm mt-4">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
