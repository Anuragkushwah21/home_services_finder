// components/shared/LoadingSpinner.tsx
'use client';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  label = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={
        fullScreen
          ? 'flex items-center justify-center min-h-[50vh]'
          : 'flex items-center justify-center py-8'
      }
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        {label && (
          <p className="text-sm text-gray-500">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}