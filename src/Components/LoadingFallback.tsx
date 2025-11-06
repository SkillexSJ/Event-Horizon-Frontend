export default function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-brand-text-dim">Loading...</p>
      </div>
    </div>
  );
}
