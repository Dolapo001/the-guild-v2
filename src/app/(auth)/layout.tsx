export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 -z-10" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    );
}
