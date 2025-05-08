import { LoginForm } from '@/components/auth/login-form';
import Header from '@/components/Header';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <LoginForm handleLogin={handleLogin} />
      </main>
    </div>
  );
}


const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password
    });
    
    // Store the token in localStorage
    // After successful login
    localStorage.setItem('token', response.data.token);
    
    // Store user data in context or state
    setUser(response.data.user);
    
    // Redirect to dashboard or home page
    navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    setError(error.response?.data?.message || 'Login failed');
  }
};
