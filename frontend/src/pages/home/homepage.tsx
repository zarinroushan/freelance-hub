import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, DollarSign, TrendingUp, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-[var(--color-primary)]" />,
      title: 'Built for Students',
      description: 'A platform designed specifically for the student community.',
    },
    {
      icon: <DollarSign className="w-8 h-8 text-[var(--color-primary)]" />,
      title: 'Affordable & Flexible',
      description: 'Find gigs that fit your schedule and budget.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[var(--color-primary)]" />,
      title: 'Learn & Grow',
      description: 'Build your portfolio while earning money.',
    },
    {
      icon: <Heart className="w-8 h-8 text-[var(--color-primary)]" />,
      title: 'Support Peers',
      description: 'Help fellow students and build connections.',
    },
  ];

  const sampleGigs = [
    { title: 'Logo Design for College Event', budget: '₹500', category: 'Design' },
    { title: 'Build a Landing Page', budget: '₹1,000', category: 'Development' },
    { title: 'Write a Blog Article', budget: '₹300', category: 'Writing' },
    { title: 'Edit a 2-minute Video', budget: '₹600', category: 'Video' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-surface-alt)] to-[var(--color-background)]">
        {/* Cherry Blossom Decoration */}
        <div className="absolute top-0 left-0 w-full h-64 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl">🌸</div>
          <div className="absolute top-20 right-20 text-5xl">🌸</div>
          <div className="absolute top-40 left-1/4 text-4xl">🌸</div>
          <div className="absolute top-16 right-1/3 text-5xl">🌸</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
              Opportunities for{' '}
              <span className="text-[var(--color-primary)]">Brighter Tomorrows</span>
            </h1>
            <p className="text-xl text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
              A freelance platform made for students, by students. Find gigs, hire peers, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/gigs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Gigs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              Why Choose UniGigs?
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              Everything you need to start your freelance journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Gigs Section */}
      <section className="py-20 bg-[var(--color-surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              Popular Gigs
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              See what students are offering
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleGigs.map((gig, index) => (
              <div
                key={index}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-sm text-[var(--color-primary)] font-medium mb-2">
                  {gig.category}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                  {gig.title}
                </h3>
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {gig.budget}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/gigs">
              <Button variant="outline" size="lg">
                View All Gigs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Profile', desc: 'Sign up and showcase your skills' },
              { step: '2', title: 'Find or Post Gigs', desc: 'Browse opportunities or create your own' },
              { step: '3', title: 'Get Work Done', desc: 'Complete projects and get paid' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Freelance Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already earning and learning on UniGigs
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-gray-100">
              Join Now - It's Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🌸</span>
                <span className="text-xl font-bold">UniGigs</span>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm">
                A freelance platform made for students, by students.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li><Link to="/gigs" className="hover:text-[var(--color-primary)]">Find Gigs</Link></li>
                <li><Link to="/gigs/new" className="hover:text-[var(--color-primary)]">Post a Gig</Link></li>
                <li><Link to="/dashboard" className="hover:text-[var(--color-primary)]">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li><a href="#" className="hover:text-[var(--color-primary)]">Help Center</a></li>
                <li><a href="#" className="hover:text-[var(--color-primary)]">Safety</a></li>
                <li><a href="#" className="hover:text-[var(--color-primary)]">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                <li><a href="#" className="hover:text-[var(--color-primary)]">Terms</a></li>
                <li><a href="#" className="hover:text-[var(--color-primary)]">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--color-border)] mt-8 pt-8 text-center text-sm text-[var(--color-text-muted)]">
            © 2026 UniGigs. Made with 🌸 for students.
          </div>
        </div>
      </footer>
    </div>
  );
}