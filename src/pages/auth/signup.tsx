import { SignupForm } from '@/components/auth/signup-form';
import Header from '@/components/Header';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <SignupForm />
      </main>
    </div>
  );
}
