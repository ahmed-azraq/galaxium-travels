import { useState } from 'react';
import type { FlightFilters as FlightFiltersType } from '../../services/api';
import { Accordion, AccordionItem, Select, SelectItem, NumberInput, Tag } from '@carbon/react';
import { Filter } from '@carbon/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlightFiltersProps {
  filters: FlightFiltersType;
  onFiltersChange: (filters: FlightFiltersType) => void;
  onReset: () => void;
}

export const FlightFilters = ({ filters, onFiltersChange, onReset }: FlightFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FlightFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof FlightFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFilterCount = Object.keys(filters).length;

  const renderOptionButton = (
    key: keyof FlightFiltersType,
    optionValue: string,
    label: string,
    currentValue?: string,
  ) => (
    <button
      key={optionValue}
      type="button"
      onClick={() => updateFilter(key, currentValue === optionValue ? undefined : optionValue)}
      className={`pill-button ${currentValue === optionValue ? 'pill-button--active' : ''}`}
      style={{ flex: 1 }}
    >
      {label}
    </button>
  );

  return (
    <div className="surface-card filter-shell">
      <div className="filter-header">
        <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="filter-toggle">
          <Filter size={20} />
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>

        {activeFilterCount > 0 && (
          <button type="button" onClick={onReset} className="text-button">
            Reset All
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', marginTop: '1.5rem' }}
          >
            <Accordion>
              <AccordionItem title="Sort & Order" open>
                <div className="stack-md">
                  <Select
                    id="sort-by"
                    labelText="Sort By"
                    value={filters.sort_by || 'departure_time'}
                    onChange={(e) => updateFilter('sort_by', e.target.value)}
                  >
                    <SelectItem value="departure_time" text="Departure Time" />
                    <SelectItem value="base_price" text="Price" />
                    <SelectItem value="duration" text="Duration" />
                    <SelectItem value="seats_available" text="Availability" />
                  </Select>
                  <Select
                    id="sort-order"
                    labelText="Sort Order"
                    value={filters.sort_order || 'asc'}
                    onChange={(e) => updateFilter('sort_order', e.target.value)}
                  >
                    <SelectItem value="asc" text="Ascending" />
                    <SelectItem value="desc" text="Descending" />
                  </Select>
                </div>
              </AccordionItem>

              <AccordionItem title="Departure Date">
                <div className="filter-grid">
                  <div className="stack-sm">
                    <label htmlFor="departure-date-from" className="info-label">From</label>
                    <input
                      id="departure-date-from"
                      type="date"
                      value={filters.departure_date_from || ''}
                      onChange={(e) => updateFilter('departure_date_from', e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '2.5rem',
                        padding: '0 1rem',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  </div>
                  <div className="stack-sm">
                    <label htmlFor="departure-date-to" className="info-label">To</label>
                    <input
                      id="departure-date-to"
                      type="date"
                      value={filters.departure_date_to || ''}
                      onChange={(e) => updateFilter('departure_date_to', e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '2.5rem',
                        padding: '0 1rem',
                        border: '1px solid var(--border-subtle)',
                      }}
                    />
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem title="Price Range">
                <div className="stack-md">
                  <NumberInput
                    id="min-price"
                    label="Minimum Price (Credits)"
                    value={filters.min_price || ''}
                    onChange={(e: any) => {
                      const val = e.imaginaryTarget?.value || e.target?.value;
                      updateFilter('min_price', val ? parseInt(val) : undefined);
                    }}
                    min={0}
                  />
                  <NumberInput
                    id="max-price"
                    label="Maximum Price (Credits)"
                    value={filters.max_price || ''}
                    onChange={(e: any) => {
                      const val = e.imaginaryTarget?.value || e.target?.value;
                      updateFilter('max_price', val ? parseInt(val) : undefined);
                    }}
                    min={0}
                  />
                </div>
              </AccordionItem>

              <AccordionItem title="Seat Class">
                <div className="pill-button-group">
                  {['economy', 'business', 'galaxium'].map((seatClass) =>
                    renderOptionButton(
                      'seat_class',
                      seatClass,
                      seatClass.charAt(0).toUpperCase() + seatClass.slice(1),
                      filters.seat_class,
                    ),
                  )}
                </div>
              </AccordionItem>

              <AccordionItem title="Time of Day">
                <div className="filter-grid">
                  {[
                    { value: 'morning', label: 'Morning (6-12)' },
                    { value: 'afternoon', label: 'Afternoon (12-18)' },
                    { value: 'evening', label: 'Evening (18-22)' },
                    { value: 'night', label: 'Night (22-6)' },
                  ].map((period) =>
                    renderOptionButton(
                      'departure_time_period',
                      period.value,
                      period.label,
                      filters.departure_time_period,
                    ),
                  )}
                </div>
              </AccordionItem>

              <AccordionItem title="Flight Duration">
                <div className="stack-md">
                  <NumberInput
                    id="min-duration"
                    label="Minimum Duration (hours)"
                    value={filters.min_duration || ''}
                    onChange={(e: any) => {
                      const val = e.imaginaryTarget?.value || e.target?.value;
                      updateFilter('min_duration', val ? parseInt(val) : undefined);
                    }}
                    min={0}
                  />
                  <NumberInput
                    id="max-duration"
                    label="Maximum Duration (hours)"
                    value={filters.max_duration || ''}
                    onChange={(e: any) => {
                      const val = e.imaginaryTarget?.value || e.target?.value;
                      updateFilter('max_duration', val ? parseInt(val) : undefined);
                    }}
                    min={0}
                  />
                </div>
              </AccordionItem>

              <AccordionItem title="Seat Availability">
                <NumberInput
                  id="min-seats"
                  label="Minimum Seats Available"
                  value={filters.min_seats_available || ''}
                  onChange={(e: any) => {
                    const val = e.imaginaryTarget?.value || e.target?.value;
                    updateFilter('min_seats_available', val ? parseInt(val) : undefined);
                  }}
                  min={0}
                />
              </AccordionItem>

              <AccordionItem title="Route Category">
                <div className="pill-button-group">
                  {[
                    { value: 'inner_planets', label: 'Inner Planets' },
                    { value: 'outer_planets', label: 'Outer Planets' },
                    { value: 'moons', label: 'Moons' },
                  ].map((category) =>
                    renderOptionButton(
                      'route_category',
                      category.value,
                      category.label,
                      filters.route_category,
                    ),
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}
      </AnimatePresence>

      {activeFilterCount > 0 && (
        <div
          className="active-filter-tags"
          style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}
        >
          {Object.entries(filters).map(([key, value]) => (
            <Tag
              key={key}
              type="purple"
              filter
              onClose={() => removeFilter(key as keyof FlightFiltersType)}
            >
              {key.replace(/_/g, ' ')}: {String(value)}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

// Made with Bob