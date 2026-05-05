import type { Booking, Flight } from '../../types';
import { Tile } from '@carbon/react';
import { Button } from '../common';
import { Plane, Calendar, CheckmarkFilled, CloseFilled, Time, Star, Rocket } from '@carbon/icons-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';

interface BookingCardProps {
  booking: Booking;
  flight?: Flight;
  onCancel: (bookingId: number) => void;
  isCancelling?: boolean;
}

export const BookingCard = ({ booking, flight, onCancel, isCancelling }: BookingCardProps) => {
  const getSeatClassMeta = () => {
    switch (booking.seat_class) {
      case 'business':
        return {
          icon: <Star size={16} style={{ color: '#be95ff' }} />,
          label: 'Business',
          color: '#be95ff',
        };
      case 'galaxium':
        return {
          icon: <Rocket size={16} style={{ color: 'var(--alien-green)' }} />,
          label: 'Galaxium Class',
          color: 'var(--alien-green)',
        };
      default:
        return {
          icon: <Plane size={16} style={{ color: '#78a9ff' }} />,
          label: 'Economy',
          color: '#78a9ff',
        };
    }
  };

  const getStatusMeta = () => {
    switch (booking.status) {
      case 'booked':
        return {
          icon: <CheckmarkFilled size={18} style={{ color: 'var(--alien-green)' }} />,
          color: 'var(--alien-green)',
        };
      case 'cancelled':
        return {
          icon: <CloseFilled size={18} style={{ color: '#fa4d56' }} />,
          color: '#fa4d56',
        };
      case 'completed':
        return {
          icon: <CheckmarkFilled size={18} style={{ color: '#78a9ff' }} />,
          color: '#78a9ff',
        };
      default:
        return {
          icon: <Time size={18} style={{ color: 'var(--text-muted)' }} />,
          color: 'var(--text-muted)',
        };
    }
  };

  const canCancel = booking.status === 'booked';
  const seatClassMeta = getSeatClassMeta();
  const statusMeta = getStatusMeta();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{ height: '100%' }}
    >
      <Tile className="tile-reset">
        <div className="surface-card content-card" style={{ height: '100%' }}>
          <div className="content-card__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="route-badge">
                <Plane size={18} />
              </div>
              <div>
                <p className="content-card__eyebrow">Booking #{booking.booking_id}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {statusMeta.icon}
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: statusMeta.color,
                      textTransform: 'capitalize',
                    }}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {flight ? (
            <div className="content-card__body">
              <div>
                <h3 className="content-card__title">{flight.origin} → {flight.destination}</h3>
                <p className="content-card__eyebrow">Flight #{flight.flight_id}</p>
              </div>

              <div className="info-grid info-grid--two">
                <div>
                  <p className="info-label">Departure</p>
                  <p className="info-value">{formatDate(flight.departure_time)}</p>
                </div>
                <div>
                  <p className="info-label">Arrival</p>
                  <p className="info-value">{formatDate(flight.arrival_time)}</p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <span className="info-label" style={{ margin: 0 }}>Seat Class</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {seatClassMeta.icon}
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: seatClassMeta.color }}>
                      {seatClassMeta.label}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <span className="info-label" style={{ margin: 0 }}>Price Paid</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--star-white)' }}>
                    {formatCurrency(booking.price_paid)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="content-card__body">
              <p className="info-value">Flight ID: {booking.flight_id}</p>
            </div>
          )}

          <div className="content-card__footer">
            <div className="inline-meta" style={{ marginBottom: canCancel ? '1rem' : 0 }}>
              <Calendar size={16} />
              <span>Booked on {formatDate(booking.booking_time)}</span>
            </div>

            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(booking.booking_id)}
                isLoading={isCancelling}
                className="w-full"
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </Tile>
    </motion.div>
  );
};

// Made with Bob
