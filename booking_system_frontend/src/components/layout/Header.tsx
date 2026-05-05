import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Header as CarbonHeader,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from '@carbon/react';
import { Rocket, User, Logout } from '@carbon/icons-react';
import { useUser } from '../../hooks/useUser';
import { Button } from '../common';
import { UserIdentification } from '../user/UserIdentification';
import { motion } from 'framer-motion';

export const Header = () => {
  const location = useLocation();
  const { user, logout } = useUser();
  const [showUserModal, setShowUserModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <HeaderContainer
        render={() => (
          <CarbonHeader
            aria-label="Galaxium Travels"
            className="app-header"
          >
            <HeaderName
              as={Link}
              to="/"
              prefix=""
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                paddingInlineStart: '1rem',
                minWidth: 'unset',
              }}
            >
              <motion.span whileHover={{ rotate: 15 }} transition={{ duration: 0.3 }}>
                <Rocket size={16} />
              </motion.span>
              <span className="brand-gradient-text" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                Galaxium Travels
              </span>
            </HeaderName>

            <HeaderNavigation aria-label="Main Navigation">
              <HeaderMenuItem as={Link} to="/" aria-current={isActive('/') ? 'page' : undefined}>
                Home
              </HeaderMenuItem>
              <HeaderMenuItem
                as={Link}
                to="/flights"
                aria-current={isActive('/flights') ? 'page' : undefined}
              >
                Flights
              </HeaderMenuItem>
              {user && (
                <HeaderMenuItem
                  as={Link}
                  to="/bookings"
                  aria-current={isActive('/bookings') ? 'page' : undefined}
                >
                  My Bookings
                </HeaderMenuItem>
              )}
            </HeaderNavigation>

            <HeaderGlobalBar>
              {user ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingInline: '1rem',
                      color: 'var(--star-white)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <User size={16} style={{ color: 'var(--cosmic-purple)' }} />
                    <span>{user.name}</span>
                  </div>
                  <HeaderGlobalAction aria-label="Logout" onClick={logout} tooltipAlignment="end">
                    <Logout size={20} />
                  </HeaderGlobalAction>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingInline: '1rem',
                  }}
                >
                  {location.pathname === '/' ? (
                    <Link to="/flights">
                      <Button size="sm">Book a Flight</Button>
                    </Link>
                  ) : (
                    <Button size="sm" onClick={() => setShowUserModal(true)}>
                      Login
                    </Button>
                  )}
                </div>
              )}
            </HeaderGlobalBar>
          </CarbonHeader>
        )}
      />

      <UserIdentification
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={() => {
          setShowUserModal(false);
        }}
      />
    </>
  );
};

// Made with Bob
