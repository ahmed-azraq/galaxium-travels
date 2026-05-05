import { useState, useEffect } from 'react';
import { Grid, Column, Search as CarbonSearch } from '@carbon/react';
import type { Flight } from '../types';
import { LoadingSpinner } from '../components/common';
import { FlightCard } from '../components/flights/FlightCard';
import { FlightFilters } from '../components/flights/FlightFilters';
import { UserIdentification } from '../components/user/UserIdentification';
import { BookingModal } from '../components/bookings/BookingModal';
import { getFlights } from '../services/api';
import type { FlightFilters as FlightFiltersType } from '../services/api';
import { useUser } from '../hooks/useUser';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const Flights = () => {
  const { user } = useUser();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FlightFiltersType>({});
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch flights when filters change
  useEffect(() => {
    loadFlights();
  }, [filters]);

  const loadFlights = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    setIsLoading(true);
    try {
      const data = await getFlights(filters);
      setFlights(data);
    } catch (error: any) {
      if (retryCount < MAX_RETRIES) {
        toast.error(`Failed to load flights. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        console.warn(`Retry attempt ${retryCount + 1} after error:`, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        
        // Retry with incremented count
        return loadFlights(retryCount + 1);
      } else {
        toast.error('Failed to load flights after multiple attempts');
        console.error('Max retries reached:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    
    if (!user) {
      // Show user identification modal first
      setShowUserModal(true);
    } else {
      // Show booking confirmation modal
      setShowBookingModal(true);
    }
  };

  const handleUserIdentified = () => {
    // After user signs in, show booking modal
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    // Reload flights to get updated seat availability
    loadFlights();
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Client-side search filter (applied after backend filters)
  const displayFlights = searchTerm.trim()
    ? flights.filter(
        (flight) =>
          flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flight.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : flights;

  return (
    <div className="stack-lg">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-hero"
          >
            <h1 className="page-title page-title--compact">
              Available <span className="page-title-accent">Flights</span>
            </h1>
            <p className="page-subtitle">
              Choose your destination and embark on an interplanetary adventure.
            </p>
          </motion.div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <CarbonSearch
              size="lg"
              placeholder="Search by origin or destination..."
              labelText="Search flights"
              closeButtonLabelText="Clear search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <FlightFilters filters={filters} onFiltersChange={setFilters} onReset={handleResetFilters} />
          </motion.div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="results-meta">
            Showing {displayFlights.length} flight{displayFlights.length !== 1 ? 's' : ''}
          </div>
        </Column>

        {isLoading ? (
          <Column lg={16} md={8} sm={4}>
            <LoadingSpinner size="lg" text="Loading flights..." />
          </Column>
        ) : displayFlights.length === 0 ? (
          <Column lg={16} md={8} sm={4}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card content-card">
              <h2 className="section-heading" style={{ fontSize: '1.5rem', textAlign: 'center' }}>
                No flights found
              </h2>
              <p className="page-subtitle">No flights match your current search and filter criteria.</p>
            </motion.div>
          </Column>
        ) : (
          displayFlights.map((flight, index) => (
            <Column key={flight.flight_id} lg={4} md={4} sm={4} style={{ marginBottom: '1.5rem' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <FlightCard flight={flight} onBook={handleBookFlight} />
              </motion.div>
            </Column>
          ))
        )}
      </Grid>

      <UserIdentification
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={handleUserIdentified}
      />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        flight={selectedFlight}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

// Made with Bob