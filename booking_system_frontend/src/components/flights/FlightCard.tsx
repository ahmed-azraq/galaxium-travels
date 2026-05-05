import type { Flight, SeatClass } from '../../types';
import { Tile } from '@carbon/react';
import { Button } from '../common';
import { Plane, Time, UserMultiple, Star, Rocket } from '@carbon/icons-react';
import { formatCurrency, formatDate, formatTime, calculateDuration } from '../../utils/formatters';
import { motion } from 'framer-motion';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
}

export const FlightCard = ({ flight, onBook }: FlightCardProps) => {
  const totalSeats =
    flight.economy_seats_available +
    flight.business_seats_available +
    flight.galaxium_seats_available;
  const isSoldOut = totalSeats === 0;

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
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <Tile className="tile-reset">
        <div className="surface-card content-card" style={{ height: '100%' }}>
          <div className="content-card__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="route-badge">
                <Plane size={20} />
              </div>
              <div>
                <h3 className="content-card__title">
                  {flight.origin} → {flight.destination}
                </h3>
                <p className="content-card__eyebrow">Flight #{flight.flight_id}</p>
              </div>
            </div>
          </div>

          <div className="content-card__body">
            <div className="info-grid info-grid--two">
              <div>
                <p className="info-label">Departure</p>
                <p className="info-value">{formatDate(flight.departure_time, 'MMM dd, yyyy')}</p>
                <p className="info-value info-value--accent">{formatTime(flight.departure_time)}</p>
              </div>
              <div>
                <p className="info-label">Arrival</p>
                <p className="info-value">{formatDate(flight.arrival_time, 'MMM dd, yyyy')}</p>
                <p className="info-value info-value--accent">{formatTime(flight.arrival_time)}</p>
              </div>
            </div>

            <div className="inline-meta">
              <Time size={16} />
              <span>Duration: {calculateDuration(flight.departure_time, flight.arrival_time)}</span>
            </div>

            <div className="stack-sm">
              <p className="info-label">Available Seat Classes</p>
              {seatClasses.map((seatClass) => {
                const Icon = seatClass.icon;
                const isClassSoldOut = seatClass.seats === 0;
                const isLowSeats = seatClass.seats <= 2 && seatClass.seats > 0;

                return (
                  <motion.div
                    key={seatClass.class}
                    whileHover={!isClassSoldOut ? { scale: 1.02, y: -2 } : {}}
                    transition={{ duration: 0.2 }}
                    style={{
                      padding: '0.875rem 1rem',
                      border: `1px solid ${seatClass.borderColor}`,
                      background: seatClass.background,
                      opacity: isClassSoldOut ? 0.56 : 1,
                      cursor: isClassSoldOut ? 'not-allowed' : 'default',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Icon size={18} style={{ color: seatClass.color }} />
                        <span style={{ color: 'var(--star-white)', fontWeight: 500 }}>{seatClass.name}</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: seatClass.color }}>
                          {formatCurrency(seatClass.price)}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            justifyContent: 'flex-end',
                            fontSize: '0.75rem',
                            color: isLowSeats ? 'var(--solar-orange)' : 'var(--text-muted)',
                            fontWeight: isLowSeats ? 600 : 400,
                          }}
                        >
                          <UserMultiple size={12} />
                          <span>{isClassSoldOut ? 'Sold Out' : `${seatClass.seats} left`}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="content-card__footer">
            <Button onClick={() => onBook(flight)} disabled={isSoldOut} className="w-full">
              {isSoldOut ? 'All Classes Sold Out' : 'Select Seat Class'}
            </Button>
          </div>
        </div>
      </Tile>
    </motion.div>
  );
};

// Made with Bob
