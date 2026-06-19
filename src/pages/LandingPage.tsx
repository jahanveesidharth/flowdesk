import { useNavigate } from 'react-router-dom';
import { Map, Calendar, Users, BarChart3, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { icon: <Map className="w-6 h-6" />, title: 'Interactive Floor Maps', desc: 'See your entire office at a glance with color-coded desk and room availability.' },
  { icon: <Zap className="w-6 h-6" />, title: 'One-click Booking', desc: 'Reserve a desk in seconds with smart defaults and instant confirmation.' },
  { icon: <Users className="w-6 h-6" />, title: 'Team Coordination', desc: 'See where your teammates are sitting and plan office days together.' },
  { icon: <Calendar className="w-6 h-6" />, title: 'Weekly Planner', desc: 'Plan your entire week across remote and in-office days from one place.' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Utilization Analytics', desc: 'Track occupancy trends, peak times, and resource usage to improve planning.' },
  { icon: <CheckCircle className="w-6 h-6" />, title: 'QR Check-in', desc: 'Arrive, check in via QR code, and you\'re set. No-shows get auto-released.' },
];

const TESTIMONIALS = [
  { quote: '"GrabDesk completely eliminated the morning desk scramble. Our team knows exactly where everyone is sitting before they even arrive."', name: 'Sarah Mitchell', role: 'Office manager, Acme Corp', initials: 'SM' },
  { quote: '"The floor map view is a game-changer. I can see who\'s near me, book adjacent desks for my team, and plan our in-office days effortlessly."', name: 'David Park', role: 'Engineering lead, Globex', initials: 'DP' },
  { quote: '"As a facilities director, the analytics dashboard gives me real insight into how our space is used. We\'ve optimized our layout and saved 30% on unused desks."', name: 'Maria Torres', role: 'Facilities director, Initech', initials: 'MT' },
];

const STEPS = [
  { num: 1, title: 'Browse available spaces', desc: 'Explore your office floor map or calendar to find the perfect desk, room, or resource for your day.' },
  { num: 2, title: 'Book in seconds', desc: 'Select your preferred spot, pick a time, and confirm. Recurring? We\'ve got that too.' },
  { num: 3, title: 'Check in & get to work', desc: 'Arrive at the office, check in via QR code or one tap, and you\'re all set. No-shows get auto-released.' },
];

const LOGOS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Wayne Enterprises', 'Stark Industries'];

const FAQS = [
  { q: 'What is GrabDesk?', a: 'GrabDesk is a workplace management platform that lets hybrid teams book desks, rooms, parking, and lockers from an interactive floor map. It helps teams coordinate office days and helps facilities teams understand how space is being used.' },
  { q: 'Can I book recurring desks?', a: 'Yes! GrabDesk supports daily, weekly, biweekly, and monthly recurring bookings with configurable duration limits set by your admin.' },
  { q: 'How does check-in work?', a: 'You can check in via the web app or QR code at the desk. If you don\'t check in within the configured window, your booking is auto-released so teammates can use the space.' },
  { q: 'Is there a mobile app?', a: 'GrabDesk is a fully responsive web app that works great on mobile browsers. Native mobile apps are on our roadmap.' },
  { q: 'Can admins see all bookings?', a: 'Admins have a full dashboard with all bookings, occupancy analytics, user management, and policy controls.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const previewDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/grabdesk.svg" alt="GrabDesk Logo" className="h-7 sm:h-8 w-auto" />
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Log in
            </button>
            <Button 
              size="sm" 
              onClick={() => navigate('/login')} 
              className="text-xs sm:text-sm px-2.5 sm:px-3 whitespace-nowrap"
            >
              Get started free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Your office{' '}
          <span className="text-brand-500 bg-brand-50 px-3 rounded-2xl">organised</span>
        </h1>
        <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          GrabDesk makes it effortless to book desks, meeting rooms, and resources. See who's in the office, coordinate with your team, and never fight over a hot desk again.
        </p>
        <Button size="lg" className="text-base px-8" iconRight={<ArrowRight className="w-5 h-5" />} onClick={() => navigate('/login')}>
          Get started free
        </Button>

        {/* App preview */}
        <div className="mt-16 bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="ml-4 flex items-center gap-2">
              <img src="/grabdesk favicon.svg" alt="GrabDesk" className="w-5 h-5 object-contain" />
              <span className="text-xs font-bold text-brand-600">GRABDESK</span>
            </div>
            <span className="ml-4 text-xs text-gray-400">GrabDesk — Dashboard</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[300px]">
            <div className="hidden md:block bg-white border-r border-gray-200 p-4 space-y-2 text-left">
              {['Dashboard', 'Floor map', 'My bookings', 'Parking & lockers', 'Team', 'My week'].map(item => (
                <div key={item} className={`text-xs py-1.5 px-2 rounded-lg ${item === 'Dashboard' ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-500'}`}>{item}</div>
              ))}
            </div>
            <div className="col-span-1 md:col-span-3 p-6 text-left">
              <h2 className="text-lg font-bold text-gray-900">Good morning, Lisa</h2>
              <p className="text-xs text-gray-400 mb-4">{previewDate}</p>
              <div className="flex gap-4 mb-4 text-xs text-gray-500">
                <span>🪑 24 desks</span>
                <span>🚗 8 parking</span>
                <span>🔒 9 lockers</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-brand-500">
                  <p className="text-xs font-medium text-gray-500">Today's booking</p>
                  <p className="text-base font-bold text-gray-900 mt-1">D-01</p>
                  <p className="text-xs text-gray-400">Ground floor · 09:00–17:00</p>
                  <span className="inline-block mt-2 bg-brand-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Check In</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Quick actions</p>
                  {['Book a desk', 'View my bookings', 'Find teammates'].map(a => (
                    <div key={a} className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">{a}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="bg-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {LOGOS.map(l => (
              <span key={l} className="text-gray-400 font-semibold text-lg">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Everything you need to manage your workspace</h2>
            <p className="text-gray-500 mb-8">From booking a desk to coordinating with your team, GrabDesk has you covered.</p>
            <div className="space-y-5">
              {FEATURES.slice(0, 3).map(f => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 shrink-0">{f.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{f.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl aspect-video overflow-hidden border border-gray-200 shadow-md">
            <img 
              src="/floor_map_preview.png" 
              alt="GrabDesk Interactive Floor Map Preview" 
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">How it works</h2>
          <p className="text-center text-gray-500 mb-16">Three simple steps to a better office experience.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(step => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{step.num}</div>
                <div className="h-0.5 bg-gray-200 absolute hidden md:block" />
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Loved by teams everywhere</h2>
        <p className="text-center text-gray-500 mb-16">See what teams are saying about GrabDesk.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600 text-sm italic mb-4">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">{t.initials}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Frequently asked questions</h2>
          <p className="text-center text-gray-500 mb-12">Everything you need to know about GrabDesk.</p>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer group">
                <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-sm text-gray-500 mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-500 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to organise your office?</h2>
        <p className="text-brand-100 mb-8">Join thousands of teams managing their workspace with GrabDesk.</p>
        <Button
          size="lg"
          className="bg-white text-brand-600 hover:bg-gray-100 text-base px-8"
          iconRight={<ArrowRight className="w-5 h-5" />}
          onClick={() => navigate('/login')}
        >
          Get started free
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/grabdesk light.svg" alt="GrabDesk Logo" className="h-8 w-auto" />
          <p className="text-sm">© 2026 GrabDesk. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
