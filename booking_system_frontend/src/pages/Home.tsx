import { Link } from 'react-router-dom';
import { Grid, Column } from '@carbon/react';
import { Rocket, Earth, Security, Flash } from '@carbon/icons-react';
import { Button } from '../components/common';
import { motion } from 'framer-motion';

export const Home = () => {
  const features = [
    {
      icon: <Rocket size={32} />,
      title: 'Interplanetary Travel',
      description: 'Explore destinations across the solar system with our state-of-the-art spacecraft.',
    },
    {
      icon: <Earth size={32} />,
      title: 'Multiple Destinations',
      description: 'From Mars to Europa, discover new worlds and book your journey today.',
    },
    {
      icon: <Security size={32} />,
      title: 'Safe & Secure',
      description: 'Your safety is our priority with advanced navigation and life support systems.',
    },
    {
      icon: <Flash size={32} />,
      title: 'Instant Booking',
      description: 'Book your flight in seconds and receive instant confirmation.',
    },
  ];

  return (
    <div className="stack-lg">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="page-hero"
      >
        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="page-title">
                <span className="page-title-accent">Journey Beyond</span>
                <br />
                <span>The Stars</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="page-subtitle"
            >
              Experience the future of space travel with Galaxium. Book your
              interplanetary flight and explore the wonders of our solar system.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="page-actions"
            >
              <Link to="/flights">
                <Button size="lg">Explore Flights</Button>
              </Link>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </motion.div>
          </Column>
        </Grid>
      </motion.section>

      <section className="page-section">
        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-heading"
              style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
              Why Choose Galaxium?
            </motion.h2>
          </Column>

          {features.map((feature, index) => (
            <Column key={index} lg={4} md={4} sm={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="surface-card content-card"
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    background: 'var(--cosmic-gradient)',
                    margin: '0 auto',
                    color: 'white',
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="content-card__title" style={{ fontSize: '1.25rem' }}>
                  {feature.title}
                </h3>
                <p className="page-subtitle" style={{ maxWidth: 'unset', fontSize: '1rem' }}>
                  {feature.description}
                </p>
              </motion.div>
            </Column>
          ))}
        </Grid>
      </section>

      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <Grid fullWidth>
          <Column lg={{ span: 12, offset: 2 }} md={8} sm={4}>
            <div
              className="surface-card content-card"
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(138, 125, 255, 0.28), rgba(255, 126, 182, 0.22))',
              }}
            >
              <h2 className="section-heading">Ready for Your Space Adventure?</h2>
              <p className="page-subtitle">
                Join thousands of space travelers who have already booked their
                journey to the stars. Your adventure awaits!
              </p>
              <div className="page-actions" style={{ marginTop: 0, justifyContent: 'center' }}>
                <Link to="/flights">
                  <Button variant="secondary" size="lg">
                    Book Your Flight Now
                  </Button>
                </Link>
              </div>
            </div>
          </Column>
        </Grid>
      </motion.section>
    </div>
  );
};

// Made with Bob
