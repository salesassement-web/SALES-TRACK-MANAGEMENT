import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = "w-10 h-10" }) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Simple hash for consistent color
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
    'bg-rose-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = colors[Math.abs(hash) % colors.length];

  if (src && src.startsWith('data:')) {
      // Only allow data URIs (local uploads) to prevent CORS issues with external images
      return <img src={src} alt={name} className={`${className} rounded-full object-cover`} />;
  }

  // If src is present but not data URI (legacy), ignore it and render fallback to stay safe for PDF
  // Or if src is empty

  return (
    <div className={`${className} rounded-full ${colorClass} flex items-center justify-center text-white font-bold shadow-sm border border-white/20 shrink-0`}>
      <span style={{ fontSize: '0.4em' }} className="leading-none">{initials}</span>
    </div>
  );
};