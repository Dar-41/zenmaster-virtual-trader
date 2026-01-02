'use client';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isConnected ? 'bg-green-600' : 'bg-red-600'
        } text-white text-sm shadow-lg`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-300 animate-pulse' : 'bg-red-300'
          }`}
        />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
}

