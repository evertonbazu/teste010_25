
import React from 'react';

const Loader: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`w-8 h-8 border-4 border-white border-t-blue-500 border-solid rounded-full animate-spin ${className}`}></div>
    );
};

export default Loader;
