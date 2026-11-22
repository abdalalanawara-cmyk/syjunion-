import { useState } from 'react';
import { Shield } from 'lucide-react';

interface UnionLogoProps {
  className?: string;
  variant?: 'on-dark' | 'on-light';
}

export function UnionLogo({ className = 'h-12 w-auto', variant = 'on-dark' }: UnionLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="inline-flex items-center gap-2 font-extrabold text-sm">
        <Shield className="w-6 h-6 text-[#c9a24a]" />
        <span className={variant === 'on-dark' ? 'text-white' : 'text-[#062a1e]'}>
          اتحاد الصحفيين السوريين
        </span>
      </span>
    );
  }

  return (
    <img
      src="/assets/aistudio/images-removebg-preview_9e45e89e.png"
      alt="شعار اتحاد الصحفيين السوريين"
      onError={() => setFailed(true)}
      className={`object-contain select-none ${
        variant === 'on-light' ? 'brightness-0' : ''
      } ${className}`}
    />
  );
}

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackTitle = 'اتحاد الصحفيين السوريين',
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0b3d2a] via-[#0f5a3c] to-[#062a1e] text-center p-6 ${className}`}
      >
        <Shield className="w-8 h-8 text-[#c9a24a] mb-2" />
        <p className="text-sm font-bold text-white">{fallbackTitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
