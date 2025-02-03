import RegistrationForm from '@/components/RegistrationForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-200/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-2xl" />
        <div className="absolute w-20 h-20 bg-yellow-200/30 rounded-full top-20 left-20 blur-sm" />
        <div className="absolute w-16 h-16 bg-green-200/30 rounded-full bottom-32 right-32 blur-sm" />
      </div>
      
      <div className="relative max-w-2xl mx-auto p-4 md:p-8">
        <RegistrationForm />
      </div>
    </main>
  );
}