import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch(type) {
      case 'success': return 'border-green-500/50 bg-green-500/10 text-green-200';
      case 'error': return 'border-red-500/50 bg-red-500/10 text-red-200';
      default: return 'border-blue-500/50 bg-blue-500/10 text-blue-200';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in-up ${getStyles()}`}>
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;