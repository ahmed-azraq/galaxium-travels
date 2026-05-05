import { useState, useEffect } from 'react';
import type { Flight, SeatClass, Quote, Hold } from '../../types';
import { Modal as CarbonModal } from '@carbon/react';
import { Button } from '../common';
import {
  Plane,
  Currency,
  Tag as TagIcon,
  Timer as TimerIcon,
  Flash,
  ArrowLeft as ArrowLeftIcon,
  Checkmark,
  Star,
  Rocket,
} from '@carbon/icons-react';
import { formatCurrency, formatDate, calculateDuration } from '../../utils/formatters';
import { createQuote, createHold, confirmHold, releaseHold } from '../../services/api';
import { storeHold, removeHold } from '../../utils/holdStorage';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';

type Step = 'select' | 'quote' | 'hold';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight | null;
  onSuccess: () => void;
}

export const BookingModal = ({ isOpen, onClose, flight, onSuccess }: BookingModalProps) => {
  const { user } = useUser();
  const [step, setStep] = useState<Step>('select');
  const [selectedClass, setSelectedClass] = useState<SeatClass>('economy');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [hold, setHold] = useState<Hold | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedClass('economy');
      setQuote(null);
      setHold(null);
      setTimeLeft(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hold || step !== 'hold') return;

    const update = () => {
      const remaining = new Date(hold.reservedUntil).getTime() - Date.now();
      setTimeLeft(isNaN(remaining) ? 0 : Math.max(0, remaining));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [hold, step]);

  if (!flight) return null;

  const seatClasses = [
    {
      name: 'Economy',
      class: 'economy' as SeatClass,
      price: flight.economy_price,
      seats: flight.economy_seats_available,
      icon: Plane,
      color: '#78a9ff',
      background: 'rgba(120, 169, 255, 0.12)',
      borderColor: 'rgba(120, 169, 255, 0.28)',
      features: ['Standard seating', 'In-flight entertainment', 'Complimentary snacks'],
    },
    {
      name: 'Business',
      class: 'business' as SeatClass,
      price: flight.business_price,
      seats: flight.business_seats_available,
      icon: Star,
      color: '#be95ff',
      background: 'rgba(190, 149, 255, 0.12)',
      borderColor: 'rgba(190, 149, 255, 0.28)',
      features: ['Premium seating', 'Priority boarding', 'Gourmet meals', 'Extra legroom'],
    },
    {
      name: 'Galaxium Class',
      class: 'galaxium' as SeatClass,
      price: flight.galaxium_price,
      seats: flight.galaxium_seats_available,
      icon: Rocket,
      color: 'var(--alien-green)',
      background: 'rgba(66, 190, 101, 0.12)',
      borderColor: 'rgba(66, 190, 101, 0.28)',
      features: ['Luxury pods', 'VIP lounge access', 'Personal concierge', 'Zero-G experience'],
    },
  ];

  const selectedClassData = seatClasses.find((sc) => sc.class === selectedClass);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = hold !== null && timeLeft === 0;

  const flightSummary = (
    <div className="surface-card content-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="route-badge">
          <Plane size={18} />
        </div>
        <div>
          <h3 className="content-card__title" style={{ fontSize: '1.125rem' }}>
            {flight.origin} → {flight.destination}
          </h3>
          <p className="content-card__eyebrow">Flight #{flight.flight_id}</p>
        </div>
      </div>

      <div className="info-grid info-grid--three">
        <div>
          <p className="info-label">Departure</p>
          <p className="info-value">{formatDate(flight.departure_time, 'MMM dd')}</p>
        </div>
        <div>
          <p className="info-label">Arrival</p>
          <p className="info-value">{formatDate(flight.arrival_time, 'MMM dd')}</p>
        </div>
        <div>
          <p className="info-label">Duration</p>
          <p className="info-value">{calculateDuration(flight.departure_time, flight.arrival_time)}</p>
        </div>
      </div>
    </div>
  );

  const handleGetQuote = async () => {
    if (!user) {
      toast.error('Please sign in to get a quote');
      return;
    }

    setIsLoading(true);
    try {
      const newQuote = await createQuote({
        flightId: flight.flight_id,
        seatClass: selectedClass,
        quantity: 1,
        travelerId: user.user_id,
        travelerName: user.name,
      });
      setQuote(newQuote);
      setStep('quote');
    } catch {
      toast.error('Failed to get quote. Make sure the inventory service is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceHold = async () => {
    if (!quote) return;

    setIsLoading(true);
    try {
      const newHold = await createHold(quote.quoteId);
      setHold(newHold);
      setStep('hold');

      if (user) {
        storeHold(user.user_id, {
          holdId: newHold.holdId,
          quoteId: quote.quoteId,
          flightId: flight.flight_id,
          seatClass: selectedClass,
          pricePerSeat: quote.pricePerSeat,
          totalPrice: quote.totalPrice,
          reservedUntil: newHold.reservedUntil,
        });
      }

      toast.success('Seat held! You have 15 minutes to confirm.');
    } catch {
      toast.error('Failed to place hold');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmHold = async () => {
    if (!hold || !user) return;

    setIsLoading(true);
    try {
      const confirmed = await confirmHold(hold.holdId);
      removeHold(user.user_id, hold.holdId);
      toast.success(
        `Booking confirmed! Reference: #${confirmed.externalBookingReference}`
      );
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to confirm booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseHold = async () => {
    if (!hold || !user) return;

    setIsLoading(true);
    try {
      await releaseHold(hold.holdId);
      removeHold(user.user_id, hold.holdId);
      toast.success('Hold released');
      onClose();
    } catch {
      toast.error('Failed to release hold');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (step) {
      case 'select':
        return 'Book Your Flight';
      case 'quote':
        return 'Your Price Quote';
      case 'hold':
        return 'Seat Reserved';
    }
  };

  // Step 1: Seat class selection
  const renderSelectStep = () => (
    <div className="stack-lg">
      {flightSummary}

      <div className="stack-md">
        <h4 className="section-heading" style={{ marginBottom: 0 }}>
          Select Seat Class
        </h4>
        <div className="stack-sm">
          {seatClasses.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedClass === sc.class;
            const isSoldOut = sc.seats === 0;

            return (
              <button
                key={sc.class}
                onClick={() => !isSoldOut && setSelectedClass(sc.class)}
                disabled={isSoldOut}
                className="content-card"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid',
                  textAlign: 'left',
                  cursor: isSoldOut ? 'not-allowed' : 'pointer',
                  opacity: isSoldOut ? 0.5 : 1,
                  transition: 'transform 180ms ease, border-color 180ms ease, background 180ms ease',
                  borderColor: isSelected ? sc.borderColor : 'var(--border-subtle)',
                  background: isSelected ? sc.background : 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Icon size={20} style={{ color: sc.color, flexShrink: 0 }} />
                    <span className="content-card__title" style={{ margin: 0 }}>
                      {sc.name}
                    </span>
                    {isSelected && <Checkmark size={18} style={{ color: sc.color, flexShrink: 0 }} />}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        lineHeight: 1.2,
                        fontWeight: 700,
                        color: sc.color,
                      }}
                    >
                      {formatCurrency(sc.price)}
                    </div>
                    <div className="info-label">
                      {isSoldOut ? 'Sold Out' : `${sc.seats} left`}
                    </div>
                  </div>
                </div>
                <ul className="stack-sm info-label" style={{ margin: 0, paddingLeft: '1rem' }}>
                  {sc.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {user && (
        <div className="surface-card content-card stack-sm">
          <h4 className="section-heading" style={{ marginBottom: 0 }}>
            Passenger
          </h4>
          <p className="info-value">{user.name}</p>
          <p className="info-label">{user.email}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleGetQuote} isLoading={isLoading} className="flex-1">
          Get Quote →
        </Button>
      </div>
    </div>
  );

  // Step 2: Quote review
  const renderQuoteStep = () => {
    const Icon = selectedClassData?.icon || Plane;
    return (
      <div className="stack-lg">
        <div
          className="surface-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1rem',
            border: '1px solid rgba(190, 132, 255, 0.32)',
            background: 'rgba(190, 132, 255, 0.14)',
          }}
        >
          <TagIcon size={16} style={{ color: 'var(--cosmic-purple)', flexShrink: 0 }} />
          <span className="info-label">Quote ID</span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'var(--cosmic-purple)',
            }}
          >
            {quote?.quoteId}
          </span>
        </div>

        {flightSummary}

        <div className="surface-card content-card stack-md">
          <h4 className="section-heading" style={{ marginBottom: 0 }}>
            Price Breakdown
          </h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon
                size={16}
                style={{ color: selectedClassData?.color || 'var(--space-blue)', flexShrink: 0 }}
              />
              <span className="info-value">
                {selectedClassData?.name} × 1
              </span>
            </div>
            <span className="info-value">{formatCurrency(quote?.pricePerSeat || 0)}</span>
          </div>
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <span className="content-card__title" style={{ margin: 0 }}>
              Total
            </span>
            <span
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.2,
                fontWeight: 700,
                color: 'var(--alien-green)',
              }}
            >
              {formatCurrency(quote?.totalPrice || 0)}
            </span>
          </div>
          <p className="info-label">
            Quote valid for 24 hours · Price calculated by inventory service
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={() => setStep('select')}
            disabled={isLoading}
            className="flex-1"
          >
            <ArrowLeftIcon size={16} /> Back
          </Button>
          <Button onClick={handlePlaceHold} isLoading={isLoading} className="flex-1">
            <TimerIcon size={16} /> Place Hold →
          </Button>
        </div>
      </div>
    );
  };

  // Step 3: Hold active with countdown
  const renderHoldStep = () => (
    <div className="stack-lg">
      <div
        className="surface-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.875rem 1rem',
          border: '1px solid rgba(66, 190, 101, 0.32)',
          background: 'rgba(66, 190, 101, 0.14)',
        }}
      >
        <Flash size={16} style={{ color: 'var(--alien-green)', flexShrink: 0 }} />
        <span className="info-label">Hold ID</span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: 'var(--alien-green)',
          }}
        >
          {hold?.holdId}
        </span>
      </div>

      <div
        className="surface-card"
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          border: '2px solid',
          borderColor: isExpired ? 'rgba(255, 131, 131, 0.45)' : 'rgba(255, 131, 43, 0.4)',
          background: isExpired ? 'rgba(255, 131, 131, 0.08)' : 'rgba(255, 131, 43, 0.08)',
        }}
      >
        <p
          className="info-label"
          style={{
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}
        >
          {isExpired ? 'Hold Expired' : 'Time to Confirm'}
        </p>
        <div
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
            lineHeight: 1,
            fontFamily: 'monospace',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: isExpired ? '#ff8389' : 'var(--solar-orange)',
          }}
        >
          {isExpired ? 'EXPIRED' : timerDisplay}
        </div>
        {!isExpired && (
          <p className="info-label" style={{ marginTop: '0.75rem' }}>
            Seat is reserved — confirm before time runs out
          </p>
        )}
      </div>

      {flightSummary}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 1.125rem',
          background: 'var(--cosmic-gradient)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Currency size={20} style={{ color: '#ffffff', flexShrink: 0 }} />
          <span style={{ color: '#ffffff', fontWeight: 600 }}>Total</span>
        </div>
        <span
          style={{
            fontSize: '1.25rem',
            lineHeight: 1.2,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          {formatCurrency(quote?.totalPrice || 0)}
        </span>
      </div>

      {isExpired ? (
        <Button variant="secondary" onClick={onClose} className="w-full">
          Close
        </Button>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="danger"
              onClick={handleReleaseHold}
              isLoading={isLoading}
              className="flex-1"
            >
              Release Hold
            </Button>
            <Button onClick={handleConfirmHold} isLoading={isLoading} className="flex-1">
              Confirm Booking
            </Button>
          </div>
          <p className="text-xs text-star-white/50 text-center">
            Closing keeps your hold active — find it in My Bookings
          </p>
        </>
      )}
    </div>
  );

  return (
    <CarbonModal
      open={isOpen}
      onRequestClose={onClose}
      modalHeading={getModalTitle()}
      passiveModal
      size="md"
      className="booking-modal"
    >
      {step === 'select' && renderSelectStep()}
      {step === 'quote' && renderQuoteStep()}
      {step === 'hold' && renderHoldStep()}
    </CarbonModal>
  );
};

// Made with Bob
