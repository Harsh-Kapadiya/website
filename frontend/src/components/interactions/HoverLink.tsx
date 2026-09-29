import { ReactNode } from 'react';

export function HoverLink({
  children,
  className = '',
  ...props
}: { children: ReactNode; className?: string } & React.ComponentProps<'a'>) {
  return (
    <a data-cursor="hover" className={`relative group/link inline-block ${className}`} {...props}>
      {children}
      <span className="absolute left-0 -bottom-1 h-px w-full bg-current scale-x-0 origin-left transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
    </a>
  );
}
