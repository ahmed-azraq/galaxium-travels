import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Column } from '@carbon/react';
import { WarningAlt } from '@carbon/icons-react';
import type { Booking, Flight, StoredHold } from '../types';
import { LoadingSpinner, Modal, Button } from '../components/common';
import { BookingCard } from '../components/bookings/BookingCard';
import { HoldCard } from '../components/bookings/HoldCard';
import { getUserBookings, getFlights, cancelBooking, getHold, isErrorResponse } from '../services/api';
import { getStoredHolds, removeHold } from '../utils/holdStorage';
import { useUser } from '../hooks/useUser';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const MyBookings = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [activeHolds, setActiveHolds] = useState<StoredHold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/flights');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadHolds = useCallback(async () => {
    if (!user) return;

    const stored = getStoredHolds(user.user_id);
    if (stored.length === 0) {
      setActiveHolds([]);
      return;
    }

    // Verify each hold's current status from the API, remove stale ones
    const stillActive: StoredHold[] = [];
    const isLocallyExpired = (sh: StoredHold) => {
      const expiryTime = new Date(sh.reservedUntil).getTime();
      return isNaN(expiryTime) || expiryTime < Date.now();
    };
    await Promise.all(
      stored.map(async (sh) => {
        try {
          const hold = await getHold(sh.holdId);
          if (hold.status === 'HELD' && !isLocallyExpired(sh)) {
            stillActive.push(sh);
          } else {
            // Hold is no longer active (confirmed, released, expired, or locally timed out)
            removeHold(user.user_id, sh.holdId);
          }
        } catch {
          // API unavailable — fall back to local expiry check
          if (!isLocallyExpired(sh)) {
            stillActive.push(sh);
          } else {
            removeHold(user.user_id, sh.holdId);
          }
        }
      })
    );

    setActiveHolds(stillActive);
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [bookingsData, flightsData] = await Promise.all([
        getUserBookings(user.user_id),
        getFlights(),
      ]);
      setBookings(bookingsData);
      setFlights(flightsData);
      await loadHolds();
    } catch (error: any) {
      toast.error('Failed to load bookings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadHolds]);

  const handleCancelClick = (bookingId: number) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    setCancellingId(bookingToCancel);
    setShowCancelModal(false);

    try {
      const result = await cancelBooking(bookingToCancel);

      if (isErrorResponse(result)) {
        toast.error(result.details || result.error);
        return;
      }

      toast.success('Booking cancelled successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.details || error.error || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
      setBookingToCancel(null);
    }
  };

  const getFlightForBooking = (booking: Booking): Flight | undefined => {
    return flights.find((f) => f.flight_id === booking.flight_id);
  };

  const getFlightForHold = (hold: StoredHold): Flight | undefined => {
    return flights.find((f) => f.flight_id === hold.flightId);
  };

  const activeBookings = bookings.filter((b) => b.status === 'booked');
  const pastBookings = bookings.filter((b) => b.status !== 'booked');

  if (!user) {
    return null;
  }

  return (
    <div className="stack-lg">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-hero">
            <h1 className="page-title page-title--compact">
              My <span className="page-title-accent">Bookings</span>
            </h1>
            <p className="page-subtitle">Manage your space travel reservations.</p>
          </motion.div>
        </Column>

        {isLoading ? (
          <Column lg={16} md={8} sm={4}>
            <LoadingSpinner size="lg" text="Loading your bookings..." />
          </Column>
        ) : (
          <>
            {activeHolds.length > 0 && (
              <>
                <Column lg={16} md={8} sm={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="section-heading-row"
                  >
                    <h2 className="section-heading" style={{ fontSize: '1.5rem', color: 'var(--solar-orange)' }}>
                      Pending Holds ({activeHolds.length})
                    </h2>
                    <span className="section-kicker">Confirm before time runs out</span>
                  </motion.div>
                </Column>

                {activeHolds.map((hold, index) => (
                  <Column key={hold.holdId} lg={4} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + index * 0.05 }}
                    >
                      <HoldCard
                        storedHold={hold}
                        flight={getFlightForHold(hold)}
                        onAction={loadData}
                      />
                    </motion.div>
                  </Column>
                ))}
              </>
            )}

            {bookings.length === 0 && activeHolds.length === 0 && (
              <Column lg={16} md={8} sm={4}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card content-card">
                  <WarningAlt size={48} style={{ margin: '0 auto', color: 'var(--cds-text-secondary)', opacity: 0.6 }} />
                  <h3 className="content-card__title" style={{ textAlign: 'center' }}>
                    No bookings yet
                  </h3>
                  <p className="page-subtitle">
                    Start your space adventure by booking your first flight.
                  </p>
                  <div className="page-actions" style={{ marginTop: 0 }}>
                    <Button onClick={() => navigate('/flights')}>Browse Flights</Button>
                  </div>
                </motion.div>
              </Column>
            )}

            {activeBookings.length > 0 && (
              <>
                <Column lg={16} md={8} sm={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="section-heading-row"
                  >
                    <h2 className="section-heading" style={{ fontSize: '1.5rem' }}>
                      Active Bookings ({activeBookings.length})
                    </h2>
                  </motion.div>
                </Column>

                {activeBookings.map((booking, index) => (
                  <Column key={booking.booking_id} lg={4} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <BookingCard
                        booking={booking}
                        flight={getFlightForBooking(booking)}
                        onCancel={handleCancelClick}
                        isCancelling={cancellingId === booking.booking_id}
                      />
                    </motion.div>
                  </Column>
                ))}
              </>
            )}

            {pastBookings.length > 0 && (
              <>
                <Column lg={16} md={8} sm={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="section-heading-row"
                    style={{ marginTop: '1rem' }}
                  >
                    <h2 className="section-heading" style={{ fontSize: '1.5rem', color: 'var(--cds-text-secondary)' }}>
                      Past Bookings ({pastBookings.length})
                    </h2>
                  </motion.div>
                </Column>

                {pastBookings.map((booking, index) => (
                  <Column key={booking.booking_id} lg={4} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <BookingCard
                        booking={booking}
                        flight={getFlightForBooking(booking)}
                        onCancel={handleCancelClick}
                      />
                    </motion.div>
                  </Column>
                ))}
              </>
            )}
          </>
        )}
      </Grid>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="sm"
      >
        <div className="stack-md" style={{ paddingTop: '1rem' }}>
          <p style={{ color: 'var(--cds-text-secondary)', margin: 0 }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={cancellingId !== null}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={cancellingId !== null}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Made with Bob
