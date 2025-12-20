// ============================================================================
// CRM EXPERT JUDICIAIRE - COMPOSANTS UI DE BASE
// Style Google / Material Design 3
// ============================================================================

import React from 'react';
import { X } from 'lucide-react';
import { DS } from '../../data';

// ============================================================================
// CARD - Style Google (ombres douces, pas de bordures, très arrondi)
// ============================================================================

export const Card = ({
  children,
  className = '',
  variant = 'elevated', // elevated, outlined, filled
  premium = false,
  onClick = null,
  hover = true,
  ...props
}) => {
  const variants = {
    elevated: `bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]
               ${hover && onClick ? 'hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]' : ''}`,
    outlined: 'bg-white border border-[#dadce0]',
    filled: 'bg-[#f1f3f4]'
  };

  const premiumStyle = premium
    ? 'ring-1 ring-[#c9a227]/30 shadow-[0_1px_3px_0_rgba(201,162,39,0.2),0_4px_8px_3px_rgba(201,162,39,0.1)]'
    : '';

  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        rounded-3xl transition-all duration-200
        ${variants[variant]}
        ${premiumStyle}
        ${clickableClasses}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// BADGE - Style Google (couleurs douces, très arrondi)
// ============================================================================

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-[#e8eaed] text-[#3c4043]',
    gold: 'bg-[#fef9e7] text-[#a68618]',
    success: 'bg-[#e6f4ea] text-[#1e8e3e]',
    warning: 'bg-[#fef7e0] text-[#f29900]',
    error: 'bg-[#fce8e6] text-[#d93025]',
    info: 'bg-[#e8f0fe] text-[#1967d2]',
    purple: 'bg-[#f3e8fd] text-[#8430ce]'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
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
// BUTTON - Style Google (coins arrondis, ombres au hover)
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
    primary: `bg-[#c9a227] text-white hover:bg-[#a68618] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]
              active:bg-[#8b7019] disabled:bg-[#e8eaed] disabled:text-[#9aa0a6]`,
    secondary: `bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4] hover:border-[#dadce0]
                active:bg-[#e8eaed] disabled:bg-[#f1f3f4] disabled:text-[#9aa0a6]`,
    filled: `bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] active:bg-[#aecbfa]`,
    ghost: `bg-transparent text-[#5f6368] hover:bg-[#f1f3f4] active:bg-[#e8eaed]`,
    danger: `bg-[#ea4335] text-white hover:bg-[#d93025] active:bg-[#c5221f]`,
    text: `bg-transparent text-[#c9a227] hover:bg-[#fef9e7] active:bg-[#fef3d1]`
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2'
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-full transition-all duration-200
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
// INPUT - Style Google (focus avec accent, coins arrondis)
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
        <label className="text-sm font-medium text-[#3c4043] block mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa0a6]" />
        )}
        <input
          className={`
            w-full px-4 py-3 bg-white border rounded-2xl transition-all duration-200
            text-[#202124] placeholder-[#9aa0a6]
            focus:outline-none focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/20
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-[#ea4335] focus:border-[#ea4335] focus:ring-[#ea4335]/20' : 'border-[#dadce0]'}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-[#ea4335]">{error}</p>}
    </div>
  );
};

// ============================================================================
// SELECT - Style Google
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
        <label className="text-sm font-medium text-[#3c4043] block mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 bg-white border rounded-2xl transition-all duration-200
          text-[#202124] appearance-none cursor-pointer
          focus:outline-none focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/20
          ${error ? 'border-[#ea4335] focus:border-[#ea4335] focus:ring-[#ea4335]/20' : 'border-[#dadce0]'}
        `}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa0a6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-[#ea4335]">{error}</p>}
    </div>
  );
};

// ============================================================================
// TEXTAREA - Style Google
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
        <label className="text-sm font-medium text-[#3c4043] block mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3 bg-white border rounded-2xl transition-all duration-200 resize-none
          text-[#202124] placeholder-[#9aa0a6]
          focus:outline-none focus:border-[#c9a227] focus:ring-2 focus:ring-[#c9a227]/20
          ${error ? 'border-[#ea4335] focus:border-[#ea4335] focus:ring-[#ea4335]/20' : 'border-[#dadce0]'}
        `}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[#ea4335]">{error}</p>}
    </div>
  );
};

// ============================================================================
// MODAL BASE - Style Google (très arrondi, ombre douce)
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
        className="absolute inset-0 bg-[#202124]/60"
        onClick={onClose}
      />
      <div className={`
        relative bg-white rounded-[28px] w-full ${sizes[size]} max-h-[90vh] overflow-hidden
        shadow-[0_24px_38px_3px_rgba(0,0,0,0.14),0_9px_46px_8px_rgba(0,0,0,0.12),0_11px_15px_-7px_rgba(0,0,0,0.2)]
        animate-[modalIn_0.2s_ease-out]
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-xl font-normal text-[#202124]">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#5f6368]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TABS - Style Google (underline actif, pas de fond)
// ============================================================================

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex gap-0 border-b border-[#dadce0] ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-3 text-sm font-medium transition-all relative
            ${activeTab === tab.id
              ? 'text-[#c9a227]'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
            }
          `}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#c9a227] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR - Style Google (coins arrondis, couleurs douces)
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
    green: 'bg-[#34a853]',
    red: 'bg-[#ea4335]',
    blue: 'bg-[#4285f4]',
    amber: 'bg-[#fbbc04]'
  };

  const trackColors = {
    gold: 'bg-[#fef9e7]',
    green: 'bg-[#e6f4ea]',
    red: 'bg-[#fce8e6]',
    blue: 'bg-[#e8f0fe]',
    amber: 'bg-[#fef7e0]'
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-[#5f6368]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${trackColors[color]} rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// TOOLTIP - Style Google
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
        absolute ${positions[position]} px-3 py-2 bg-[#3c4043] text-white text-xs rounded-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 whitespace-nowrap z-50
        shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]
      `}>
        {content}
      </div>
    </div>
  );
};

// ============================================================================
// EMPTY STATE - Style Google
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
    <div className={`text-center py-16 ${className}`}>
      {Icon && (
        <div className="w-20 h-20 bg-[#f1f3f4] rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-[#9aa0a6]" />
        </div>
      )}
      <h3 className="text-lg font-normal text-[#202124] mb-2">{title}</h3>
      {description && <p className="text-[#5f6368] mb-6 max-w-md mx-auto">{description}</p>}
      {action && (
        <Button variant="primary" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// LOADING SPINNER - Style Google (cercle simple)
// ============================================================================

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12" cy="12" r="10"
          stroke="#dadce0"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="none"
          stroke="#c9a227"
          strokeWidth="3"
          strokeLinecap="round"
          d="M12 2a10 10 0 0 1 10 10"
        />
      </svg>
    </div>
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
