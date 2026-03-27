import { Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 text-primary-500 animate-spin" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
