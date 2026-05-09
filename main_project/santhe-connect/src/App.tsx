import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  Map as MapIcon, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Utensils, 
  Store,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Navigation,
  X,
  MapPin,
  Filter,
  Sparkles,
  Loader2,
  Camera,
  Mic
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { 
  db,
  auth, 
  signInWithGoogle, 
  checkRedirectResult,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { cn, formatDate } from './lib/utils';
import AddLocationModal from './components/AddLocationModal';
import { subscribeToSanthes, subscribeToEateries, subscribeToReviews, seedInitialData, addReview } from './lib/dataService';
import { getLocalRecommendations } from './lib/geminiService';
import type { Santhe, Eatery, Review, Coordinates } from './types';
import Markdown from 'react-markdown';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
            <X size={32} />
          </div>
          <h1 className="text-2xl font-bold text-earth-brown mb-4">Something went wrong</h1>
          <p className="text-sm text-earth-brown/60 mb-6 max-w-xs">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 bg-earth-brown text-cream rounded-full text-xs font-bold uppercase tracking-widest shadow-xl"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Shared Components
const NavigationBar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'map', icon: MapIcon, label: 'Radar' },
    { id: 'calendar', icon: Calendar, label: 'Santhe' },
    { id: 'reviews', icon: MessageSquare, label: 'Feed' },
    { id: 'profile', icon: UserIcon, label: 'Soul' },
  ];

  return (
    <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-earth-brown text-cream px-6 py-3 rounded-full flex items-center gap-8 shadow-2xl z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-300",
            activeTab === tab.id ? "text-saffron scale-110" : "text-cream/60 hover:text-cream"
          )}
        >
          <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Sign-in method NOT enabled. Please go to your Firebase Console > Authentication > Sign-in method and enable 'Email/Password'.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-8 pb-32">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-terracotta/10 rounded-[30px] flex items-center justify-center mx-auto mb-6 text-terracotta">
          <Store size={40} />
        </div>
        <h2 className="text-4xl font-bold text-earth-brown mb-3">Santhe<span className="text-terracotta italic">Connect</span><br/><span className="text-xl font-normal text-earth-brown/40">ಸಂತೆ ಕನೆಕ್ಟ್</span></h2>
        <p className="text-earth-brown/60 text-sm leading-relaxed max-w-xs mx-auto">
          Explore the hidden soul of Karnataka. Discover local weekly markets (Santhes), traditional eateries, and share your heritage journey with the world.
        </p>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-earth-brown/5 border border-earth-brown/5">
        <div className="flex gap-4 mb-8 bg-earth-brown/5 p-1 rounded-2xl">
          <button 
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              isLogin ? "bg-white text-terracotta shadow-sm" : "text-earth-brown/40"
            )}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              !isLogin ? "bg-white text-terracotta shadow-sm" : "text-earth-brown/40"
            )}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-earth-brown/40 ml-2 mb-2 block">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-earth-brown/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                placeholder="Your Name"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-earth-brown/40 ml-2 mb-2 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-earth-brown/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-earth-brown/40 ml-2 mb-2 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-earth-brown/5 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[10px] text-red-500 font-bold ml-2">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold tracking-widest shadow-lg shadow-terracotta/20 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? "PROCESSING..." : isLogin ? "LOGIN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-earth-brown/10"></div></div>
          <span className="relative bg-white px-4 text-[10px] font-bold text-earth-brown/20 uppercase tracking-widest">OR</span>
        </div>

        <button 
          onClick={() => signInWithGoogle()}
          className="w-full bg-white border border-earth-brown/10 text-earth-brown py-4 rounded-2xl font-bold tracking-widest flex items-center justify-center gap-3 hover:bg-earth-brown/5 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          CONTINUE WITH GOOGLE
        </button>
      </div>

      <div className="mt-12 space-y-6">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-terracotta text-center mb-8">What you can do</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-3xl border border-earth-brown/5">
            <MapPin size={18} className="text-saffron mb-2" />
            <p className="text-[11px] font-bold text-earth-brown mb-1">Discover Markets</p>
            <p className="text-[9px] text-earth-brown/40">Find weekly santhes across rural regions.</p>
          </div>
          <div className="p-4 bg-white rounded-3xl border border-earth-brown/5">
            <Utensils size={18} className="text-terracotta mb-2" />
            <p className="text-[11px] font-bold text-earth-brown mb-1">Local Eateries</p>
            <p className="text-[9px] text-earth-brown/40">Pin authentic food spots that are off the grid.</p>
          </div>
          <div className="p-4 bg-white rounded-3xl border border-earth-brown/5">
            <Mic size={18} className="text-dark-olive mb-2" />
            <p className="text-[11px] font-bold text-earth-brown mb-1">Voice Notes</p>
            <p className="text-[9px] text-earth-brown/40">Record the sounds and reviews of the santhe.</p>
          </div>
          <div className="p-4 bg-white rounded-3xl border border-earth-brown/5">
            <Sparkles size={18} className="text-saffron mb-2" />
            <p className="text-[11px] font-bold text-earth-brown mb-1">Earn Points</p>
            <p className="text-[9px] text-earth-brown/40">Grow your status as a Heritage Explorer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user, santhes, reviews }: { user: User | null, santhes: Santhe[], reviews: Review[] }) => {
  const [seeding, setSeeding] = useState(false);
  const [showSeedSuccess, setShowSeedSuccess] = useState(false);
  const [viewingContributions, setViewingContributions] = useState(false);

  const myPins = santhes.filter(s => s.addedBy === user?.uid);
  const myReviews = reviews.filter(r => r.userId === user?.uid);
  
  const totalPoints = (myPins.length * 100) + (myReviews.length * 50);
  const userLevel = Math.floor(totalPoints / 200) + 1;

  const handleSeed = async () => {
    setSeeding(true);
    await seedInitialData();
    setSeeding(false);
    setShowSeedSuccess(true);
    setTimeout(() => setShowSeedSuccess(false), 5000);
  };

  if (!user) return <AuthView />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-8 px-6 pb-28"
    >
      <AnimatePresence>
        {viewingContributions && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 bg-cream z-[120] pt-24 px-6 pb-28 overflow-y-auto"
          >
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setViewingContributions(false)}
                className="w-10 h-10 bg-white border border-earth-brown/10 rounded-full flex items-center justify-center text-earth-brown shadow-sm"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold">My Contributions</h2>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-40">My Pins ({myPins.length})</h3>
                {myPins.length === 0 ? (
                  <p className="text-xs text-earth-brown/40 italic">You haven't pinned any spots yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {myPins.map(pin => (
                      <div key={pin.id} className="bg-white p-4 rounded-2xl border border-earth-brown/5 shadow-sm">
                        <p className="font-bold text-sm">{pin.name}</p>
                        <p className="text-[10px] text-earth-brown/40">{pin.village}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-40">My Stories ({myReviews.length})</h3>
                {myReviews.length === 0 ? (
                  <p className="text-xs text-earth-brown/40 italic">You haven't shared any stories yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {myReviews.map(review => (
                      <div key={review.id} className="bg-white p-4 rounded-2xl border border-earth-brown/5 shadow-sm">
                        <p className="text-xs italic text-earth-brown/80">"{review.content}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seeding Section for Demo */}
      <div className="bg-terracotta/5 border border-terracotta/10 p-6 rounded-[32px] mb-8">
        <h3 className="text-sm font-bold text-terracotta mb-2 flex items-center gap-2">
          <Sparkles size={16} /> 
          Heritage Onboarding
        </h3>
        <p className="text-xs text-earth-brown/60 mb-4">Want to see how the map looks with authentic data?</p>
        <button 
          onClick={handleSeed}
          disabled={seeding}
          className="w-full bg-white text-terracotta border border-terracotta/20 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-terracotta hover:text-white transition-all disabled:opacity-50"
        >
          {seeding ? "PINNING SPOTS..." : "SEED LOCAL HERITAGE DATA"}
        </button>
        {showSeedSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-[10px] font-bold text-dark-olive"
          >
            ✓ Local heritage spots pinned to your map!
          </motion.div>
        )}
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-6">
          <img src={user.photoURL || 'https://i.pravatar.cc/150'} className="w-24 h-24 rounded-full ring-4 ring-saffron" alt="Me" />
          <div className="absolute -bottom-2 -right-2 bg-dark-olive text-white p-2 rounded-full border-2 border-cream">
            <Sparkles size={16} />
          </div>
        </div>
        <h2 className="text-3xl font-bold">{user.displayName}</h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-saffron mt-1">Heritage Explorer • Lvl {userLevel}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-5 rounded-3xl border border-earth-brown/5 text-center">
          <p className="text-[10px] font-bold text-earth-brown/40 uppercase mb-1">Points</p>
          <p className="text-3xl font-bold text-terracotta">{totalPoints.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-earth-brown/5 text-center">
          <p className="text-[10px] font-bold text-earth-brown/40 uppercase mb-1">Pins</p>
          <p className="text-3xl font-bold text-dark-olive">{myPins.length}</p>
        </div>
      </div>

      <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-40 ml-2">Legacy Badges</h3>
      <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
        {[
          { name: 'Taste Guide', min: 1, icon: Utensils },
          { name: 'Santhe Regular', min: 3, icon: Store },
          { name: 'Voice of Local', min: 1, icon: Mic },
          { name: 'Heritage Pro', min: 5, icon: Sparkles }
        ].map(badge => {
          const isUnlocked = (badge.name === 'Santhe Regular' || badge.name === 'Heritage Pro') 
            ? myPins.length >= badge.min 
            : (badge.name === 'Voice of Local' ? myReviews.length >= badge.min : totalPoints >= 100);
          
          return (
            <div 
              key={badge.name} 
              className={cn(
                "flex-shrink-0 px-6 py-4 rounded-3xl border text-center transition-all",
                isUnlocked ? "bg-saffron/10 text-saffron border-saffron/20 shadow-lg shadow-saffron/5" : "bg-earth-brown/5 text-earth-brown/20 border-earth-brown/10 grayscale opacity-40 text-opacity-20"
              )}
            >
               <div className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all",
                 isUnlocked ? "bg-white text-saffron" : "bg-earth-brown/5 text-earth-brown/10"
               )}>
                 <badge.icon size={16} />
               </div>
               <span className="text-[10px] font-bold uppercase whitespace-nowrap">{badge.name}</span>
               {!isUnlocked && <p className="text-[7px] mt-1 font-bold">LOCKED</p>}
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setViewingContributions(true)}
          className="w-full bg-white p-6 rounded-[32px] border border-earth-brown/5 flex items-center justify-between group transition-all hover:bg-earth-brown/[0.02]"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-earth-brown/5 rounded-2xl flex items-center justify-center text-earth-brown/40 group-hover:bg-terracotta/10 group-hover:text-terracotta transition-colors">
               <MapPin size={20} />
             </div>
             <span className="font-bold text-earth-brown">My Contributions</span>
          </div>
          <ChevronRight size={16} className="text-earth-brown/20 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => signOut(auth)}
          className="w-full bg-red-500/[0.03] p-6 rounded-[32px] border border-red-500/10 flex items-center justify-between group transition-all hover:bg-red-500/[0.06]"
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
               <LogOut size={20} />
             </div>
             <span className="font-bold text-red-500">Sign Out</span>
          </div>
          <ChevronRight size={16} className="text-red-500/20 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

const Header = ({ user }: { user: User | null }) => {
  return (
    <header className="flex-shrink-0 p-6 z-[100] bg-cream border-b border-earth-brown/5 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-terracotta rounded-xl rotate-12 flex items-center justify-center text-white shadow-lg shadow-terracotta/20">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-earth-brown leading-tight">Santhe<span className="text-terracotta">Connect</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-earth-brown/40">ಸಂತೆ ಕನೆಕ್ಟ್ • Heritage Hub</p>
          </div>
        </div>

        {user ? (
          <img src={user.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full ring-2 ring-saffron p-0.5 shadow-md shadow-saffron/20" />
        ) : (
          <button 
            onClick={() => signInWithGoogle()}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-earth-brown/10 shadow-sm text-sm"
          >
            <UserIcon size={16} />
            Join
          </button>
        )}
      </div>
    </header>
  );
};

const GeminiWidget = () => {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    const rec = await getLocalRecommendations("Halebidu", "Traditional food and markets");
    setRecommendation(rec);
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-saffron/10 border border-saffron/20 p-6 rounded-[32px] mb-8 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={40} className="text-saffron" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-saffron bg-white px-2 py-0.5 rounded-full shadow-sm">GenAI Expert</span>
          <h3 className="text-sm font-bold text-earth-brown">Local Tips for Today</h3>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-earth-brown/40 text-xs py-4">
            <Loader2 size={14} className="animate-spin" />
            Generating your personal journey...
          </div>
        ) : recommendation ? (
          <div className="text-sm prose prose-sm text-earth-brown leading-relaxed">
            <Markdown>{recommendation}</Markdown>
          </div>
        ) : (
          <button 
            onClick={fetchRecs}
            className="text-xs font-bold text-saffron flex items-center gap-2 hover:translate-x-1 transition-transform"
          >
            Ask Guru for recommendations <ChevronRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Main Screens
const MapView = ({ onAdd, santhes, eateries }: { onAdd: () => void, santhes: Santhe[], eateries: Eatery[] }) => {
  const [filterDay, setFilterDay] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredSanthes = filterDay 
    ? santhes.filter(s => s.dayOfWeek === filterDay)
    : santhes;

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col pt-8 px-6 pb-28 overflow-hidden relative"
    >
      <div className="flex-1 rounded-[40px] bg-earth-brown/5 border-2 border-dashed border-earth-brown/10 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596409054703-a1851b439c06?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-10 grayscale"></div>
        
        <div className="relative z-10 flex flex-col items-center w-full">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            onClick={handleLocate}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl transition-all cursor-pointer",
              userLocation ? "bg-dark-olive shadow-dark-olive/40" : "bg-terracotta shadow-terracotta/40"
            )}
          >
            {locating ? <Loader2 size={48} className="text-white animate-spin" /> : <MapPin size={48} className="text-white" />}
          </motion.div>
          
          <h2 className="text-4xl font-bold mb-4 tracking-tight">
            {userLocation ? "Radar is " : "Karnataka is "} <br/>
            <span className={cn("italic", userLocation ? "text-dark-olive" : "text-terracotta")}>
              {userLocation ? "Live" : "Calling You"}
            </span>
          </h2>
          
          <p className="text-earth-brown/60 mb-8 max-w-[240px] text-sm leading-relaxed">
            {userLocation 
              ? `Nearby: ${filteredSanthes.length} Santhes & ${eateries.length} Gems found in your range.`
              : "Discover weekly markets, home-stays, and authentic eateries hidden from major apps."
            }
          </p>
          
          <div className="flex gap-4 w-full mb-6 relative">
            <button onClick={onAdd} className="flex-1 bg-earth-brown text-cream p-4 rounded-3xl flex flex-col items-center gap-2 hover:bg-terracotta transition-all shadow-lg hover:-translate-y-1">
              <Plus size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Pin New Spot</span>
            </button>
            <button 
              onClick={() => setShowDayPicker(!showDayPicker)}
              className={cn(
                "flex-1 border p-4 rounded-3xl flex flex-col items-center gap-2 transition-all shadow-sm bg-white",
                filterDay ? "border-terracotta text-terracotta" : "border-earth-brown/10 text-earth-brown"
              )}
            >
              <Filter size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{filterDay || 'Filter Day'}</span>
            </button>

            <AnimatePresence>
              {showDayPicker && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-4 bg-white rounded-3xl shadow-2xl border border-earth-brown/5 p-4 z-30 w-full"
                >
                  <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-earth-brown/40">Select Market Day</span>
                    <button onClick={() => setFilterDay(null)} className="text-[10px] font-bold text-terracotta">CLEAR</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {days.map(d => (
                      <button 
                        key={d}
                        onClick={() => {
                          setFilterDay(d);
                          setShowDayPicker(false);
                        }}
                        className={cn(
                          "text-[9px] font-bold py-3 rounded-xl transition-all",
                          filterDay === d ? "bg-terracotta text-white" : "bg-earth-brown/5 hover:bg-earth-brown/10 text-earth-brown/60"
                        )}
                      >
                        {d.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {filterDay && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-terracotta/10 text-terracotta text-[10px] font-bold px-4 py-2 rounded-full mb-4 animate-pulse flex items-center gap-2"
            >
              <Sparkles size={10} />
              FILTERED: {filteredSanthes.length} {filterDay} Markets
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SantheDetail = ({ santhe, onClose, user, reviews }: { santhe: Santhe, onClose: () => void, user: User | null, reviews: Review[] }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNavigate = () => {
    const { lat, lng } = santhe.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const filteredReviews = reviews.filter(r => r.targetId === santhe.id);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewContent.trim()) return;

    setSubmitting(true);
    try {
      await addReview({
        targetId: santhe.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        type: 'text',
        content: reviewContent.trim(),
      });
      setReviewContent('');
      setIsReviewing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-cream z-[110] flex flex-col overflow-y-auto no-scrollbar"
    >
      <div className="relative h-80 flex-shrink-0">
        <img 
          src={santhe.imageUrl || "https://images.unsplash.com/photo-1605705663183-b78f877c4424?auto=format&fit=crop&q=80&w=1000"} 
          className="w-full h-full object-cover"
          alt={santhe.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1605705663183-b78f877c4424?auto=format&fit=crop&q=80&w=1000";
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream via-cream/80 to-transparent" />
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-12 h-12 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center text-earth-brown border border-white/50 shadow-lg z-20"
        >
          <X size={24} />
        </button>
        <div className="absolute bottom-6 left-8 right-8 z-10">
           <div className="flex items-center gap-2 mb-3">
             <span className="bg-terracotta text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-terracotta/20">
               {'dayOfWeek' in santhe ? `${santhe.dayOfWeek} Santhe` : 'Local Gem'}
             </span>
             {santhe.isVerified && (
               <span className="bg-dark-olive text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-dark-olive/20 flex items-center gap-1">
                 <Sparkles size={10} /> Verified
               </span>
             )}
           </div>
           <h2 className="text-4xl font-bold text-earth-brown leading-tight tracking-tight drop-shadow-sm">{santhe.name}</h2>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8 pb-32">
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-3xl border border-earth-brown/5 shadow-sm">
            <p className="text-[10px] font-bold text-earth-brown/40 uppercase mb-1">Village</p>
            <p className="text-lg font-bold">{santhe.village}</p>
          </div>
          <div className="flex-1 bg-white p-4 rounded-3xl border border-earth-brown/5 shadow-sm">
            <p className="text-[10px] font-bold text-earth-brown/40 uppercase mb-1">Status</p>
            <p className="text-sm font-bold text-dark-olive flex items-center gap-1">
              <MapPin size={12} /> Active Now
            </p>
          </div>
        </div>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-40">What to Expect</h3>
          <p className="text-earth-brown/70 leading-relaxed italic font-serif">
            {santhe.description || "In this local spot, you'll find the authentic pulse of Karnataka's traditions and flavors."}
          </p>
        </section>

        {santhe.specialties && santhe.specialties.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-40">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {santhe.specialties.map(s => (
                <span key={s} className="bg-saffron/10 text-saffron px-4 py-2 rounded-2xl text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        <button 
          onClick={handleNavigate}
          className="w-full p-6 bg-earth-brown text-cream rounded-[40px] flex items-center justify-between shadow-xl shadow-earth-brown/20 group hover:bg-earth-brown/90 transition-all"
        >
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Real-time Guide</p>
            <p className="text-lg font-bold">Navigate to Location</p>
          </div>
          <div className="w-14 h-14 bg-terracotta rounded-full flex items-center justify-center text-white scale-110 shadow-lg group-active:scale-95 transition-transform">
            <Navigation size={24} />
          </div>
        </button>

        <section className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Heritage Stories ({filteredReviews.length})</h3>
            {user && !isReviewing && (
              <button 
                onClick={() => setIsReviewing(true)}
                className="text-[10px] font-bold text-terracotta uppercase tracking-widest border-b border-terracotta/20 pb-0.5"
              >
                Share your visit
              </button>
            )}
          </div>

          <AnimatePresence>
            {isReviewing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-8"
              >
                <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-[32px] border border-earth-brown/10 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase text-earth-brown/40">Posting as {user?.displayName}</span>
                    <button type="button" onClick={() => setIsReviewing(false)} className="text-earth-brown/20"><X size={14} /></button>
                  </div>
                  <textarea 
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full bg-earth-brown/5 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-terracotta/20 outline-none transition-all resize-none h-24 mb-4"
                    required
                  />
                  <button 
                    disabled={submitting}
                    className="w-full bg-terracotta text-white py-3 rounded-xl font-bold tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    SHARE STORY
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredReviews.length === 0 ? (
            <div className="bg-earth-brown/5 rounded-[32px] p-8 text-center border-2 border-dashed border-earth-brown/10">
              <MessageSquare size={24} className="mx-auto mb-3 text-earth-brown/20" />
              <p className="text-xs text-earth-brown/40 italic">No stories shared for this spot yet. Be the first to share one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review, i) => (
                <div key={review.id} className="bg-white p-5 rounded-[32px] border border-earth-brown/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={review.userPhoto || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full ring-2 ring-saffron/20" alt="" />
                    <div>
                      <p className="text-[11px] font-bold text-earth-brown leading-tight">{review.userName}</p>
                      <p className="text-[8px] text-earth-brown/40 uppercase font-bold">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-earth-brown/80 leading-relaxed italic border-l-2 border-saffron/30 pl-3">"{review.content}"</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

const CalendarView = ({ santhes, eateries, user, reviews, onSelectItem }: { santhes: Santhe[], eateries: Eatery[], user: User | null, reviews: Review[], onSelectItem: (item: any, type: 'santhe' | 'eatery') => void }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-8 px-6 pb-28 min-h-screen"
    >

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-terracotta" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-earth-brown/40">Market & Eateries</span>
        </div>
        <h2 className="text-5xl font-bold mb-2">Heritage <br/><span className="italic text-terracotta">Discovery</span></h2>
        <p className="text-earth-brown/60 text-sm max-w-xs">Connecting you to the soul of Karnataka's vibrant markets and hidden food gems.</p>
      </div>

      <GeminiWidget />

      <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40 ml-2">Weekly Santhes</h3>
      <div className="space-y-6 mb-12">
        {santhes.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <Store size={40} className="mx-auto mb-4" />
            <p className="text-sm font-medium">No santhes added yet.</p>
          </div>
        ) : (
          santhes.map((santhe, i) => (
            <motion.div 
              key={santhe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelectItem(santhe, 'santhe')}
              className="flex items-center gap-6 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-[20px] bg-white border border-earth-brown/5 flex flex-col items-center justify-center shadow-sm group-hover:bg-terracotta group-hover:text-white transition-all duration-500 overflow-hidden relative">
                {santhe.imageUrl ? (
                  <img src={santhe.imageUrl} className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity" alt="" />
                ) : (
                  <>
                    <span className="text-[9px] font-bold uppercase tracking-tighter opacity-60 group-hover:opacity-100">{santhe.dayOfWeek.substring(0, 3)}</span>
                    <span className="text-2xl font-bold font-serif">{i + 1}</span>
                  </>
                )}
              </div>
              <div className="flex-1 pb-4 border-b border-earth-brown/10 group-hover:border-terracotta/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-earth-brown group-hover:text-terracotta transition-colors">{santhe.name}</h3>
                  <span className="text-[9px] bg-dark-olive/10 text-dark-olive px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">{santhe.village}</span>
                </div>
                <p className="text-xs text-earth-brown/50 line-clamp-1">{santhe.description || 'Authentic weekly market experience.'}</p>
              </div>
              <ChevronRight size={16} className="text-earth-brown/20 group-hover:text-terracotta transition-all group-hover:translate-x-1" />
            </motion.div>
          ))
        )}
      </div>

      <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40 ml-2">Hidden Eateries</h3>
      <div className="space-y-6">
        {eateries.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <Utensils size={40} className="mx-auto mb-4" />
            <p className="text-sm font-medium">No hidden gems found yet.</p>
          </div>
        ) : (
          eateries.map((eatery, i) => (
            <motion.div 
              key={eatery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              onClick={() => onSelectItem(eatery, 'eatery')}
              className="flex items-center gap-6 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-[20px] bg-white border border-earth-brown/5 flex items-center justify-center shadow-sm group-hover:bg-saffron group-hover:text-white transition-all duration-500 overflow-hidden relative">
                {eatery.imageUrl ? (
                  <img src={eatery.imageUrl} className="w-full h-full object-cover absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity" alt="" />
                ) : (
                  <Utensils size={24} className="opacity-20 group-hover:opacity-100" />
                )}
              </div>
              <div className="flex-1 pb-4 border-b border-earth-brown/10 group-hover:border-saffron/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-xl font-bold text-earth-brown group-hover:text-saffron transition-colors">{eatery.name}</h3>
                  <span className="text-[9px] bg-saffron/10 text-saffron px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">{eatery.village}</span>
                </div>
                <p className="text-xs text-earth-brown/50 line-clamp-1">{eatery.specialty || eatery.description || 'Authentic local taste gem.'}</p>
              </div>
              <ChevronRight size={16} className="text-earth-brown/20 group-hover:text-saffron transition-all group-hover:translate-x-1" />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const ReviewsView = ({ reviews, user }: { reviews: Review[], user: User | null }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      await addReview({
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        type: 'text',
        content: content.trim(),
      });
      setContent('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-8 px-6 pb-28 min-h-screen"
    >
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-dark-olive" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-earth-brown/40">Community Hub</span>
          </div>
          <h2 className="text-5xl font-bold mb-2">Review <br/><span className="italic text-dark-olive">Wall</span></h2>
          <p className="text-earth-brown/60 text-sm max-w-xs">Honest stories, voice notes, and captures from the ground.</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-12 h-12 bg-dark-olive text-white rounded-2xl flex items-center justify-center shadow-lg shadow-dark-olive/20 active:scale-95 transition-all"
          >
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] border border-dark-olive/10 shadow-xl shadow-dark-olive/5">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your santhe story or hidden gem review..."
                className="w-full bg-earth-brown/5 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-dark-olive/20 outline-none transition-all resize-none h-32 mb-4"
                required
              />
              <button 
                disabled={loading}
                className="w-full bg-dark-olive text-white py-3 rounded-xl font-bold tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                POST STORY
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="columns-1 sm:columns-2 gap-4 space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-24 opacity-40 col-span-full">
            <MessageSquare size={40} className="mx-auto mb-4" />
            <p className="text-sm font-medium">Wall is waiting for its first story.</p>
          </div>
        ) : (
        reviews.map((review, i) => (
          <motion.div 
            key={review.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card break-inside-avoid shadow-sm hover:shadow-2xl transition-all duration-500 border-earth-brown/5 hover:border-dark-olive/20 group"
          >
            <div className="flex items-center gap-3 mb-4">
              {review.userPhoto ? (
                <img src={review.userPhoto} className="w-8 h-8 rounded-full border border-saffron/20" alt={review.userName} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-saffron/20 border border-saffron/20 flex items-center justify-center text-[10px] font-bold text-saffron">
                  {review.userName.substring(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-[11px] font-bold leading-none text-earth-brown">{review.userName}</p>
                <p className="text-[9px] text-earth-brown/40 font-medium">Verified Finder</p>
              </div>
              <div className="ml-auto flex gap-1">
                {review.hasVoice && <Mic size={14} className="text-terracotta" />}
                {review.hasPhoto && <Camera size={14} className="text-dark-olive" />}
              </div>
            </div>
            
            <p className="text-sm leading-relaxed mb-4 text-earth-brown/80 italic font-serif">
              "{review.content}"
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-[8px] font-bold bg-earth-brown/5 text-earth-brown/60 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified Visit</span>
              </div>
              <p className="text-[8px] font-bold text-earth-brown/20 uppercase tracking-widest">{review.type}</p>
            </div>
          </motion.div>
        ))
      )}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('map');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [santhes, setSanthes] = useState<Santhe[]>([]);
  const [eateries, setEateries] = useState<Eatery[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [selectedItem, setSelectedItem] = useState<{ type: 'santhe' | 'eatery', item: any } | null>(null);
  const [initStatus, setInitStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const unsubSanthes = subscribeToSanthes(setSanthes);
    const unsubEateries = subscribeToEateries(setEateries);
    const unsubReviews = subscribeToReviews(setReviews);

    // Auto-seed if database is empty - check both collections
    const init = async () => {
      try {
        // Handle redirect result if coming back from Google Sign-In
        const redirectedUser = await checkRedirectResult();
        if (redirectedUser) {
          setUser(redirectedUser);
        }

        const [santhesSnap, eateriesSnap] = await Promise.all([
          getDocs(collection(db, 'santhes')),
          getDocs(collection(db, 'eateries'))
        ]);
        
        if (santhesSnap.empty || eateriesSnap.empty) {
          console.log("Database missing heritage data, seeding...");
          await seedInitialData();
        }
        setInitStatus('ready');
      } catch (err) {
        console.error("Failed to check/seed data:", err);
        setInitStatus('error');
      }
    };
    init();

    return () => {
      unsubAuth();
      unsubSanthes();
      unsubEateries();
      unsubReviews();
    };
  }, []);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-cream relative shadow-2xl border-x border-earth-brown/10 flex flex-col overflow-hidden selection:bg-terracotta selection:text-white">
      <Header user={user} />
      
      {initStatus === 'loading' && (
        <div className="absolute inset-0 z-[200] bg-cream flex flex-col items-center justify-center p-8 text-center">
          <Loader2 size={40} className="text-terracotta animate-spin mb-4" />
          <p className="text-earth-brown font-bold">Syncing with heritage radar...</p>
          <p className="text-[10px] text-earth-brown/40 mt-2 uppercase tracking-widest">Ensuring you have the latest local data</p>
        </div>
      )}

      {initStatus === 'error' && (
        <div className="absolute inset-0 z-[200] bg-cream flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
            <X size={32} />
          </div>
          <p className="text-earth-brown font-bold">Connection Hiccup</p>
          <p className="text-xs text-earth-brown/60 mt-2">Could not connect to the heritage database. Please check your internet connection.</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-earth-brown text-cream rounded-full text-[10px] font-bold uppercase tracking-widest">Retry Connection</button>
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeTab === 'map' && <MapView key="map" onAdd={() => setIsAddModalOpen(true)} santhes={santhes} eateries={eateries} />}
          {activeTab === 'calendar' && <CalendarView key="calendar" santhes={santhes} eateries={eateries} user={user} reviews={reviews} onSelectItem={(item) => setSelectedItem({ type: 'santhe', item })} />}
          {activeTab === 'reviews' && <ReviewsView key="reviews" reviews={reviews} user={user} />}
          {activeTab === 'profile' && <ProfileView key="profile" user={user} santhes={santhes} reviews={reviews} />}
        </AnimatePresence>
      </main>

      <div className="flex-shrink-0 h-24 relative">
        <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <AnimatePresence>
        {selectedItem && (
          <SantheDetail 
            santhe={selectedItem.type === 'eatery' ? {
              ...selectedItem.item,
              name: selectedItem.item.name,
              village: selectedItem.item.village,
              description: selectedItem.item.description || `Famous for ${selectedItem.item.specialty}`,
            } as any : selectedItem.item} 
            onClose={() => setSelectedItem(null)} 
            user={user}
            reviews={reviews}
          />
        )}
      </AnimatePresence>

      <AddLocationModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
