import { Clock } from 'lucide-react';
import { useContentBlocks } from '@/hooks/useContentBlocks';

/** The response-time promise, editable at Page copy → home / contact → response_time. */
export function ResponseTime({ className = '' }: { className?: string }) {
  const { get } = useContentBlocks('home');
  return (
    <span className={`inline-flex items-center gap-1.5 text-emerald-300/90 ${className}`}>
      <Clock size={13} aria-hidden />
      {get('contact', 'response_time', 'I reply within 24 hours')}
    </span>
  );
}
