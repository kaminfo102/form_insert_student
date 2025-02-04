import RegistrationForm from '@/components/RegistrationForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a472a] relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ffd700]/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-[#ffeb3b]/15 rounded-full blur-2xl animate-float-medium" />
        <div className="absolute -bottom-32 right-1/4 w-88 h-88 bg-[#fff59d]/10 rounded-full blur-2xl animate-float-fast" />
        
        {/* Small decorative elements */}
        <div className="absolute w-24 h-24 bg-[#ffeb3b]/20 rounded-full top-24 left-24 blur-sm animate-pulse" />
        <div className="absolute w-16 h-16 bg-[#ffd700]/25 rounded-full bottom-36 right-36 blur-sm animate-pulse-slow" />
        
        {/* Abstract shapes */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-[#fff59d]/15 rotate-45 transform skew-x-12 animate-float-medium" />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-[#ffd700]/10 rounded-tr-[100px] animate-float-slow" />
        
        {/* Floating dots */}
        <div className="absolute w-4 h-4 bg-[#ffeb3b]/40 rounded-full top-1/4 right-1/3 animate-bounce-slow" />
        <div className="absolute w-3 h-3 bg-[#ffd700]/40 rounded-full bottom-1/3 left-1/4 animate-bounce-medium" />
        <div className="absolute w-2 h-2 bg-[#fff59d]/40 rounded-full top-2/3 right-1/2 animate-bounce-fast" />
      </div>
      
      <div className="relative max-w-2xl mx-auto p-4 md:p-8">
        <RegistrationForm />
      </div>
    </main>
  );
}