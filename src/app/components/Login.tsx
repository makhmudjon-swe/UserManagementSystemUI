import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (err: any) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Login failed';
      
      if (status === 401 && (errorMessage.includes('incorrect') || errorMessage.includes('Email or Password'))) {
        // Account doesn't exist or wrong credentials
        toast.error('Account does not exist or incorrect credentials. Would you like to register?', {
          action: {
            label: 'Register',
            onClick: () => navigate('/register')
          }
        });
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (status === 403 && errorMessage.includes('blocked')) {
        toast.error('Your account is blocked. Contact administrator.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-8">
          <h2 className="text-center mb-6">Sign in</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>



            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center text-sm mt-4">
              <Link
                to="/register"
                className="text-primary hover:underline"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
