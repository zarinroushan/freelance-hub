import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  Heart,
} from 'lucide-react';

import { Button } from '../../components/ui/Button';

export function HomePage() {
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
          HERO SECTION
      ========================== */}

      <section className="flex justify-center bg-[var(--color-background-alt)] ">
        <div className="max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14 md:pt-20 md:pb-20 lg:pt-24">

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT CONTENT */}

            <div className="max-w-xl">

              <div className="inline-flex items-center px-3 py-1 mb-5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-medium">
                Built by students, for students
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight mb-6">

                Opportunities for{' '}

                <span className="text-[var(--color-primary)]">
                  Brighter Tomorrows
                </span>

              </h1>

              <p className="text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed mb-8">

                A freelance platform made for students, by students.
                Find gigs, hire talented peers, and grow together.

              </p>

              <div className="flex flex-col sm:flex-row gap-4">

                <Link to="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/gigs">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Explore Gigs
                  </Button>
                </Link>

              </div>

            </div>


            {/* RIGHT IMAGE */}

            <div className="w-full">

              <div className="overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]">

                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&h=700&fit=crop"
                  alt="Students working together"
                  className="w-full h-[320px] md:h-[420px] object-cover"
                />

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================
          WHY UNIGIGS
      ========================== */}

      <section className="py-16 md:py-20 bg-[var(--color-background)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* HEADING */}

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


          {/* FEATURE CARDS */}

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

          {/* HEADING */}

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


          {/* GIG CARDS */}

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


          {/* BUTTON */}

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

          {/* HEADING */}

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


          {/* STEPS */}

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

            {/* BRAND */}

            <div>

              <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">

                UniGigs

              </h3>

              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">

                A freelance platform built to help students
                learn, collaborate, and grow.

              </p>

            </div>


            {/* PLATFORM */}

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


            {/* SUPPORT */}

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


            {/* LEGAL */}

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


          {/* COPYRIGHT */}

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