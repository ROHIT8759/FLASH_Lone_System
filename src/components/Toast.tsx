import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const getToastStyles = () => {
        const baseStyles = "fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 z-50 transform transition-all duration-300 ease-in-out";

        switch (type) {
            case 'success':
                return `${baseStyles} border-green-500`;
            case 'error':
                return `${baseStyles} border-red-500`;
            case 'warning':
                return `${baseStyles} border-yellow-500`;
            case 'info':
                return `${baseStyles} border-blue-500`;
            default:
                return `${baseStyles} border-gray-500`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
                return 'text-blue-800';
            default:
                return 'text-gray-800';
        }
    };

    return (
        <div className={getToastStyles()}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <span className="text-lg">{getIcon()}</span>
                </div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${getTextColor()}`}>
                        {message}
                    </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className={`inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${getTextColor()}`}
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
