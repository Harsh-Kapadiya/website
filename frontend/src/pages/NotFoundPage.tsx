import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 pt-20">
      <p className="text-white/30 mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
        404
      </p>
      <h1 className="text-white tracking-tight mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 500 }}>
        Page not found
      </h1>
      <Link to="/" className="text-white/50 hover:text-white transition-colors underline underline-offset-4">
        Back home
      </Link>
    </div>
  );
}
