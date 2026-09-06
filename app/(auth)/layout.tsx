export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-zilla text-3xl text-[var(--foreground)]">AddBrokr</h1>
        </div>
        <div className="border border-[var(--border)] bg-[var(--bg-surface)] rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}