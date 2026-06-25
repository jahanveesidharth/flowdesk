import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Zap,
  Search,
  Sparkles,
  TrendingUp,
  Plus,
  Minus,
  Info,
  HelpCircle,
  Lock,
  Car,
  Sliders,
  UserCheck,
  RefreshCw,
  Play,
  Check,
  Sun,
  Moon,
  Building,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  DollarSign,
  Leaf,
  Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// ---------------------------------------------------------
// DATA DEFINITIONS & TYPES FOR SIMULATIONS
// ---------------------------------------------------------

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  stars: number;
}

interface FAQItem {
  q: string;
  a: string;
  category: 'general' | 'booking' | 'release' | 'admin';
}

interface DeskInfo {
  id: string;
  zone: 'Engineering' | 'Product' | 'Creative' | 'Quiet Focus';
  monitors: number;
  standing: boolean;
  window: boolean;
  status: 'available' | 'occupied' | 'selected' | 'maintenance' | 'mine';
  occupant?: string;
  dept?: string;
}

interface RoomInfo {
  id: string;
  name: string;
  capacity: number;
  hasTv: boolean;
  hasWhiteboard: boolean;
  status: 'available' | 'occupied';
  occupant?: string;
  timeRemaining?: string;
}

interface TeammateSchedule {
  name: string;
  role: string;
  dept: 'Engineering' | 'Product' | 'Design' | 'Operations' | 'Sales';
  avatar: string;
  schedule: {
    Monday: { status: 'office' | 'remote' | 'off'; desk?: string };
    Tuesday: { status: 'office' | 'remote' | 'off'; desk?: string };
    Wednesday: { status: 'office' | 'remote' | 'off'; desk?: string };
    Thursday: { status: 'office' | 'remote' | 'off'; desk?: string };
    Friday: { status: 'office' | 'remote' | 'off'; desk?: string };
  };
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: '"GrabDesk completely eliminated the morning desk scramble. Our team knows exactly where everyone is sitting before they even arrive at the office."',
    name: 'Sarah Mitchell',
    role: 'Office Manager, Acme Corp',
    initials: 'SM',
    avatarBg: 'bg-brand-500 text-white',
    stars: 5
  },
  {
    quote: '"The interactive floor map view is a game-changer. I can check who\'s near me, book adjacent desks for project sprints, and plan team days effortlessly."',
    name: 'David Park',
    role: 'Engineering Lead, Globex',
    initials: 'DP',
    avatarBg: 'bg-amber-500 text-white',
    stars: 5
  },
  {
    quote: '"As a facilities director, the utilization analytics dashboard gives us real data on how our space is used. We optimized our layout and saved 32% on unused desks."',
    name: 'Maria Torres',
    role: 'Facilities Director, Initech',
    initials: 'MT',
    avatarBg: 'bg-indigo-500 text-white',
    stars: 5
  },
  {
    quote: '"The auto-release feature is a lifesaver. No-shows get released automatically in 15 minutes, allowing others to occupy idle workspace without hassle."',
    name: 'James Reynolds',
    role: 'Operations VP, Stark Tech',
    initials: 'JR',
    avatarBg: 'bg-emerald-500 text-white',
    stars: 5
  }
];

const LOGOS = [
  { name: 'Acme Corp', delay: '0s' },
  { name: 'Globex Corp', delay: '0.2s' },
  { name: 'Initech Inc', delay: '0.4s' },
  { name: 'Umbrella Inc', delay: '0.6s' },
  { name: 'Wayne Ent.', delay: '0.8s' },
  { name: 'Stark Ind.', delay: '1s' }
];

const FAQS: FAQItem[] = [
  {
    q: 'What is GrabDesk?',
    a: 'GrabDesk is an all-in-one hybrid workplace coordination platform. It lets teams reserve desks, meeting rooms, parking spaces, and lockers from a visual, interactive office blueprint, while giving administrators analytics to optimize space usage.',
    category: 'general'
  },
  {
    q: 'How does the automatic no-show release window work?',
    a: 'Admins can set a check-in grace period (e.g., 15 or 30 minutes). Users check in by scanning a desk QR code or using their app. If they fail to check in within the grace window, their booking is canceled and released back to the general pool.',
    category: 'release'
  },
  {
    q: 'Can I book recurring desks or meeting rooms?',
    a: 'Yes, GrabDesk supports setting recurring bookings (daily, weekly, biweekly, or custom patterns) with smart conflicts alerts and automatically skips official holidays or team remote days.',
    category: 'booking'
  },
  {
    q: 'Does it support team neighborhoods?',
    a: 'Yes, admins can lock specific zones of the floor map (neighborhoods) to designated departments (e.g. Engineering, Sales) or leave them flexible as hot-desks depending on weekly resource demands.',
    category: 'admin'
  },
  {
    q: 'Can admins track real-time occupancy limits?',
    a: 'Absolutely. The admin dashboard features live utilization tracking, peak hour heatmaps, historical data export, and customizable health/safety policy thresholds.',
    category: 'admin'
  },
  {
    q: 'Is there a pricing limit on team size?',
    a: 'Our starter tier is completely free for up to 15 users. For larger teams, we offer flexible per-desk plans that adjust automatically based on active monthly spaces booked, saving you budget.',
    category: 'general'
  }
];

const INITIAL_DESKS: DeskInfo[] = [
  { id: 'D-01', zone: 'Creative', monitors: 2, standing: true, window: true, status: 'occupied', occupant: 'Sophia L.', dept: 'Design' },
  { id: 'D-02', zone: 'Creative', monitors: 1, standing: false, window: true, status: 'available' },
  { id: 'D-03', zone: 'Creative', monitors: 2, standing: true, window: false, status: 'occupied', occupant: 'Alex T.', dept: 'Design' },
  { id: 'D-04', zone: 'Engineering', monitors: 2, standing: true, window: false, status: 'available' },
  { id: 'D-05', zone: 'Engineering', monitors: 2, standing: false, window: false, status: 'occupied', occupant: 'Ryan G.', dept: 'Engineering' },
  { id: 'D-06', zone: 'Engineering', monitors: 3, standing: true, window: true, status: 'available' },
  { id: 'D-07', zone: 'Engineering', monitors: 2, standing: false, window: true, status: 'maintenance' },
  { id: 'D-08', zone: 'Engineering', monitors: 2, standing: true, window: false, status: 'occupied', occupant: 'Jessica H.', dept: 'Engineering' },
  { id: 'D-09', zone: 'Product', monitors: 1, standing: false, window: false, status: 'available' },
  { id: 'D-10', zone: 'Product', monitors: 2, standing: true, window: false, status: 'occupied', occupant: 'Kevin M.', dept: 'Product' },
  { id: 'D-11', zone: 'Product', monitors: 2, standing: false, window: true, status: 'available' },
  { id: 'D-12', zone: 'Quiet Focus', monitors: 1, standing: true, window: true, status: 'occupied', occupant: 'Elena B.', dept: 'Quiet Focus' },
  { id: 'D-13', zone: 'Quiet Focus', monitors: 2, standing: false, window: true, status: 'available' },
  { id: 'D-14', zone: 'Quiet Focus', monitors: 1, standing: false, window: false, status: 'available' }
];

const INITIAL_ROOMS: RoomInfo[] = [
  { id: 'R-01', name: 'Boardroom Delta', capacity: 12, hasTv: true, hasWhiteboard: true, status: 'occupied', occupant: 'Leadership Sync', timeRemaining: '25 min' },
  { id: 'R-02', name: 'Huddle Room Alpha', capacity: 6, hasTv: true, hasWhiteboard: true, status: 'available' },
  { id: 'R-03', name: 'Focus Nest B', capacity: 2, hasTv: false, hasWhiteboard: true, status: 'occupied', occupant: '1-on-1 Interview', timeRemaining: '10 min' }
];

const TEAMMATES_DATA: TeammateSchedule[] = [
  {
    name: 'Emily Watson',
    role: 'UX Designer',
    dept: 'Design',
    avatar: '👩‍🎨',
    schedule: {
      Monday: { status: 'office', desk: 'D-01' },
      Tuesday: { status: 'office', desk: 'D-01' },
      Wednesday: { status: 'remote' },
      Thursday: { status: 'office', desk: 'D-03' },
      Friday: { status: 'remote' }
    }
  },
  {
    name: 'Marcus Chen',
    role: 'Frontend Architect',
    dept: 'Engineering',
    avatar: '👨‍💻',
    schedule: {
      Monday: { status: 'remote' },
      Tuesday: { status: 'office', desk: 'D-05' },
      Wednesday: { status: 'office', desk: 'D-06' },
      Thursday: { status: 'office', desk: 'D-08' },
      Friday: { status: 'off' }
    }
  },
  {
    name: 'Sarah Connor',
    role: 'Lead PM',
    dept: 'Product',
    avatar: '👩‍💼',
    schedule: {
      Monday: { status: 'office', desk: 'D-10' },
      Tuesday: { status: 'remote' },
      Wednesday: { status: 'office', desk: 'D-10' },
      Thursday: { status: 'office', desk: 'D-10' },
      Friday: { status: 'remote' }
    }
  },
  {
    name: 'John Miller',
    role: 'DevOps Specialist',
    dept: 'Engineering',
    avatar: '🤖',
    schedule: {
      Monday: { status: 'office', desk: 'D-08' },
      Tuesday: { status: 'office', desk: 'D-06' },
      Wednesday: { status: 'remote' },
      Thursday: { status: 'remote' },
      Friday: { status: 'remote' }
    }
  },
  {
    name: 'Olivia Brown',
    role: 'VP Sales',
    dept: 'Sales',
    avatar: '👩‍💼',
    schedule: {
      Monday: { status: 'remote' },
      Tuesday: { status: 'office', desk: 'D-09' },
      Wednesday: { status: 'office', desk: 'D-09' },
      Thursday: { status: 'remote' },
      Friday: { status: 'office', desk: 'D-09' }
    }
  },
  {
    name: 'Robert Stark',
    role: 'HR Specialist',
    dept: 'Operations',
    avatar: '👨‍💼',
    schedule: {
      Monday: { status: 'office', desk: 'D-12' },
      Tuesday: { status: 'office', desk: 'D-12' },
      Wednesday: { status: 'office', desk: 'D-12' },
      Thursday: { status: 'office', desk: 'D-12' },
      Friday: { status: 'remote' }
    }
  }
];

const SIMULATED_TICKER_PHRASES = [
  'Emma R. checked into Desk D-04 via QR code.',
  'Auto-released Desk D-09 due to booking no-show window expiration.',
  'Meeting Room R-02 booked by Engineering team for 11:30 AM.',
  'Jordan K. reserved Parking spot P-03 for tomorrow morning.',
  'Locker L-14 code generated and sent to Chloe P.',
  'Daniel S. set schedule to "Remote" for Wednesday.',
  'Design team booked Collaboration Zone for sprint planning.'
];

export function LandingPage() {
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // THEME & INTERACTIVE LAYOUT STATES
  // ---------------------------------------------------------
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Read from HTML tag or settings
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'desks' | 'rooms' | 'parking' | 'lockers'>('desks');

  // ---------------------------------------------------------
  // MOCK REAL-TIME TICKER NOTIFICATIONS
  // ---------------------------------------------------------
  const [tickerNotification, setTickerNotification] = useState<string>(
    'Alex T. checked into Desk D-03 via QR code.'
  );
  const [tickerFade, setTickerFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerFade(false);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * SIMULATED_TICKER_PHRASES.length);
        setTickerNotification(SIMULATED_TICKER_PHRASES[randomIndex]);
        setTickerFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------
  // MAP PLAYGROUND STATES
  // ---------------------------------------------------------
  const [desksList, setDesksList] = useState<DeskInfo[]>(INITIAL_DESKS);
  const [roomsList, setRoomsList] = useState<RoomInfo[]>(INITIAL_ROOMS);
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const selectedDeskObj = useMemo(() => {
    return desksList.find(d => d.id === selectedDeskId) || null;
  }, [desksList, selectedDeskId]);

  const selectedRoomObj = useMemo(() => {
    return roomsList.find(r => r.id === selectedRoomId) || null;
  }, [roomsList, selectedRoomId]);

  const handleSelectDesk = (id: string) => {
    setSelectedRoomId(null);
    setSelectedDeskId(id);
    setBookingSuccess(false);
  };

  const handleSelectRoom = (id: string) => {
    setSelectedDeskId(null);
    setSelectedRoomId(id);
    setBookingSuccess(false);
  };

  const executeMockBooking = () => {
    if (!selectedDeskId) return;
    setBookingLoading(true);
    setTimeout(() => {
      setDesksList(prev =>
        prev.map(d => (d.id === selectedDeskId ? { ...d, status: 'mine', occupant: 'You (Visitor)' } : d))
      );
      setBookingLoading(false);
      setBookingSuccess(true);
    }, 1200);
  };

  const executeMockRelease = () => {
    if (!selectedDeskId) return;
    setDesksList(prev =>
      prev.map(d => (d.id === selectedDeskId ? { ...d, status: 'available', occupant: undefined } : d))
    );
    setBookingSuccess(false);
  };

  // ---------------------------------------------------------
  // TEAM COORDINATION WEEKLY TIMELINE STATES
  // ---------------------------------------------------------
  type Weekdays = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  const [selectedDay, setSelectedDay] = useState<Weekdays>('Tuesday');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const filteredTeammates = useMemo(() => {
    return TEAMMATES_DATA.filter(teammate => {
      if (selectedDept === 'All') return true;
      return teammate.dept.toLowerCase() === selectedDept.toLowerCase();
    });
  }, [selectedDept]);

  const collaborationMetrics = useMemo(() => {
    const teammatesInSelectedDay = filteredTeammates.filter(
      t => t.schedule[selectedDay].status === 'office'
    );
    const countInOffice = teammatesInSelectedDay.length;
    const ratio = filteredTeammates.length > 0 ? (countInOffice / filteredTeammates.length) * 100 : 0;
    return {
      inOffice: countInOffice,
      remote: filteredTeammates.filter(t => t.schedule[selectedDay].status === 'remote').length,
      out: filteredTeammates.filter(t => t.schedule[selectedDay].status === 'off').length,
      overlapScore: Math.round(ratio)
    };
  }, [filteredTeammates, selectedDay]);

  // ---------------------------------------------------------
  // ANALYTICS TAB & SAVINGS CALCULATOR STATES
  // ---------------------------------------------------------
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'trends' | 'peak' | 'recycling'>('trends');

  // Sliders for dynamic math
  const [calcEmployees, setCalcEmployees] = useState(250);
  const [calcRemoteDays, setCalcRemoteDays] = useState(3.0);
  const [calcDeskCost, setCalcDeskCost] = useState(450);

  const savingsMath = useMemo(() => {
    // 5 days week. Employee in office = (5 - remoteDays)
    // Under static model: 1 desk per employee = calcEmployees
    // Under hybrid model: sharing ratio.
    const averageOfficeDays = 5.0 - calcRemoteDays;
    const peakFactor = 1.25; // accounts for busier peak days (Tue/Wed/Thu)
    const ratioNeeded = averageOfficeDays / 5.0;
    const optimizedDesks = Math.max(
      10,
      Math.ceil(calcEmployees * ratioNeeded * peakFactor)
    );
    const deskReduction = Math.max(0, calcEmployees - optimizedDesks);
    const monthlyRentSaved = deskReduction * calcDeskCost;
    const annualRentSaved = monthlyRentSaved * 12;
    const carbonOffset = Math.round(calcEmployees * calcRemoteDays * 0.16 * 10) / 10; // metric tons of CO2 per year
    const areaSqFtSaved = deskReduction * 110; // approx 110 sq ft per desk station inclusive of aisles

    return {
      optimizedDesks,
      deskReduction,
      monthlyRentSaved,
      annualRentSaved,
      carbonOffset,
      areaSqFtSaved,
      sharingRatio: Math.round((calcEmployees / optimizedDesks) * 10) / 10
    };
  }, [calcEmployees, calcRemoteDays, calcDeskCost]);

  // ---------------------------------------------------------
  // STEPPER STEP FLOW WIZARD
  // ---------------------------------------------------------
  const [stepperIndex, setStepperIndex] = useState(0);
  const STEPPER_PAGES = [
    {
      title: 'Choose Spot & Reserve',
      desc: 'Browse the interactive live office map. Filter by dual screens, window view, or teammate proximity, and book in a single tap.',
      imageSvg: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-brand-500 animate-pulse">
          <rect x="10" y="10" width="80" height="80" rx="12" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
          <rect x="25" y="30" width="20" height="15" rx="3" fill="currentColor" fillOpacity="0.4" />
          <rect x="55" y="30" width="20" height="15" rx="3" fill="currentColor" fillOpacity="0.4" />
          <rect x="25" y="55" width="20" height="15" rx="3" fill="currentColor" fillOpacity="0.2" />
          <circle cx="65" cy="62" r="6" fill="#22c55e" />
          <path d="M62 62h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'Check-in on Arrival',
      desc: 'Scan the unique QR code on the desk or tap "Check In" on your phone. Reassures the system that you have claimed your spot.',
      imageSvg: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-amber-500">
          <rect x="20" y="15" width="60" height="70" rx="8" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
          <rect x="35" y="30" width="30" height="30" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
          <rect x="42" y="37" width="6" height="6" fill="currentColor" />
          <rect x="52" y="37" width="6" height="6" fill="currentColor" />
          <rect x="42" y="47" width="6" height="6" fill="currentColor" />
          <rect x="52" y="47" width="6" height="6" fill="currentColor" />
          <path d="M30 75h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: 'Auto-Release Idle Desks',
      desc: 'No-show check-in timers automatically release unclaimed spaces. If a teammate doesn\'t show up, the desk opens up for others.',
      imageSvg: (
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-emerald-500">
          <circle cx="50" cy="50" r="40" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M50 25v25l15 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="65" cy="33" r="10" fill="#ef4444" />
          <path d="M62 33h6" stroke="white" strokeWidth="2" />
        </svg>
      )
    }
  ];

  // ---------------------------------------------------------
  // FAQ INTERACTIVE FILTER STATES
  // ---------------------------------------------------------
  const [faqSearch, setFaqSearch] = useState('');
  const [faqSelectedCategory, setFaqSelectedCategory] = useState<'all' | 'general' | 'booking' | 'release' | 'admin'>('all');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const filteredFAQs = useMemo(() => {
    return FAQS.filter(faq => {
      const matchesCategory = faqSelectedCategory === 'all' || faq.category === faqSelectedCategory;
      const matchesSearch =
        faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.a.toLowerCase().includes(faqSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqSearch, faqSelectedCategory]);

  // ---------------------------------------------------------
  // NEWSLETTER STATE
  // ---------------------------------------------------------
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2000);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      {/* ---------------------------------------------------------
          FLOATING ACTIVITY FEED TICKER
          --------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-40 max-w-sm hidden sm:block">
        <div className={`glass-panel border p-4 rounded-xl shadow-xl transition-all duration-300 transform ${tickerFade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Live Office Activity</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mt-0.5">{tickerNotification}</p>
            </div>
            <Sparkles className="w-4 h-4 text-brand-500" />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------
          NAVIGATION BAR
          --------------------------------------------------------- */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={darkMode ? "/grabdesk light.svg" : "/grabdesk.svg"} alt="GrabDesk Logo" className="h-7 sm:h-8 w-auto" />
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Features</a>
            <a href="#floor-playground" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Interactive Demo</a>
            <a href="#team-timeline" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">Weekly Planner</a>
            <a href="#savings-calculator" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">ROI Calculator</a>
            <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">FAQs</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all active:scale-90"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* CTA Buttons */}
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Log in
            </button>
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 px-4 rounded-xl text-xs sm:text-sm whitespace-nowrap bg-brand-500 text-white"
            >
              Get started free
            </Button>

            {/* Mobile menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Features
            </a>
            <a
              href="#floor-playground"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Interactive Demo
            </a>
            <a
              href="#team-timeline"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Weekly Planner
            </a>
            <a
              href="#savings-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ROI Calculator
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              FAQs
            </a>
            <hr className="border-gray-100 dark:border-gray-800" />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Log in
            </button>
          </div>
        )}
      </nav>

      {/* ---------------------------------------------------------
          HERO SECTION
          --------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        {/* Background Grid & Decorative radial glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
            Your office{' '}
            <span className="text-brand-500 bg-brand-50 dark:bg-brand-950 px-3 rounded-2xl">
              organised
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate morning desk-hunting. GrabDesk gives hybrid teams interactive floor blueprints to book desks, coordinate weekly schedules, and recycle unused workspaces automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 px-8 py-3"
              iconRight={<ArrowRight className="w-5 h-5" />}
            >
              Get started for free
            </Button>
            <a
              href="#floor-playground"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Explore Live Demo
            </a>
          </div>

          {/* Social Proof Logobar */}
          <div className="mt-20 border-t border-gray-200/50 dark:border-gray-800/50 pt-10">
            <p className="text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-6">
              Coordinating workspaces for teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {LOGOS.map((logo, idx) => (
                <span
                  key={idx}
                  className="text-lg md:text-xl font-bold tracking-tight text-gray-400/60 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300 select-none"
                  style={{ animationDelay: logo.delay }}
                >
                  {logo.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          INTERACTIVE FLOOR MAP PLAYGROUND
          --------------------------------------------------------- */}
      <section id="floor-playground" className="py-24 border-t border-gray-100 dark:border-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-xs font-semibold mb-4">
              <Map className="w-3.5 h-3.5" /> Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Test-drive our Office Blueprint
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              Click on the desks and meeting rooms below to simulate booking, check live occupancy details, and preview the QR-code workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Office Map blueprint Grid */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-brand-500" />
                    HQ Floor 1 — Shared Office Suite
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Click any desk or room to interact</p>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Yours
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Maintenance
                  </span>
                </div>
              </div>

              {/* Blueprint Layout Grid with horizontal scroll on mobile to preserve office layout */}
              <div className="w-full overflow-x-auto pb-4 scrollbar-thin select-none">
                <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-gray-950/50 min-h-[400px] grid grid-cols-12 gap-4 min-w-[760px]">

                {/* Boardroom (Left Top) */}
                <div
                  onClick={() => handleSelectRoom('R-01')}
                  className={`col-span-4 row-span-2 rounded-xl p-4 border transition-all cursor-pointer select-none flex flex-col justify-between ${selectedRoomId === 'R-01'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-md ring-2 ring-brand-400/50'
                    : roomsList[0].status === 'occupied'
                      ? 'border-red-200 dark:border-red-950/50 bg-red-50/20 dark:bg-red-950/5 hover:bg-red-50/40'
                      : 'border-emerald-200 dark:border-emerald-950/50 bg-emerald-50/20 dark:bg-emerald-950/5 hover:bg-emerald-50/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">BOARDROOM</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${roomsList[0].status === 'occupied'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      }`}>
                      {roomsList[0].status === 'occupied' ? 'Occupied' : 'Free'}
                    </span>
                  </div>
                  <div className="my-2">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{roomsList[0].name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Capacity: {roomsList[0].capacity} seats</p>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t border-gray-200/50 dark:border-gray-800/50 pt-1.5 flex justify-between">
                    <span>📺 TV · 📋 Board</span>
                    {roomsList[0].timeRemaining && (
                      <span className="text-rose-500 font-semibold">{roomsList[0].timeRemaining} left</span>
                    )}
                  </div>
                </div>

                {/* Open Collaborative Space (Center top) */}
                <div className="col-span-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 p-3 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">COLLABORATION ZONE</span>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">☕ Coffee Bar</span>
                    <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">🛋️ Sofas</span>
                  </div>
                </div>

                {/* Huddle Room (Right Top) */}
                <div
                  onClick={() => handleSelectRoom('R-02')}
                  className={`col-span-3 rounded-xl p-3 border transition-all cursor-pointer select-none flex flex-col justify-between ${selectedRoomId === 'R-02'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-md ring-2 ring-brand-400/50'
                    : roomsList[1].status === 'occupied'
                      ? 'border-red-200 dark:border-red-950/50 bg-red-50/20 dark:bg-red-950/5 hover:bg-red-50/40'
                      : 'border-emerald-200 dark:border-emerald-950/50 bg-emerald-50/20 dark:bg-emerald-950/5 hover:bg-emerald-50/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-500">HUDDLE</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${roomsList[1].status === 'occupied' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950'
                      }`}>
                      {roomsList[1].status === 'occupied' ? 'Busy' : 'Free'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">{roomsList[1].name}</p>
                </div>

                {/* Quiet phone booths (Right middle) */}
                <div className="col-span-3 rounded-xl border border-gray-200 dark:border-gray-800 p-2 grid grid-cols-2 gap-2 bg-gray-100/30 dark:bg-gray-900/30">
                  <div
                    onClick={() => handleSelectRoom('R-03')}
                    className={`rounded-lg border p-1 text-center cursor-pointer transition-all ${selectedRoomId === 'R-03'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                      : 'border-red-200 dark:border-red-950/40 bg-red-50/10 hover:bg-red-50/20'
                      }`}
                  >
                    <p className="text-[8px] font-extrabold text-gray-400">BOOTH 1</p>
                    <span className="text-[9px] text-red-500 font-bold">🔒 Busy</span>
                  </div>
                  <div
                    className="rounded-lg border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/10 p-1 text-center cursor-not-allowed"
                  >
                    <p className="text-[8px] font-extrabold text-gray-400">BOOTH 2</p>
                    <span className="text-[9px] text-emerald-600 font-bold">🟢 Free</span>
                  </div>
                </div>

                {/* Desk Workstation layout (Ground section) */}
                <div className="col-span-12 mt-4 grid grid-cols-2 sm:grid-cols-7 gap-3">
                  {desksList.map(desk => {
                    const isSelected = selectedDeskId === desk.id;
                    let deskStyle = 'border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200';
                    if (isSelected) {
                      deskStyle = 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 shadow-md ring-2 ring-brand-400/40';
                    } else if (desk.status === 'occupied') {
                      deskStyle = 'border-rose-100 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10 text-rose-800 dark:text-rose-400';
                    } else if (desk.status === 'mine') {
                      deskStyle = 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold animate-pulse';
                    } else if (desk.status === 'maintenance') {
                      deskStyle = 'border-gray-100 dark:border-gray-800 bg-gray-150/40 dark:bg-gray-900/20 text-gray-400 dark:text-gray-600 cursor-not-allowed';
                    }

                    return (
                      <div
                        key={desk.id}
                        onClick={() => desk.status !== 'maintenance' && handleSelectDesk(desk.id)}
                        className={`border rounded-xl p-3 flex flex-col justify-between items-center text-center cursor-pointer transition-all select-none h-24 shadow-sm active:scale-95 ${deskStyle}`}
                      >
                        <div className="w-full flex items-center justify-between text-[8px] font-bold text-gray-400 dark:text-gray-500">
                          <span>{desk.zone.substring(0, 5).toUpperCase()}</span>
                          {desk.window && <span>🪟</span>}
                        </div>

                        <div className="my-1">
                          <p className="text-sm font-black">{desk.id}</p>
                          <div className="flex gap-0.5 justify-center mt-0.5">
                            {Array.from({ length: desk.monitors }).map((_, i) => (
                              <span key={i} className="w-1.5 h-1 bg-gray-400 dark:bg-gray-500 rounded" />
                            ))}
                          </div>
                        </div>

                        <div className="w-full">
                          {desk.status === 'occupied' ? (
                            <span className="text-[8px] bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-1 py-0.5 rounded font-medium truncate block">
                              {desk.occupant}
                            </span>
                          ) : desk.status === 'mine' ? (
                            <span className="text-[8px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-1 py-0.5 rounded font-bold block">
                              Booked 🌟
                            </span>
                          ) : desk.status === 'maintenance' ? (
                            <span className="text-[8px] text-gray-400 dark:text-gray-600 block">Blocked</span>
                          ) : (
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-1 py-0.5 rounded font-medium block">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>

            {/* Selection Sidebar Console */}
            <div className="lg:col-span-4 space-y-6">
              {/* Active Selection Details Console */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 dark:bg-brand-500/5 blur-3xl rounded-full" />

                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-brand-500" />
                  Space Console
                </h3>

                {selectedDeskObj ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <span className="text-xs text-gray-400">Desk Station</span>
                        <p className="text-2xl font-black text-gray-800 dark:text-white">{selectedDeskObj.id}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${selectedDeskObj.status === 'available'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950'
                        : selectedDeskObj.status === 'mine'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                        }`}>
                        {selectedDeskObj.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-gray-400 block">Zone:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{selectedDeskObj.zone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Screens:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{selectedDeskObj.monitors} Monitors</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Desk Type:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{selectedDeskObj.standing ? '📏 Standing' : '🪑 Standard'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Location:</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{selectedDeskObj.window ? '🏞️ Window View' : '🔌 Interior'}</span>
                      </div>
                    </div>

                    {selectedDeskObj.status === 'occupied' && (
                      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-950/50 text-xs">
                        <p className="font-bold text-rose-800 dark:text-rose-300">Occupied Spot</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Booked by {selectedDeskObj.occupant} from {selectedDeskObj.dept} team for the entire day.</p>
                      </div>
                    )}

                    {selectedDeskObj.status === 'mine' && (
                      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-950/50 text-xs space-y-2">
                        <p className="font-bold text-indigo-800 dark:text-indigo-300">🌟 Simulation Confirmed</p>
                        <p className="text-gray-500 dark:text-gray-400">You successfully booked this desk. Here is your mock check-in code:</p>
                        <div className="bg-white dark:bg-gray-950 p-2 border rounded border-indigo-200/50 flex justify-center">
                          {/* Micro QR SVG */}
                          <svg viewBox="0 0 100 100" className="w-20 h-20 text-gray-900 dark:text-white">
                            <rect width="100" height="100" fill="white" />
                            <rect x="10" y="10" width="30" height="30" fill="black" />
                            <rect x="15" y="15" width="20" height="20" fill="white" />
                            <rect x="18" y="18" width="14" height="14" fill="black" />
                            <rect x="60" y="10" width="30" height="30" fill="black" />
                            <rect x="65" y="15" width="20" height="20" fill="white" />
                            <rect x="68" y="18" width="14" height="14" fill="black" />
                            <rect x="10" y="60" width="30" height="30" fill="black" />
                            <rect x="15" y="65" width="20" height="20" fill="white" />
                            <rect x="18" y="68" width="14" height="14" fill="black" />
                            <rect x="50" y="50" width="10" height="10" fill="black" />
                            <rect x="70" y="70" width="15" height="15" fill="black" />
                            <rect x="80" y="55" width="10" height="15" fill="black" />
                          </svg>
                        </div>
                        <button
                          onClick={executeMockRelease}
                          className="w-full text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                        >
                          Cancel Booking & Free Spot
                        </button>
                      </div>
                    )}

                    {selectedDeskObj.status === 'available' && !bookingSuccess && (
                      <Button
                        loading={bookingLoading}
                        onClick={executeMockBooking}
                        className="w-full bg-brand-500 text-white rounded-xl shadow-md py-2.5 font-bold hover:bg-brand-600"
                      >
                        Reserve Desk {selectedDeskObj.id}
                      </Button>
                    )}
                  </div>
                ) : selectedRoomObj ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <span className="text-xs text-gray-400">Meeting Room</span>
                        <p className="text-lg font-black text-gray-800 dark:text-white leading-tight">{selectedRoomObj.name}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${selectedRoomObj.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {selectedRoomObj.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between">
                        <span className="text-gray-400">Max Occupancy:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{selectedRoomObj.capacity} people</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-400">Equipped with:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {selectedRoomObj.hasTv ? '📺 TV display ' : ''}
                          {selectedRoomObj.hasWhiteboard ? '· 📋 Whiteboard' : ''}
                        </span>
                      </p>
                    </div>

                    {selectedRoomObj.status === 'occupied' ? (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/50 p-3 rounded-xl text-xs">
                        <p className="font-bold text-amber-800 dark:text-amber-300">📅 Active Meeting: {selectedRoomObj.occupant}</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">This room is booked for another {selectedRoomObj.timeRemaining}. Smart panel indicates next slots are open.</p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/50 p-3 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                        🟢 Room is fully free. Open GrabDesk inside your workplace to check in instantly or schedule an ad-hoc sync.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Info className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No Spot Selected</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto">
                      Click any desk or conference room in the map blueprint to view detailed properties.
                    </p>
                  </div>
                )}
              </div>

              {/* Admin Policy Controls Previewer */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-brand-500" /> Admins Policy Panel
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span>Grace check-in release window</span>
                      <span className="text-brand-500 font-bold">15 minutes</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-1.5 w-1/4 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span>Maximum advance booking period</span>
                      <span className="text-brand-500 font-bold">14 days</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-500 h-1.5 w-1/2 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                    <span>⚠️ Auto-release release is active</span>
                    <span className="font-bold text-emerald-500">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          TEAM TIMELINE COORDINATOR WIDGET
          --------------------------------------------------------- */}
      <section id="team-timeline" className="py-24 bg-gray-100/50 dark:bg-gray-950/50 border-y border-gray-200/50 dark:border-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
              <Users className="w-3.5 h-3.5" /> Hybrid Team Planner
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Coordinate Office Days and Teams
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              Switch weekdays and departments below to simulate how teams plan their office presence together, boosting collaboration scores.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 mb-6">

              {/* Day Selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as Weekdays[]).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${selectedDay === day
                      ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Department filter */}
              <div className="flex items-center gap-1.5 w-full md:w-auto">
                <span className="text-xs text-gray-400 font-semibold uppercase whitespace-nowrap">Filter Dept:</span>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 border-none text-xs font-bold text-gray-700 dark:text-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            {/* Simulation Dashboard Output */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

              {/* Teammates List */}
              <div className="md:col-span-8 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Planned Schedule for {selectedDay}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredTeammates.map((teammate, i) => {
                    const status = teammate.schedule[selectedDay].status;
                    const desk = teammate.schedule[selectedDay].desk;

                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:shadow-md ${status === 'office'
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/30'
                          : status === 'remote'
                            ? 'bg-blue-50/10 dark:bg-blue-950/5 border-gray-100 dark:border-gray-800'
                            : 'bg-gray-50/50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800 opacity-60'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl bg-gray-100 dark:bg-gray-850 p-2 rounded-xl border border-gray-200/50 dark:border-gray-800">{teammate.avatar}</span>
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-150">{teammate.name}</p>
                            <p className="text-[10px] text-gray-400">{teammate.role} · {teammate.dept}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          {status === 'office' ? (
                            <span className="inline-flex flex-col items-end">
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                🏢 Office
                              </span>
                              <span className="text-[9px] text-gray-400 mt-1 font-mono">Desk: {desk}</span>
                            </span>
                          ) : status === 'remote' ? (
                            <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                              🏡 Remote
                            </span>
                          ) : (
                            <span className="text-[10px] bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold">
                              🌴 Out
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day Metrics Console */}
              <div className="md:col-span-4 bg-gray-50 dark:bg-gray-950/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Collaboration Heatmap</h4>

                  {/* Gauge representation */}
                  <div className="relative pt-2">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-gray-500">Co-presence score</span>
                      <span className="text-2xl font-black text-brand-500">{collaborationMetrics.overlapScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${collaborationMetrics.overlapScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                      {collaborationMetrics.overlapScore > 70
                        ? '🔥 Peak collaboration day! Excellent time to book team planning sessions.'
                        : '❄️ Low occupancy score. Best for deep focus work, fewer distractions.'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-4 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>🏢 Expected in Office:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{collaborationMetrics.inOffice} colleagues</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏡 Working Remotely:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{collaborationMetrics.remote} colleagues</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🌴 On Vacation/Off:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{collaborationMetrics.out} colleagues</span>
                  </div>
                </div>

                <div className="bg-brand-50 dark:bg-brand-950/20 p-3 rounded-xl border border-brand-100 dark:border-brand-950/50 text-[11px] text-brand-700 dark:text-brand-400">
                  💡 **Pro Tip**: Tuesday and Wednesday are the most active days this week. Coordinate adjacent desk bookings to streamline your physical workspace footprint.
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          WORKSPACE SPECIFIC HIGHLIGHTS (TABS SYSTEM)
          --------------------------------------------------------- */}
      <section id="features" className="py-24 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              One platform. Every shared workspace.
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              GrabDesk covers desks, conference rooms, parking bays, and storage lockers under a unified coordination ledger.
            </p>
          </div>

          {/* Feature Tabs header */}
          <div className="flex justify-center mb-10 max-w-full">
            <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl max-w-full overflow-x-auto scrollbar-none">
              {(['desks', 'rooms', 'parking', 'lockers'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${activeCategory === tab
                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-250'
                    }`}
                >
                  {tab === 'desks' && <Building className="w-4 h-4" />}
                  {tab === 'rooms' && <Users className="w-4 h-4" />}
                  {tab === 'parking' && <Car className="w-4 h-4" />}
                  {tab === 'lockers' && <Lock className="w-4 h-4" />}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Tab Pane content */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">

            <div className="lg:col-span-5 p-8 sm:p-12 space-y-6">
              {activeCategory === 'desks' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <Building className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Smart Hot-Desking & Touchpoints</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Optimize employee flow. Define dedicated team neighborhoods, establish check-in rules to verify reservations, and allow workers to choose standing desks, dual screens, or proximity to colleagues.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">🟢 QR Check-in release window (auto-cancels no-shows)</li>
                    <li className="flex items-center gap-2">🟢 Proximity searching (sit next to your teammates)</li>
                    <li className="flex items-center gap-2">🟢 Live maps illustrating exact desk occupancy</li>
                  </ul>
                </>
              )}

              {activeCategory === 'rooms' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Meeting Room Scheduling</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Prevent double bookings. Integrate directly with Google Calendar and Outlook Outlook resources, allow ad-hoc scheduling via physical QR tags outside the room, and auto-release space on early meeting exit.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">🟢 Outlook & Google Workspace native bi-directional sync</li>
                    <li className="flex items-center gap-2">🟢 Amenities check (TV displays, camera arrays, whiteboards)</li>
                    <li className="flex items-center gap-2">🟢 Space analytics tracking room sizes vs. actual attendants</li>
                  </ul>
                </>
              )}

              {activeCategory === 'parking' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Commute & Parking Allotment</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Avoid employee morning gate scrambles. Reserve vehicle spaces, match electric vehicles (EV) to active charging bays, and input license plate numbers so security teams can verify entries.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">🟢 License plate verification for security gate access</li>
                    <li className="flex items-center gap-2">🟢 Filter options for EV Chargers or covered parking spaces</li>
                    <li className="flex items-center gap-2">🟢 Multi-spot allocation rules for visiting clients</li>
                  </ul>
                </>
              )}

              {activeCategory === 'lockers' && (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Day Locker Allocator</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Enable secure storage. Users can claim day lockers from the map during desk check-in. The system automatically releases lock tokens upon check-out, ensuring high rotation.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">🟢 Secure dynamic passcode code delivery</li>
                    <li className="flex items-center gap-2">🟢 Interactive locker layout maps next to desk areas</li>
                    <li className="flex items-center gap-2">🟢 Automated end-of-day empty indicators</li>
                  </ul>
                </>
              )}
            </div>

            <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-950 p-8 sm:p-12 border-l border-gray-100 dark:border-gray-800 flex justify-center items-center">
              {/* Interactive Visual Graphic Mockups */}
              <div className="w-full max-w-md aspect-video bg-white dark:bg-gray-900 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-md p-6 flex flex-col justify-between">
                {activeCategory === 'desks' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Desk Option #D-12</span>
                      <span className="text-[10px] text-emerald-500 font-bold">🟢 Free</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between"><span>Monitor:</span><span className="font-bold">Dual 27" Monitors</span></p>
                      <p className="flex justify-between"><span>Desk Height:</span><span className="font-bold">Electric Standing Desk</span></p>
                      <p className="flex justify-between"><span>Location:</span><span className="font-bold">Window Side (Quiet Zone)</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg">Confirm Reservation</Button>
                    </div>
                  </div>
                )}

                {activeCategory === 'rooms' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Huddle Room Alpha</span>
                      <span className="text-[10px] text-rose-500 font-bold">🔴 Busy until 12:30 PM</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between"><span>Capacity:</span><span className="font-bold">6 Persons</span></p>
                      <p className="flex justify-between"><span>VC Support:</span><span className="font-bold">Logitech Rally Bar (Zoom/Teams)</span></p>
                      <p className="flex justify-between"><span>Upcoming:</span><span className="font-bold text-brand-500">Sales Demo (1:00 PM)</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-1.5 rounded-lg text-xs font-bold transition-all">Book Next Available Slot</button>
                    </div>
                  </div>
                )}

                {activeCategory === 'parking' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">EV Space E-04</span>
                      <span className="text-[10px] text-emerald-500 font-bold">🟢 Charging Active</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between"><span>Vehicle Type:</span><span className="font-bold">EV Charger (Type 2)</span></p>
                      <p className="flex justify-between"><span>Level:</span><span className="font-bold">Basement 1 (Section B)</span></p>
                      <p className="flex justify-between"><span>Verify Plate:</span><span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-bold">DE-892-A</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="w-full bg-brand-500 text-white rounded-lg">Book Parking Bay</Button>
                    </div>
                  </div>
                )}

                {activeCategory === 'lockers' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Locker #34</span>
                      <span className="text-[10px] text-indigo-500 font-bold">🔐 Assigned (Active)</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between"><span>Duration:</span><span className="font-bold">Daily Rotational</span></p>
                      <p className="flex justify-between"><span>Size:</span><span className="font-bold">Medium (Fits Laptop & Backpack)</span></p>
                      <p className="flex justify-between"><span>Temporary Code:</span><span className="font-mono bg-gray-100 dark:bg-gray-850 px-1 py-0.5 rounded font-bold text-brand-500">4892#</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-1.5 rounded-lg text-xs font-bold transition-all">Claim Day Locker</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          ANALYTICS SANDBOX & DASHBOARD PREVIEW
          --------------------------------------------------------- */}
      <section className="py-24 bg-gray-100/50 dark:bg-gray-950/50 border-y border-gray-200/50 dark:border-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4">
              <BarChart3 className="w-3.5 h-3.5" /> Workspace Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Real Data for Facility Decisions
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              Interactive preview of the analytical reports provided to admins. Click the charts below to toggle views.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Chart Side */}
            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                    Utilisation Reports
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveAnalyticsTab('trends')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${activeAnalyticsTab === 'trends'
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                      Weekly Occupancy
                    </button>
                    <button
                      onClick={() => setActiveAnalyticsTab('peak')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${activeAnalyticsTab === 'peak'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                      Peak Hours
                    </button>
                    <button
                      onClick={() => setActiveAnalyticsTab('recycling')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${activeAnalyticsTab === 'recycling'
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                      Seat Recycle Rates
                    </button>
                  </div>
                </div>

                {/* Simulated SVG Graph Container */}
                <div className="relative aspect-video bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col justify-end">

                  {activeAnalyticsTab === 'trends' && (
                    <>
                      {/* Weekly trend Area chart */}
                      <svg className="w-full h-44 text-brand-500" viewBox="0 0 500 150">
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d="M0 130 C 50 110, 100 40, 150 50 C 200 60, 250 30, 300 45 C 350 60, 400 90, 450 110 L 500 140 L 500 150 L 0 150 Z"
                          fill="url(#trendGradient)"
                        />
                        {/* Line */}
                        <path
                          d="M0 130 C 50 110, 100 40, 150 50 C 200 60, 250 30, 300 45 C 350 60, 400 90, 450 110 L 500 140"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Dots */}
                        <circle cx="100" cy="40" r="5" fill="currentColor" stroke="white" strokeWidth="2" />
                        <circle cx="250" cy="30" r="5" fill="currentColor" stroke="white" strokeWidth="2" />
                        <circle cx="300" cy="45" r="5" fill="currentColor" stroke="white" strokeWidth="2" />
                      </svg>
                      {/* X axis labels */}
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold px-2 mt-4 font-mono">
                        <span>MON (42%)</span>
                        <span>TUE (84%)</span>
                        <span>WED (89%)</span>
                        <span>THU (79%)</span>
                        <span>FRI (31%)</span>
                      </div>
                    </>
                  )}

                  {activeAnalyticsTab === 'peak' && (
                    <>
                      {/* Hourly peak Bar chart */}
                      <div className="h-44 w-full flex items-end justify-between px-6">
                        {[
                          { hour: '08 AM', val: '25%' },
                          { hour: '10 AM', val: '80%' },
                          { hour: '12 PM', val: '92%' },
                          { hour: '02 PM', val: '88%' },
                          { hour: '04 PM', val: '65%' },
                          { hour: '06 PM', val: '18%' }
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[50px]">
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-t-lg h-36 flex items-end">
                              <div
                                className="bg-brand-500 w-full rounded-t-lg transition-all duration-700"
                                style={{ height: item.val }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 font-bold whitespace-nowrap">{item.hour}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeAnalyticsTab === 'recycling' && (
                    <>
                      {/* Seat recycling metrics donut/lines */}
                      <div className="h-44 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        <div className="flex justify-center">
                          <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#724b68"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray="251.2"
                              strokeDashoffset="65"
                              strokeLinecap="round"
                            />
                            {/* Inner Text */}
                            <text
                              x="50"
                              y="-45"
                              transform="rotate(90)"
                              textAnchor="middle"
                              alignmentBaseline="middle"
                              className="text-base font-black fill-gray-900 dark:fill-white font-sans"
                            >
                              74%
                            </text>
                          </svg>
                        </div>
                        <div className="space-y-3 text-xs">
                          <p className="font-bold text-gray-800 dark:text-gray-200">Weekly Reused Space Ratio</p>
                          <p className="text-gray-400">Desks booked by multiple workers due to auto-release grace check-in timers.</p>
                          <div className="flex justify-between text-[11px] border-t border-gray-100 dark:border-gray-800 pt-2 text-gray-500">
                            <span>🔄 Freed desks:</span>
                            <span className="font-bold text-emerald-500">142 slots this week</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>

            {/* Readout Side */}
            <div className="lg:col-span-4 bg-gray-50 dark:bg-gray-950 p-6 sm:p-8 border-l border-gray-200/50 dark:border-gray-800/50 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Space Optimization Insights</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Peak Day</p>
                    <p className="text-lg font-black text-gray-800 dark:text-white mt-0.5">Wednesday</p>
                    <p className="text-[10px] text-gray-500 mt-1">Average 89% Desk Occupancy. Safe limits are fully respected.</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Carbon Offset Estimation</p>
                    <p className="text-lg font-black text-emerald-500 mt-0.5">4.2 Metric Tons CO2</p>
                    <p className="text-[10px] text-gray-500 mt-1">Saved from hybrid commuting reductions this week.</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">No-show Releases</p>
                    <p className="text-lg font-black text-indigo-500 mt-0.5">14.6% Auto-Released</p>
                    <p className="text-[10px] text-gray-500 mt-1">Saves layout costs by returning dead space to pool.</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-200/50 dark:border-gray-800/50 pt-4">
                📊 Note: This dataset is calculated based on active bookings check-ins over a rolling 30-day corporate calendar window.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          INTERACTIVE DYNAMIC SAVINGS & ROI CALCULATOR
          --------------------------------------------------------- */}
      <section id="savings-calculator" className="py-24 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
              <DollarSign className="w-3.5 h-3.5" /> Workspace ROI Calculator
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Calculate Hybrid Office Space Savings
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              Drag the parameters below to compute optimized sharing ratios, real estate square footage saved, and monthly cost reductions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

            {/* Slider Inputs Pane */}
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-8">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Adjust Parameters</h3>

              {/* Employee Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Number of Hybrid Employees</span>
                  <span className="text-brand-500 text-sm font-black">{calcEmployees} staff</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={calcEmployees}
                  onChange={e => setCalcEmployees(Number(e.target.value))}
                  className="w-full accent-brand-500 bg-gray-200 dark:bg-gray-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>10 Staff</span>
                  <span>1000 Staff</span>
                </div>
              </div>

              {/* Remote Days Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Average Remote Days (Weekly)</span>
                  <span className="text-brand-500 text-sm font-black">{calcRemoteDays.toFixed(1)} days/week</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={calcRemoteDays}
                  onChange={e => setCalcRemoteDays(Number(e.target.value))}
                  className="w-full accent-brand-500 bg-gray-200 dark:bg-gray-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>0 Days (Full Office)</span>
                  <span>5 Days (Full WFH)</span>
                </div>
              </div>

              {/* Desk cost Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Monthly Real Estate Cost per Desk</span>
                  <span className="text-brand-500 text-sm font-black">${calcDeskCost} / desk</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={calcDeskCost}
                  onChange={e => setCalcDeskCost(Number(e.target.value))}
                  className="w-full accent-brand-500 bg-gray-200 dark:bg-gray-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400">
                  <span>$100/mo</span>
                  <span>$1200/mo</span>
                </div>
              </div>
            </div>

            {/* Calculations Output Pane */}
            <div className="lg:col-span-6 bg-gray-50 dark:bg-gray-950 p-8 sm:p-12 border-l border-gray-100 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">Optimized Space Allocation</h3>

                <div className="grid grid-cols-2 gap-4">

                  {/* Shared desk ratio */}
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Sharing Ratio</span>
                    <p className="text-2xl font-black text-brand-500 mt-1">{savingsMath.sharingRatio}:1</p>
                    <span className="text-[9px] text-gray-400">Employees per desk</span>
                  </div>

                  {/* Desk count required */}
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Desks Needed</span>
                    <p className="text-2xl font-black text-gray-800 dark:text-white mt-1">{savingsMath.optimizedDesks}</p>
                    <span className="text-[9px] text-gray-400">vs {calcEmployees} fixed desks</span>
                  </div>

                  {/* Footprint footprint area saved */}
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Footprint Saved</span>
                    <p className="text-lg font-black text-gray-850 dark:text-gray-100 mt-1">{savingsMath.areaSqFtSaved.toLocaleString()} sq ft</p>
                    <span className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> Space saved</span>
                  </div>

                  {/* CO2 Emissions Offset */}
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Carbon Offset</span>
                    <p className="text-lg font-black text-emerald-500 mt-1">-{savingsMath.carbonOffset} T / yr</p>
                    <span className="text-[9px] text-gray-400">Reduced car travel emissions</span>
                  </div>
                </div>

                {/* Final Cost Savings Display */}
                <div className="mt-6 bg-brand-500 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 blur-xl rounded-full" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Estimated Office Rental Savings</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black">${savingsMath.annualRentSaved.toLocaleString()}</span>
                    <span className="text-xs opacity-80">/ year saved</span>
                  </div>
                  <p className="text-[10px] opacity-90 mt-2 leading-relaxed">
                    By implementing a sharing policy on GrabDesk, you reduce desk layout demands by {savingsMath.deskReduction} workspaces, saving ${(savingsMath.monthlyRentSaved).toLocaleString()} in monthly office space expenses.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 text-center mt-6">
                * Calculators apply standard hybrid floorplan peak occupancy coefficients (1.25). Actual rental savings may vary.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          STEP FLOW ONBOARDING DEMO
          --------------------------------------------------------- */}
      <section className="py-24 bg-gray-100/50 dark:bg-gray-950/50 border-t border-gray-200/50 dark:border-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight animate-fade-in">
              Three simple steps to hybrid harmony
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              GrabDesk connects layout blueprints to user schedules in real-time. Here is how simple the daily routine is.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPPER_PAGES.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setStepperIndex(idx)}
                className={`bg-white dark:bg-gray-900 rounded-3xl border p-6 shadow-xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${stepperIndex === idx ? 'border-brand-500 ring-2 ring-brand-400/30' : 'border-gray-200/60 dark:border-gray-800'
                  }`}
              >
                <div>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-4 ${stepperIndex === idx ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-850 text-gray-500'
                    }`}>
                    0{idx + 1}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{step.desc}</p>
                </div>
                <div className="flex justify-center border-t border-gray-100 dark:border-gray-850 pt-4 bg-gray-50/50 dark:bg-gray-950/20 rounded-b-2xl">
                  {step.imageSvg}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          TESTIMONIALS SECTION
          --------------------------------------------------------- */}
      <section className="py-24 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Loved by hybrid teams everywhere
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-4">
              Here is how office managers, lead developers, and corporate facility directors plan their work weeks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="flex gap-0.5 text-amber-500 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                    {t.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.avatarBg}`}>
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          FAQ SECTION (FILTERABLE & ACCORDIONS)
          --------------------------------------------------------- */}
      <section id="faq" className="py-24 bg-gray-100/50 dark:bg-gray-950/50 border-t border-gray-200/50 dark:border-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Search by keywords or filter by category to find quick answers about GrabDesk.
            </p>
          </div>

          {/* Search bar & filter pills */}
          <div className="space-y-4 mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search queries..."
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-3 outline-none text-xs focus:ring-1 focus:ring-brand-500 placeholder:text-gray-400 text-gray-800 dark:text-gray-100 transition-all shadow-sm"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {(['all', 'general', 'booking', 'release', 'admin'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFaqSelectedCategory(cat)}
                  className={`text-[10px] px-3.5 py-1.5 rounded-full font-bold transition-all uppercase tracking-wider ${faqSelectedCategory === cat
                    ? 'bg-brand-500 text-white'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordions List */}
          <div className="space-y-3 min-h-[200px]">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => {
                const isOpen = faqOpenIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-250/70 dark:border-gray-800/80 overflow-hidden cursor-pointer hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-gray-900 dark:text-white select-none">
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : ''}`} />
                    </div>
                    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-400">No match found</p>
                <p className="text-[10px] text-gray-400 mt-1">Try expanding or rewriting your search words.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------
          CTA SECTION
          --------------------------------------------------------- */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-brand-500 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#ffffff15_0%,transparent_50%),radial-gradient(circle_at_top_right,#ffffff15_0%,transparent_50%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to optimize your hybrid workspace layout?
          </h2>
          <p className="text-base sm:text-lg text-brand-100 max-w-xl mx-auto leading-relaxed">
            Join thousands of teams using GrabDesk to book desks, schedule meetings, coordinate schedules, and cut office expenses.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white text-brand-600 font-bold hover:bg-gray-100 rounded-xl px-8 shadow-xl"
              iconRight={<ArrowRight className="w-5 h-5 text-brand-500" />}
            >
              Get Started Free
            </Button>
            <a
              href="#floor-playground"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white hover:text-brand-100 bg-brand-700/40 hover:bg-brand-700/60 rounded-xl border border-white/20 transition-all"
            >
              Explore Live Demo
            </a>
          </div>

          <p className="text-xs text-brand-100 opacity-90">
            Free tier includes 15 users, unlimited desk reservations. No credit card required.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------
          FOOTER SECTION
          --------------------------------------------------------- */}
      <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">

            {/* Column 1: Info & Brand */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <img src="/grabdesk light.svg" alt="GrabDesk Logo" className="h-8 w-auto" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                Unified workplace coordinates for remote and in-office hybrid teams. Desk bookings, meeting scheduling, electric charging parking slots, and digital locker reservations.
              </p>
              <div className="flex gap-4 pt-2">
                <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-800">TW</span>
                <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-800">GH</span>
                <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-800">LD</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#floor-playground" className="hover:text-white transition-colors">Office Blueprints</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Desk Management</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Meeting Rooms</a></li>
                <li><a href="#savings-calculator" className="hover:text-white transition-colors">Pricing Options</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#faq" className="hover:text-white transition-colors">Help Center / FAQs</a></li>
                <li><a href="#team-timeline" className="hover:text-white transition-colors">Weekly Planner</a></li>
                <li><a href="#savings-calculator" className="hover:text-white transition-colors">ROI Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subscribe to Hybrid Weekly</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Receive curated articles detailing workspace optimization, facility planning, and hybrid office culture.
              </p>

              {newsletterSubscribed ? (
                <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-400 p-3 rounded-xl text-xs font-bold">
                  ✓ Check your email inbox to verify subscription!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter business email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-full focus:ring-1 focus:ring-brand-500 placeholder:text-gray-600"
                  />
                  <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 text-xs font-bold transition-colors whitespace-nowrap">
                    Sign Up
                  </button>
                </form>
              )}
            </div>

          </div>

          <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 gap-4">
            <p>© 2026 GrabDesk. Built with standard React and Tailwind CSS theme components.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Contact Support</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}