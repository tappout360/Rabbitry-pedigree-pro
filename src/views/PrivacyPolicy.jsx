import React from 'react';
import TermsAndPolicies from './TermsAndPolicies';

export default function PrivacyPolicy({ onClose }) {
  return <TermsAndPolicies onClose={onClose} initialTab="privacy" />;
}
