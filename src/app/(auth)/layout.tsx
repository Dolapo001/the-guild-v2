export default function AuthLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-[#08090e] p-4 relative overflow-hidden">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08)_0%,transparent_70%)] -z-10" />

 <div className="w-full max-w-md space-y-8">
 {children}
 </div>
 </div>
 );
}