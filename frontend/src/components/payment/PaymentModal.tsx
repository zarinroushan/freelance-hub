import { useState, useEffect } from 'react';
import './payment-modal.css';
import { API_BASE_URL, getAuthToken } from '../../services/api';
import { X, CreditCard, Lock, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';

interface PaymentModalProps {
  contractId: number;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'card_entry' | 'processing' | 'success' | 'error';

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function detectCardType(number: string): string {
  const d = number.replace(/\s/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^6/.test(d)) return 'rupay';
  return 'unknown';
}

export function PaymentModal({ contractId, amount, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<ModalStep>('card_entry');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState('');
  const [processingMsg, setProcessingMsg] = useState('');
  const [txnId, setTxnId] = useState('');

  const cardType = detectCardType(cardNumber);

  // Auto-close success after delay
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(() => {
        onSuccess();
        onClose();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const getCardGradient = () => {
    switch (cardType) {
      case 'visa': return 'from-blue-600 via-blue-700 to-indigo-800';
      case 'mastercard': return 'from-orange-500 via-red-500 to-red-700';
      case 'amex': return 'from-teal-500 via-cyan-600 to-blue-700';
      case 'rupay': return 'from-green-600 via-emerald-600 to-teal-700';
      default: return 'from-slate-600 via-slate-700 to-slate-900';
    }
  };

  const getCardLabel = () => {
    switch (cardType) {
      case 'visa': return 'VISA';
      case 'mastercard': return 'MasterCard';
      case 'amex': return 'American Express';
      case 'rupay': return 'RuPay';
      default: return '';
    }
  };

  const handlePay = async () => {
    setError('');
    const rawDigits = cardNumber.replace(/\s/g, '');
    if (rawDigits.length < 13) { setError('Please enter a valid card number.'); return; }
    if (!cardHolder.trim()) { setError('Please enter the cardholder name.'); return; }
    if (expiry.length < 5) { setError('Please enter a valid expiry date (MM/YY).'); return; }
    if (cvv.length < 3) { setError('Please enter a valid CVV.'); return; }

    setStep('processing');

    try {
      setProcessingMsg('Connecting to payment gateway...');
      await delay(900);

      const initiateRes = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          contract_id: contractId,
          card_number: rawDigits,
          card_holder: cardHolder.trim(),
          expiry,
          cvv,
          payment_method: 'card',
        }),
      });

      if (!initiateRes.ok) {
        const err = await initiateRes.json();
        throw new Error(err.detail || 'Failed to initiate payment.');
      }

      const initiateData = await initiateRes.json();

      setProcessingMsg('Verifying card details...');
      await delay(800);

      setProcessingMsg('Authenticating with bank...');
      await delay(900);

      setProcessingMsg('Processing transaction...');
      await delay(700);

      const confirmRes = await fetch(`${API_BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ payment_intent_id: initiateData.payment_intent_id }),
      });

      if (!confirmRes.ok) {
        const err = await confirmRes.json();
        throw new Error(err.detail || 'Payment confirmation failed.');
      }

      const confirmData = await confirmRes.json();
      setTxnId(confirmData.payment_id?.toString() || initiateData.payment_intent_id?.slice(0, 8).toUpperCase());
      setProcessingMsg('Payment successful!');
      await delay(400);
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return (
    <div className="payment-modal-overlay" onClick={(e) => e.target === e.currentTarget && step !== 'processing' && onClose()}>
      <div className="payment-modal-container">

        {/* ── HEADER ── */}
        <div className="payment-modal-header">
          <div className="flex items-center gap-2">
            <div className="payment-header-icon">
              <Lock size={16} />
            </div>
            <span className="payment-modal-title">Secure Payment</span>
          </div>
          {step !== 'processing' && (
            <button className="payment-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── CARD ENTRY STEP ── */}
        {step === 'card_entry' && (
          <div className="payment-body">
            {/* Amount */}
            <div className="payment-amount-banner">
              <span className="payment-amount-label">Amount to Release</span>
              <span className="payment-amount-value">₹{amount.toLocaleString()}</span>
            </div>

            {/* 3D Credit Card Preview */}
            <div
              className={`card-preview-container ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className="card-preview">
                {/* Front */}
                <div className={`card-face card-front bg-gradient-to-br ${getCardGradient()}`}>
                  <div className="card-chip">
                    <div className="chip-lines" />
                  </div>
                  <div className="card-number-display">
                    {(cardNumber || '#### #### #### ####').padEnd(19, '#').split(' ').map((chunk, i) => (
                      <span key={i} className="card-number-group">
                        {chunk.replace(/#/g, '•')}
                      </span>
                    ))}
                  </div>
                  <div className="card-bottom-row">
                    <div>
                      <p className="card-label">Card Holder</p>
                      <p className="card-value">{cardHolder || 'YOUR NAME'}</p>
                    </div>
                    <div>
                      <p className="card-label">Expires</p>
                      <p className="card-value">{expiry || 'MM/YY'}</p>
                    </div>
                    <div className="card-type-badge">{getCardLabel()}</div>
                  </div>
                  <div className="card-shimmer" />
                </div>
                {/* Back */}
                <div className={`card-face card-back bg-gradient-to-br ${getCardGradient()}`}>
                  <div className="card-magstripe" />
                  <div className="card-cvv-strip">
                    <span className="card-cvv-label">CVV</span>
                    <span className="card-cvv-value">{cvv ? '•'.repeat(cvv.length) : '•••'}</span>
                  </div>
                  <div className="card-shimmer" />
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="payment-form">
              {/* Card Number */}
              <div className="payment-field">
                <label className="payment-field-label">Card Number</label>
                <div className="payment-input-wrap">
                  <CreditCard size={16} className="payment-input-icon" />
                  <input
                    id="payment-card-number"
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    maxLength={19}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="payment-input"
                  />
                </div>
              </div>

              {/* Card Holder */}
              <div className="payment-field">
                <label className="payment-field-label">Card Holder Name</label>
                <input
                  id="payment-card-holder"
                  type="text"
                  placeholder="Name on card"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="payment-input"
                  style={{ paddingLeft: '1rem' }}
                />
              </div>

              {/* Expiry + CVV */}
              <div className="payment-field-row">
                <div className="payment-field">
                  <label className="payment-field-label">Expiry Date</label>
                  <input
                    id="payment-expiry"
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    maxLength={5}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="payment-input"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
                <div className="payment-field">
                  <label className="payment-field-label">CVV</label>
                  <div className="payment-input-wrap">
                    <input
                      id="payment-cvv"
                      type="password"
                      inputMode="numeric"
                      placeholder="•••"
                      value={cvv}
                      maxLength={4}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      className="payment-input"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="payment-error">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Disclaimer */}
              <div className="payment-demo-badge">
                <Shield size={12} />
                <span>Demo mode — no real charges. Use any card number.</span>
              </div>

              {/* Pay Button */}
              <button
                id="payment-submit-btn"
                className="payment-submit-btn"
                onClick={handlePay}
              >
                <Lock size={16} />
                Release Payment · ₹{amount.toLocaleString()}
              </button>
            </div>
          </div>
        )}

        {/* ── PROCESSING STEP ── */}
        {step === 'processing' && (
          <div className="payment-processing">
            <div className="processing-spinner-wrap">
              <div className="processing-ring ring-1" />
              <div className="processing-ring ring-2" />
              <div className="processing-ring ring-3" />
              <Loader2 className="processing-icon animate-spin" size={32} />
            </div>
            <p className="processing-title">Processing Payment</p>
            <p className="processing-subtitle">{processingMsg}</p>
            <div className="processing-steps">
              {['Validating', 'Authenticating', 'Processing', 'Confirming'].map((s, i) => (
                <div key={s} className={`processing-step ${i < 3 ? 'done' : 'active'}`}>
                  <div className="step-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="payment-success">
            <div className="success-icon-wrap">
              <div className="success-ring" />
              <CheckCircle className="success-icon" size={48} />
            </div>
            <p className="success-title">Payment Released! 🎉</p>
            <p className="success-subtitle">
              ₹{amount.toLocaleString()} has been transferred to the freelancer.
            </p>
            {txnId && (
              <div className="success-txn">
                <span className="txn-label">Transaction ID</span>
                <span className="txn-value">#{txnId}</span>
              </div>
            )}
            <div className="success-confetti">
              {['💸', '🎊', '✅', '⭐', '💰'].map((e, i) => (
                <span key={i} className="confetti-emoji" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
              ))}
            </div>
            <p className="success-auto-close">Closing automatically…</p>
          </div>
        )}

        {/* ── ERROR STEP ── */}
        {step === 'error' && (
          <div className="payment-error-screen">
            <div className="error-icon-wrap">
              <AlertCircle size={48} className="error-icon" />
            </div>
            <p className="error-title">Payment Failed</p>
            <p className="error-subtitle">{error}</p>
            <button className="payment-submit-btn" onClick={() => { setStep('card_entry'); setError(''); }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
