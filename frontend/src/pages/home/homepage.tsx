import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../services/context/AuthContext';
import {
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  Heart,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';

export function HomePage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated && user) {
    if (user.role === 'student') {
      return <Navigate to="/gigs" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  const features = [
    {
      icon: (
        <Users className="w-7 h-7 text-[var(--color-primary)]" />
      ),
      title: 'Built for Students',
      description:
        'A platform designed specifically for the student community.',
    },
    {
      icon: (
        <DollarSign className="w-7 h-7 text-[var(--color-primary)]" />
      ),
      title: 'Affordable & Flexible',
      description:
        'Find gigs that fit your schedule and budget.',
    },
    {
      icon: (
        <TrendingUp className="w-7 h-7 text-[var(--color-primary)]" />
      ),
      title: 'Learn & Grow',
      description:
        'Build your portfolio while earning money.',
    },
    {
      icon: (
        <Heart className="w-7 h-7 text-[var(--color-primary)]" />
      ),
      title: 'Support Peers',
      description:
        'Help fellow students and build meaningful connections.',
    },
  ];

  const sampleGigs = [
    {
      title: 'Logo Design for College Event',
      budget: '₹500',
      category: 'Design',
    },
    {
      title: 'Build a Landing Page',
      budget: '₹1,000',
      category: 'Development',
    },
    {
      title: 'Write a Blog Article',
      budget: '₹300',
      category: 'Writing',
    },
    {
      title: 'Edit a 2-minute Video',
      budget: '₹600',
      category: 'Video',
    },
  ];

  const steps = [
    {
      step: '1',
      title: 'Create Your Profile',
      desc: 'Sign up and showcase your skills and interests.',
    },
    {
      step: '2',
      title: 'Find or Post Gigs',
      desc: 'Browse opportunities or create a gig for other students.',
    },
    {
      step: '3',
      title: 'Get Work Done',
      desc: 'Collaborate, complete projects, and build experience.',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-hidden">
{/* =========================
    HERO SECTION — Full-screen cinematic
========================== */}

<section
  style={{
    position: 'relative',
    width: '100%',
    height: '100vh',
    minHeight: '600px',
    maxHeight: '900px',
    overflow: 'hidden',
  }}
>
  {/* Background image */}
  <img
    src="/hero-background.png"
    alt="Students working together"
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center top',
      zIndex: 0,
    }}
  />

  {/* Soft atmospheric top veil */}
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '220px',
      background:
        'linear-gradient(to bottom, rgba(145, 66, 116, 0.44) 0%, rgba(240,234,250,0.14) 55%, transparent 100%)',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      maskImage:
        'linear-gradient(to bottom, black 0%, black 28%, transparent 100%)',
      WebkitMaskImage:
        'linear-gradient(to bottom, black 0%, black 28%, transparent 100%)',
      zIndex: 1,
      pointerEvents: 'none',
    }}
  />

{/* =========================
    BOTTOM-RIGHT HERO CONTENT
========================== */}

<div
  style={{
    position: 'absolute',
    right: '3.5rem',
    bottom: '3.5rem',

    width: 'min(500px, 38vw)',

    zIndex: 2,
  }}
>
  {/* Broad atmospheric fade for readability */}
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',

      top: '-150px',
      left: '-220px',

      width: '760px',
      height: '560px',

      background: `
        radial-gradient(
          ellipse 68% 62% at 58% 52%,
          rgba(255, 255, 255, 0.78) 0%,
          rgba(255, 255, 255, 0.62) 28%,
          rgba(255, 255, 255, 0.43) 48%,
          rgba(255, 255, 255, 0.22) 66%,
          rgba(255, 255, 255, 0.08) 82%,
          transparent 100%
        )
      `,

      filter: 'blur(32px)',

      pointerEvents: 'none',
      zIndex: 0,
    }}
  />

  {/* Content */}
  <div
    style={{
      position: 'relative',
      zIndex: 1,

      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',

      width: '100%',

      textAlign: 'left',
    }}
  >
    {/* Badge */}
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',

        width: 'fit-content',
        alignSelf: 'flex-start',

        padding: '6px 14px',
        marginBottom: '16px',

        borderRadius: '9999px',

        background: 'rgba(107, 141, 214, 0.15)',
        color: '#4A67B8',

        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.02em',

        whiteSpace: 'nowrap',
      }}
    >
      Built by students, for students
    </div>

    {/* Headline */}
    <h1
      style={{
        margin: '0 0 15px 0',
        padding: 0,

        width: '100%',
        maxWidth: '460px',

        fontSize: 'clamp(1.9rem, 3vw, 2.55rem)',
        fontWeight: 700,
        lineHeight: 1.16,

        color: '#1e2a40',
        letterSpacing: '-0.025em',

        textAlign: 'left',

        textShadow:
          '0 1px 8px rgba(255, 255, 255, 0.5)',
      }}
    >
      Opportunities for
      <br />
      <span style={{ color: '#6B8DD6' }}>
        Brighter Tomorrows
      </span>
    </h1>

    {/* Description */}
    <p
      style={{
        margin: '0 0 23px 0',
        padding: 0,

        width: '100%',
        maxWidth: '355px',

        fontSize: '0.96rem',
        lineHeight: 1.55,
        fontWeight: 400,

        color: '#35425c',

        textAlign: 'left',

        textShadow:
          '0 1px 7px rgba(255, 255, 255, 0.5)',
      }}
    >
      A freelance platform made for students, by students.
      Find gigs, hire peers, and grow together.
    </p>

    {/* Buttons */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px',
      }}
    >
      {/* Get Started */}
      <Link to="/signup">
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',

            padding: '11px 26px',

            background: '#6B8DD6',
            color: '#fff',

            borderRadius: '10px',
            border: 'none',

            fontSize: '15px',
            fontWeight: 600,

            cursor: 'pointer',

            transition:
              'background 0.18s ease, transform 0.18s ease',

            boxShadow:
              '0 2px 12px rgba(107, 141, 214, 0.25)',

            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#5577C8';
            e.currentTarget.style.transform =
              'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#6B8DD6';
            e.currentTarget.style.transform =
              'translateY(0)';
          }}
        >
          Get Started

          <ArrowRight
            style={{
              width: '16px',
              height: '16px',
            }}
          />
        </button>
      </Link>

      {/* Explore Gigs */}
      <Link to="/gigs">
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',

            padding: '11px 24px',

            background: 'rgba(255, 255, 255, 0.48)',
            color: '#34415a',

            borderRadius: '10px',
            border:
              '1.5px solid rgba(107, 141, 214, 0.22)',

            fontSize: '15px',
            fontWeight: 600,

            cursor: 'pointer',

            transition:
              'background 0.18s ease, border-color 0.18s ease',

            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',

            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background =
              'rgba(255, 255, 255, 0.62)';
            e.currentTarget.style.borderColor =
              'rgba(107, 141, 214, 0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background =
              'rgba(255, 255, 255, 0.48)';
            e.currentTarget.style.borderColor =
              'rgba(107, 141, 214, 0.22)';
          }}
        >
          Explore Gigs
        </button>
      </Link>
    </div>
  </div>
</div>
</section>
      {/* =========================
          WHY UNIGIGS
      ========================== */}

      <section className="py-16 md:py-20 bg-[var(--color-background)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-14">

            <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)] uppercase mb-3">
              Why UniGigs
            </p>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text)] leading-tight mb-4">
              Built for Students.{' '}
              <span className="text-[var(--color-primary)]">
                Designed for Growth.
              </span>
            </h2>

            <p className="text-base md:text-lg text-[var(--color-text-muted)] leading-relaxed">
              Everything you need to start your freelance journey,
              build experience, and earn while you learn.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">

            {features.map((feature, index) => (

              <div
                key={index}
                className="
                  bg-[var(--color-surface)]
                  border border-[var(--color-border)]
                  rounded-[var(--radius-lg)]
                  p-6
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-[var(--shadow-md)]
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-[var(--radius-md)]
                    bg-[var(--color-primary-light)]
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
                  {feature.title}
                </h3>

                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =========================
          POPULAR GIGS
      ========================== */}

      <section className="py-16 md:py-20 bg-[var(--color-background-alt)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12 md:mb-14">

            <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)] uppercase mb-3">
              Opportunities
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
              Popular Gigs
            </h2>

            <p className="text-lg text-[var(--color-text-muted)]">
              Explore what students are offering right now.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">

            {sampleGigs.map((gig, index) => (

              <div
                key={index}
                className="
                  bg-[var(--color-surface)]
                  border border-[var(--color-border)]
                  rounded-[var(--radius-lg)]
                  p-6
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-[var(--shadow-md)]
                "
              >

                <p className="text-sm font-medium text-[var(--color-primary)] mb-3">
                  {gig.category}
                </p>

                <h3 className="text-lg font-semibold text-[var(--color-text)] leading-snug mb-5">
                  {gig.title}
                </h3>

                <div className="pt-4 border-t border-[var(--color-border)]">

                  <p className="text-sm text-[var(--color-text-muted)] mb-1">
                    Budget
                  </p>

                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {gig.budget}
                  </p>

                </div>

              </div>

            ))}

          </div>

          <div className="text-center mt-12">

            <Link to="/gigs">

              <Button
                variant="secondary"
                size="lg"
              >
                View All Gigs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

            </Link>

          </div>

        </div>

      </section>

      {/* =========================
          HOW IT WORKS
      ========================== */}

      <section className="py-16 md:py-20 bg-[var(--color-background)]">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12 md:mb-14">

            <p className="text-sm font-semibold tracking-wide text-[var(--color-primary)] uppercase mb-3">
              Simple Process
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
              How It Works
            </h2>

            <p className="text-lg text-[var(--color-text-muted)]">
              Start your freelance journey in three simple steps.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">

            {steps.map((item) => (

              <div
                key={item.step}
                className="text-center"
              >

                <div
                  className="
                    w-16
                    h-16
                    bg-[var(--color-primary)]
                    text-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-bold
                    mx-auto
                    mb-5
                    shadow-[var(--shadow-sm)]
                  "
                >
                  {item.step}
                </div>

                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
                  {item.title}
                </h3>

                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  {item.desc}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =========================
          CTA SECTION
      ========================== */}

      <section className="py-16 md:py-20 bg-[var(--color-primary)]">

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Freelance Journey?
          </h2>

          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10">
            Join a growing community of students learning,
            collaborating, and building their experience.
          </p>

          <Link to="/signup">

            <Button
              size="lg"
              className="
                bg-white
                text-[var(--color-primary)]
                hover:bg-[var(--color-background-alt)]
              "
            >
              Join Now — It's Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

          </Link>

        </div>

      </section>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            <div>

              <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">
                UniGigs
              </h3>

              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
                A freelance platform built to help students
                learn, collaborate, and grow.
              </p>

            </div>

            <div>

              <h4 className="font-semibold text-[var(--color-text)] mb-4">
                Platform
              </h4>

              <ul className="space-y-3 text-sm">

                <li>
                  <Link to="/gigs">
                    Find Gigs
                  </Link>
                </li>

                <li>
                  <Link to="/gigs/new">
                    Post a Gig
                  </Link>
                </li>

                <li>
                  <Link to="/dashboard">
                    Dashboard
                  </Link>
                </li>

              </ul>

            </div>

            <div>

              <h4 className="font-semibold text-[var(--color-text)] mb-4">
                Support
              </h4>

              <ul className="space-y-3 text-sm">

                <li>
                  <a href="#">
                    Help Center
                  </a>
                </li>

                <li>
                  <a href="#">
                    Safety
                  </a>
                </li>

                <li>
                  <a href="#">
                    Contact Us
                  </a>
                </li>

              </ul>

            </div>

            <div>

              <h4 className="font-semibold text-[var(--color-text)] mb-4">
                Legal
              </h4>

              <ul className="space-y-3 text-sm">

                <li>
                  <a href="#">
                    Terms
                  </a>
                </li>

                <li>
                  <a href="#">
                    Privacy
                  </a>
                </li>

              </ul>

            </div>

          </div>

          <div className="border-t border-[var(--color-border)] mt-10 pt-6 text-center">

            <p className="text-sm text-[var(--color-text-muted)]">
              © 2026 UniGigs. Built for students.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}