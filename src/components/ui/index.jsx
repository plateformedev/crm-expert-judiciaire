// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS UI DE BASE
// ============================================================================

import React from 'react';
import { X } from 'lucide-react';
import { DS } from '../../data';

// ============================================================================
// CARD
// ============================================================================

export const Card = ({ 
  children, 
  className = '', 
  premium = false, 
  onClick = null,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl border transition-all duration-200';
  const premiumClasses = premium 
    ? 'border-[#c9a227]/30 shadow-lg shadow-[#c9a227]/5' 
    : 'border-[#e5e5e5] hover:border-[#d4d4d4] hover:shadow-md';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseClasses} ${premiumClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// BADGE
// ============================================================================

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-[#f5f5f5] text-[#525252]',
    gold: 'bg-[#f5e6c8] text-[#8b7019]',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// ============================================================================
// BUTTON
// ============================================================================

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#1a1a1a] text-white hover:bg-[#0d0d0d] disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3]',
    secondary: 'bg-white border border-[#e5e5e5] text-[#525252] hover:border-[#1a1a1a] hover:text-[#1a1a1a]',
    gold: 'bg-[#c9a227] text-white hover:bg-[#d4af37]',
    ghost: 'bg-transparent text-[#525252] hover:bg-[#f5f5f5]',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4" />}
    </button>
  );
};

// ============================================================================
// INPUT
// ============================================================================

export const Input = ({ 
  label,
  error,
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
        )}
        <input
          className={`
            w-full px-4 py-3 border rounded-xl transition-all
            focus:outline-none focus:border-[#1a1a1a]
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:border-red-500' : 'border-[#e5e5e5]'}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================================================
// SELECT
// ============================================================================

export const Select = ({ 
  label,
  options = [],
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 border rounded-xl bg-white transition-all
          focus:outline-none focus:border-[#1a1a1a]
          ${error ? 'border-red-300 focus:border-red-500' : 'border-[#e5e5e5]'}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================================================
// TEXTAREA
// ============================================================================

export const Textarea = ({ 
  label,
  error,
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-[#a3a3a3] block mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all resize-none
          focus:outline-none focus:border-[#1a1a1a]
          ${error ? 'border-red-300 focus:border-red-500' : 'border-[#e5e5e5]'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================================================
// MODAL BASE
// ============================================================================

export const ModalBase = ({ 
  children, 
  onClose, 
  title,
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[90vw]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`
        relative bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e5e5]">
          <h2 className="text-xl font-medium text-[#1a1a1a]">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#f5f5f5] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#737373]" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TABS
// ============================================================================

export const Tabs = ({ 
  tabs, 
  activeTab, 
  onChange,
  className = '' 
}) => {
  return (
    <div className={`flex gap-1 bg-[#f5f5f5] p-1 rounded-xl ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${activeTab === tab.id 
              ? 'bg-white text-[#1a1a1a] shadow-sm' 
              : 'text-[#737373] hover:text-[#1a1a1a]'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'gold',
  size = 'md',
  showLabel = true,
  className = '' 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    gold: 'bg-[#c9a227]',
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500'
  };
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-[#737373]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-[#e5e5e5] rounded-full overflow-hidden ${heights[size]}`}>
        <div 
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// TOOLTIP
// ============================================================================

export const Tooltip = ({ 
  children, 
  content,
  position = 'top' 
}) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  
  return (
    <div className="relative group">
      {children}
      <div className={`
        absolute ${positions[position]} px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all whitespace-nowrap z-50
      `}>
        {content}
      </div>
    </div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

export const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-[#f5f5f5] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-[#a3a3a3]" />
        </div>
      )}
      <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">{title}</h3>
      {description && <p className="text-[#737373] mb-4">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${className}`} 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );
};

// ============================================================================
// INDEX EXPORT
// ============================================================================

export default {
  Card,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  ModalBase,
  Tabs,
  ProgressBar,
  Tooltip,
  EmptyState,
  LoadingSpinner
};
