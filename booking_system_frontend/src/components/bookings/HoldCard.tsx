import { useState, useEffect } from 'react';
import type { Flight, StoredHold } from '../../types';
import { Tile } from '@carbon/react';
import { Button } from '../common';
import { Flash, Plane, Time, CloseFilled, Star, Rocket } from '@carbon/icons-react';
import { formatCurrency } from '../../utils/formatters';
import { confirmHold, releaseHold } from '../../services/api';
import { removeHold } from '../../utils/holdStorage';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface HoldCardProps {
  storedHold: StoredHold;
  flight?: Flight;
  onAction: () => void; // called after confirm or release to refresh parent
}

export const HoldCard = ({ storedHold, flight, onAction }: HoldCardProps) => {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    const update = () => {
      const remaining = new Date(storedHold.reservedUntil).getTime() - Date.now();
      setTimeLeft(isNaN(remaining) ? 0 : Math.max(0, remaining));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [storedHold.reservedUntil]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isExpired = timeLeft === 0;
  const isLoading = isConfirming || isReleasing;

  const getSeatMeta = () => {
    switch (storedHold.seatClass) {
      case 'business':
        return {
          icon: <Star size={16} style={{ color: '#be95ff' }} />,
          label: 'Business',
        };
      case 'galaxium':
        return {
          icon: <Rocket size={16} style={{ color: 'var(--alien-green)' }} />,
          label: 'Galaxium Class',
        };
      default:
        return {
          icon: <Plane size={16} style={{ color: '#78a9ff' }} />,
          label: 'Economy',
        };
    }
  };

  const seatMeta = getSeatMeta();

  const handleConfirm = async () => {
    if (!user) return;
    setIsConfirming(true);
    try {
      const confirmed = await confirmHold(storedHold.holdId);
      removeHold(user.user_id, storedHold.holdId);
      toast.success(`Booking confirmed! Reference: #${confirmed.externalBookingReference}`);
      onAction();
    } catch {
      toast.error('Failed to confirm booking');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRelease = async () => {
    if (!user) return;
    setIsReleasing(true);
    try {
      await releaseHold(storedHold.holdId);
      removeHold(user.user_id, storedHold.holdId);
      toast.success('Hold released');
      onAction();
    } catch {
      toast.error('Failed to release hold');
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{ height: '100%' }}
    >
      <Tile className="tile-reset">
        <div
          className="surface-card content-card"
          style={{
            height: '100%',
            borderColor: isExpired ? 'rgba(250, 77, 86, 0.32)' : 'rgba(241, 194, 27, 0.3)',
          }}
        >
          <div className="content-card__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isExpired ? 'rgba(250, 77, 86, 0.18)' : 'rgba(241, 194, 27, 0.18)',
                  color: isExpired ? '#fa4d56' : 'var(--solar-orange)',
                }}
              >
                <Flash size={18} />
              </div>
              <div>
                <p className="content-card__eyebrow" style={{ fontFamily: 'monospace' }}>
                  {storedHold.holdId}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {isExpired ? (
                    <>
                      <CloseFilled size={16} style={{ color: '#fa4d56' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fa4d56' }}>Expired</span>
                    </>
                  ) : (
                    <>
                      <Time size={16} style={{ color: 'var(--solar-orange)' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--solar-orange)' }}>
                        Held · {timerDisplay}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="content-card__body">
            {flight ? (
              <div>
                <h3 className="content-card__title">{flight.origin} → {flight.destination}</h3>
                <p className="content-card__eyebrow">Flight #{flight.flight_id}</p>
              </div>
            ) : (
              <p className="info-value">Flight #{storedHold.flightId}</p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {seatMeta.icon}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-soft)' }}>{seatMeta.label}</span>
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--star-white)' }}>
                {storedHold.totalPrice != null && !isNaN(storedHold.totalPrice)
                  ? formatCurrency(storedHold.totalPrice)
                  : '—'}
              </span>
            </div>
          </div>

          <div className="content-card__footer">
            {!isExpired ? (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRelease}
                  isLoading={isReleasing}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Release
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  isLoading={isConfirming}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (user) removeHold(user.user_id, storedHold.holdId);
                  onAction();
                }}
                className="w-full"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </Tile>
    </motion.div>
  );
};

// Made with Bob
