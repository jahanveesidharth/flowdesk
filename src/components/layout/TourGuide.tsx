import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight, X, LogOut, Compass } from 'lucide-react';
import { exitDemoMode } from '../../lib/demoMode';
import { useAppStore } from '../../store/useAppStore';

interface TourStep {
  target: string;
  route: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const EMPLOYEE_STEPS: TourStep[] = [
  {
    target: '#tour-welcome',
    route: '/dashboard',
    title: 'Welcome to FlowDesk! 👋',
    content: 'This interactive tour will guide you through the key features of your workspace dashboard.',
    position: 'bottom'
  },
  {
    target: '#tour-stats-grid',
    route: '/dashboard',
    title: 'Real-Time Insights 📈',
    content: 'Track today\'s desk assignment, upcoming schedule, active teammates, and announcements at a glance.',
    position: 'bottom'
  },
  {
    target: '#tour-sidebar',
    route: '/dashboard',
    title: 'Workspace Menu 📂',
    content: 'Use this navigation sidebar to easily jump between interactive maps, booking summaries, and settings.',
    position: 'right'
  },
  {
    target: '#tour-floor-map-page',
    route: '/floor-map',
    title: 'Interactive Office Map 🗺️',
    content: 'Locate desks, meeting rooms, cabins, and communal spaces. Select any resource to view details and book it instantly!',
    position: 'bottom'
  },
  {
    target: '#tour-bookings-page',
    route: '/my-bookings',
    title: 'Your Schedule 📅',
    content: 'Manage your active reservations, verify check-in timings, cancel bookings, or check your past schedule history.',
    position: 'bottom'
  },
  {
    target: '#tour-parking-page',
    route: '/parking-lockers',
    title: 'Parking & Lockers 🚗🔒',
    content: 'Book standard/EV parking spaces or storage lockers directly from this utility reservation dashboard.',
    position: 'bottom'
  },
  {
    target: '#tour-team-page',
    route: '/team',
    title: 'Teammate Presence 👥',
    content: 'Coordinate and check when your colleagues are coming in, and see where they sit to foster seamless collaboration.',
    position: 'bottom'
  },
  {
    target: '#tour-my-week-page',
    route: '/my-week',
    title: 'Hybrid Planner 📅',
    content: 'Plan your weekly hybrid schedule: toggle between in-office, remote, or out-of-office days and review teammate planning.',
    position: 'bottom'
  },
  {
    target: '#tour-notifications-page',
    route: '/notifications',
    title: 'System Notifications 🔔',
    content: 'Review automated reminders, booking approvals, or cancellation status notices here.',
    position: 'bottom'
  },
  {
    target: '#tour-settings-page',
    route: '/settings',
    title: 'User Preferences ⚙️',
    content: 'Personalize your system workspace preferences: choose default floors, notification times, toggle dark mode, or configure SSO.',
    position: 'bottom'
  }
];

const ADMIN_STEPS: TourStep[] = [
  {
    target: '#tour-admin-welcome',
    route: '/admin/dashboard',
    title: 'Admin Portal Welcome! 🔑',
    content: 'Manage layout blueprints, coordinate workspace limits, monitor bookings, and analyze real-estate utilization.',
    position: 'bottom'
  },
  {
    target: '#tour-admin-kpis',
    route: '/admin/dashboard',
    title: 'Workspace KPIs 📈',
    content: 'View active occupancy ratios, registration metrics, and real-time user check-ins at a glance.',
    position: 'bottom'
  },
  {
    target: '#tour-sidebar',
    route: '/admin/dashboard',
    title: 'Admin Sidebar 📂',
    content: 'Navigate administrative workflows: access the Floor Builder, manage all bookings, configure user accounts, or view reports.',
    position: 'right'
  },
  {
    target: '#tour-floor-builder-page',
    route: '/admin/floor-builder',
    title: 'Floor Builder Canvas 🔨',
    content: 'Design layouts visually! Place workstations, meeting cabins, rest zones, and utilities via coordinate grid structures.',
    position: 'bottom'
  },
  {
    target: '#tour-admin-bookings-page',
    route: '/admin/bookings',
    title: 'All Bookings Log 📅',
    content: 'Search, review, filter, and export the entire booking history of all workstation and room reservations.',
    position: 'bottom'
  },
  {
    target: '#tour-admin-users-page',
    route: '/admin/users',
    title: 'Users & Permissions 👥',
    content: 'Review registered employees, invite new workspace members, update system roles, or manage accounts.',
    position: 'bottom'
  },
  {
    target: '#tour-admin-analytics-page',
    route: '/admin/analytics',
    title: 'Executive Analytics 📊',
    content: 'Examine detailed utilization chart reports, peak reservation periods, and attendance layout distributions.',
    position: 'bottom'
  },
  {
    target: '#tour-admin-policies-page',
    route: '/admin/policies',
    title: 'Booking Policies 🛡️',
    content: 'Configure general scheduling parameters, check-in windows, auto-releases, and recurring limit bounds.',
    position: 'bottom'
  },
  {
    target: '#tour-admin-settings-page',
    route: '/admin/settings',
    title: 'Organization Settings ⚙️',
    content: 'Manage company information, system office timetables, active calendar integrations, and security rules.',
    position: 'bottom'
  }
];

export function TourGuide() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 220 });

  const { currentUser } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Dynamic steps based on current logged in user role
  const isUserAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const steps = isUserAdmin ? ADMIN_STEPS : EMPLOYEE_STEPS;
  const isFullPage = highlightRect && (highlightRect.width > window.innerWidth * 0.7 && highlightRect.height > window.innerHeight * 0.7);

  // 1. Initial trigger checker
  useEffect(() => {
    const trigger = localStorage.getItem('show_demo_mode');
    if (trigger === 'true') {
      localStorage.removeItem('show_demo_mode');
      startTour();
    }
  }, []);

  // 2. Start the tour
  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    setShowCompletion(false);
    setIsRouting(false);
    // Allow natural browser and programmatic scrolling so target elements align correctly
    document.body.style.overflow = '';
  };

  // 3. Close the tour
  const endTour = () => {
    setIsActive(false);
    setHighlightRect(null);
    document.body.style.overflow = '';
  };

  // 4. Handle step navigation
  const navigateToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    
    const nextStep = steps[index];
    setCurrentStep(index);
    setHighlightRect(null);

    if (location.pathname !== nextStep.route) {
      setIsRouting(true);
      navigate(nextStep.route);
    } else {
      setIsRouting(false);
    }
  };

  // 5. Watch pathname changes & DOM rendering to position target highlight box
  useEffect(() => {
    if (!isActive || showCompletion) return;

    const step = steps[currentStep];

    const locateElement = () => {
      const element = document.querySelector(step.target);
      if (element) {
        // Element found, measure and highlight it
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        setIsRouting(false);

        // Smooth scroll the target element into the viewport center
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });

        return true;
      }
      return false;
    };

    // Attempt immediate lookup
    if (locateElement()) return;

    // Set up MutationObserver to locate element as soon as it mounts
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new MutationObserver(() => {
      if (locateElement()) {
        observerRef.current?.disconnect();
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Fallback polling loop (in case mutations don't trigger or slow loading)
    let retries = 0;
    const checkInterval = setInterval(() => {
      retries++;
      if (locateElement() || retries > 30) {
        clearInterval(checkInterval);
        observerRef.current?.disconnect();
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      observerRef.current?.disconnect();
    };
  }, [isActive, currentStep, location.pathname, showCompletion, steps]);

  // 6. Listen to resize and scroll to maintain highlight alignment
  useEffect(() => {
    if (!isActive || showCompletion) return;

    const handleUpdate = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightRect(element.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('scroll', handleUpdate, { capture: true, passive: true });

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, { capture: true });
    };
  }, [isActive, currentStep, showCompletion, steps]);

  // 6.5. Measure tooltip card size dynamically to prevent viewport overflow bugs
  useEffect(() => {
    if (!isActive || showCompletion || isRouting) return;

    const measureTooltip = () => {
      if (tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect();
        if (rect.height > 0) {
          setTooltipSize({
            width: rect.width || 320,
            height: rect.height || 220
          });
        }
      }
    };

    // Run slightly delayed to allow React render layout to commit
    const timer = setTimeout(measureTooltip, 50);

    window.addEventListener('resize', measureTooltip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureTooltip);
    };
  }, [isActive, currentStep, showCompletion, isRouting]);

  // 7. Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      navigateToStep(currentStep + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      navigateToStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setShowCompletion(true);
  };

  const handleExitDemo = () => {
    endTour();
    exitDemoMode();
    window.location.href = '/login';
  };

  if (!isActive) return null;

  // Calculate tooltip placement offsets relative to the viewport (fixed position)
  const getTooltipStyle = () => {
    if (!highlightRect) {
      // Centered on screen if target is loading/transitioning
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 99999,
        width: '320px'
      };
    }

    const gap = 12;
    const tooltipWidth = tooltipSize.width;
    const tooltipHeight = tooltipSize.height;
    const { top, left, width, height, bottom, right } = highlightRect;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safetyMargin = 16;

    let targetTop = 0;
    let targetLeft = 0;

    const step = steps[currentStep];
    const isFullPage = width > viewportWidth * 0.7 && height > viewportHeight * 0.7;
    
    // 1. Initial Positioning based on step preferred placement relative to the viewport
    if (isFullPage) {
      // For large/full-screen highlighted areas, place tooltip on the right side of the screen
      // so it doesn't block critical page details in the center and left
      targetLeft = viewportWidth - tooltipWidth - 24;
      targetTop = viewportHeight / 2 - tooltipHeight / 2;
    } else {
      if (step.position === 'bottom') {
        targetTop = bottom + gap;
        targetLeft = left + width / 2 - tooltipWidth / 2;
        
        // If it overflows viewport bottom, try to place at the top of the element instead
        if (targetTop + tooltipHeight > viewportHeight - safetyMargin) {
          const tryTop = top - tooltipHeight - gap;
          if (tryTop > safetyMargin) {
            targetTop = tryTop;
          } else {
            // Side fallback to prevent overlapping the target
            const rightSpace = viewportWidth - (right + gap + tooltipWidth);
            const leftSpace = left - gap - tooltipWidth;
            if (rightSpace > leftSpace && rightSpace > safetyMargin) {
              targetLeft = right + gap;
              targetTop = top + height / 2 - tooltipHeight / 2;
            } else if (leftSpace > safetyMargin) {
              targetLeft = left - gap - tooltipWidth;
              targetTop = top + height / 2 - tooltipHeight / 2;
            }
          }
        }
      } else if (step.position === 'top') {
        targetTop = top - tooltipHeight - gap;
        targetLeft = left + width / 2 - tooltipWidth / 2;
        
        // If it overflows viewport top, try to place at the bottom of the element instead
        if (targetTop < safetyMargin) {
          const tryBottom = bottom + gap;
          if (tryBottom + tooltipHeight < viewportHeight - safetyMargin) {
            targetTop = tryBottom;
          } else {
            // Side fallback to prevent overlapping the target
            const rightSpace = viewportWidth - (right + gap + tooltipWidth);
            const leftSpace = left - gap - tooltipWidth;
            if (rightSpace > leftSpace && rightSpace > safetyMargin) {
              targetLeft = right + gap;
              targetTop = top + height / 2 - tooltipHeight / 2;
            } else if (leftSpace > safetyMargin) {
              targetLeft = left - gap - tooltipWidth;
              targetTop = top + height / 2 - tooltipHeight / 2;
            }
          }
        }
      } else if (step.position === 'right') {
        targetTop = top + height / 2 - tooltipHeight / 2;
        targetLeft = right + gap;
        
        // If it overflows viewport right, try to place on the left instead
        if (targetLeft + tooltipWidth > viewportWidth - safetyMargin) {
          const tryLeft = left - tooltipWidth - gap;
          if (tryLeft > safetyMargin) {
            targetLeft = tryLeft;
          } else {
            // Vertical fallback to prevent overlapping the target
            const bottomSpace = viewportHeight - (bottom + gap + tooltipHeight);
            const topSpace = top - gap - tooltipHeight;
            if (bottomSpace > topSpace && bottomSpace > safetyMargin) {
              targetTop = bottom + gap;
              targetLeft = left + width / 2 - tooltipWidth / 2;
            } else if (topSpace > safetyMargin) {
              targetTop = top - gap - tooltipHeight;
              targetLeft = left + width / 2 - tooltipWidth / 2;
            }
          }
        }
      } else if (step.position === 'left') {
        targetTop = top + height / 2 - tooltipHeight / 2;
        targetLeft = left - tooltipWidth - gap;
        
        // If it overflows viewport left, try to place on the right instead
        if (targetLeft < safetyMargin) {
          const tryRight = right + gap;
          if (tryRight + tooltipWidth < viewportWidth - safetyMargin) {
            targetLeft = tryRight;
          } else {
            // Vertical fallback to prevent overlapping the target
            const bottomSpace = viewportHeight - (bottom + gap + tooltipHeight);
            const topSpace = top - gap - tooltipHeight;
            if (bottomSpace > topSpace && bottomSpace > safetyMargin) {
              targetTop = bottom + gap;
              targetLeft = left + width / 2 - tooltipWidth / 2;
            } else if (topSpace > safetyMargin) {
              targetTop = top - gap - tooltipHeight;
              targetLeft = left + width / 2 - tooltipWidth / 2;
            }
          }
        }
      }
    }

    // 2. Strict Boundary Clamping to ensure it never goes off-screen
    const minLeft = safetyMargin;
    const maxLeft = viewportWidth - tooltipWidth - safetyMargin;
    if (targetLeft < minLeft) targetLeft = minLeft;
    if (targetLeft > maxLeft) targetLeft = maxLeft;

    const minTop = safetyMargin;
    const maxTop = viewportHeight - tooltipHeight - safetyMargin;
    if (targetTop < minTop) targetTop = minTop;
    if (targetTop > maxTop) targetTop = maxTop;

    return {
      position: 'fixed' as const,
      top: `${targetTop}px`,
      left: `${targetLeft}px`,
      transform: 'none', // Explicitly clear any loading/centering transforms to avoid visual cuts
      zIndex: 99999,
      width: `${tooltipWidth}px`
    };
  };

  return (
    <>
      {/* Semi-transparent backdrop overlay with highlight spotlight hole */}
      <div 
        className={`fixed inset-0 z-[9998] transition-all duration-300 pointer-events-auto ${
          highlightRect && !isRouting ? 'bg-transparent' : 'bg-black/60 dark:bg-black/75'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {highlightRect && !isRouting && (
          <>
            {/* The backdrop overlay cutout using a large box-shadow on a fixed positioning element */}
            <div
              className="fixed rounded-xl bg-transparent transition-all duration-300 pointer-events-none"
              style={{
                top: `${highlightRect.top - 4}px`,
                left: `${highlightRect.left - 4}px`,
                width: `${highlightRect.width + 8}px`,
                height: `${highlightRect.height + 8}px`,
                boxShadow: '0 0 0 9999px rgba(10, 10, 12, 0.7)',
              }}
            />
            
            {/* Glowing brand border */}
            <div
              className="fixed rounded-xl border-2 border-brand-500 bg-transparent transition-all duration-300 pointer-events-none animate-spotlight-glow"
              style={{
                top: `${highlightRect.top - 6}px`,
                left: `${highlightRect.left - 6}px`,
                width: `${highlightRect.width + 12}px`,
                height: `${highlightRect.height + 12}px`,
              }}
            />
            
            {/* Pulsing ring animation */}
            <div
              className="fixed rounded-xl border border-brand-400 bg-transparent transition-all duration-300 pointer-events-none animate-spotlight-pulse"
              style={{
                top: `${highlightRect.top - 6}px`,
                left: `${highlightRect.left - 6}px`,
                width: `${highlightRect.width + 12}px`,
                height: `${highlightRect.height + 12}px`,
              }}
            />
          </>
        )}
      </div>

      {/* Floating Tooltip Card */}
      {!showCompletion && (
        <div
          ref={tooltipRef}
          style={getTooltipStyle()}
          className="fixed bg-white/95 dark:bg-gray-950/95 border border-brand-500/20 dark:border-brand-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-5 backdrop-blur-md transition-all duration-300 max-h-[calc(100vh-40px)] overflow-y-auto"
        >
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 rounded-t-2xl" />

          {isRouting ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Navigating to workspace section...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold tracking-wider text-brand-600 dark:text-brand-400 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse text-brand-500" />
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-805 transition-colors"
                  title="Skip Tour"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Title & Body with transitions */}
              <div key={currentStep} className="animate-fade-in animate-slide-up">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  {steps[currentStep].title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {steps[currentStep].content}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-3">
                <button
                  onClick={handleSkip}
                  className="text-[11px] font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Skip Tour
                </button>
                
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-55 dark:hover:bg-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-brand-500/20 dark:shadow-brand-500/10 transition-all hover:scale-105 active:scale-95"
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 dark:bg-gray-950/95 border border-brand-500/20 dark:border-brand-500/35 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden animate-slide-up backdrop-blur-md">
            {/* Elegant brand gradient header line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 rounded-t-3xl" />
            
            {/* Visual background sparkle */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />
            
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100/40 dark:border-brand-900/30">
              <Sparkles className="w-7 h-7 text-brand-500 animate-pulse" />
            </div>

            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
              Onboarding Completed! 🎉
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              You are now fully set up to explore the workstation planner, schedule bookings, and coordinate team attendance.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowCompletion(false);
                  startTour();
                }}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                Replay Tour Guide
              </button>
              
              <button
                onClick={endTour}
                className="w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Workspace On My Own
              </button>
              
              <button
                onClick={handleExitDemo}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out & Exit Demo Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
