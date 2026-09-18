import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardSectionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardSectionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
};