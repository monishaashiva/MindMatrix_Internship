import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Utensils, Store, MapPin, Loader2, Camera, Mic, Check, Square } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLocationModal({ isOpen, onClose }: AddModalProps) {
  const [type, setType] = useState<'santhe' | 'eatery'>('eatery');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    description: '',
    specialty: '',
    dayOfWeek: 'Sunday',
    eateryType: 'hotel'
  });

  const getActualLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
        // Fallback to demo coords if geolocation fails/denied
        setCurrentCoords({ lat: 12.9716, lng: 77.5946 });
      }
    );
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingStartTime(Date.now());
    } else {
      setIsRecording(false);
      setRecordingStartTime(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    const path = type === 'santhe' ? 'santhes' : 'eateries';
    
    try {
      const data: any = {
        ...formData,
        addedBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        hasPhoto: !!photo,
        hasVoice: isRecording, 
        coordinates: currentCoords || { lat: 12.9716, lng: 77.5946 }
      };

      if (photo) {
        // For demo purposes, we create a data URL for the image
        // In a real app, you would upload this to Firebase Storage
        const reader = new FileReader();
        const photoDataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(photo);
        });
        
        // Only store if it's reasonably small (to stay within Firestore limits)
        // If it's too big, we'll just use a relevant Unsplash fallback for the demo
        if (photoDataUrl.length < 500000) { // < 500KB
          data.imageUrl = photoDataUrl;
        } else {
          data.imageUrl = `https://images.unsplash.com/photo-1605705663183-b78f877c4424?market&q=80&w=800`;
        }
      }

      if (type === 'eatery') {
        delete data.dayOfWeek;
        data.type = formData.eateryType;
      } else {
        delete data.eateryType;
        delete data.specialty;
      }

      await addDoc(collection(db, path), data);
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-earth-brown/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-cream rounded-t-[40px] shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-8 pb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Add <span className="text-terracotta">Local Spot</span></h2>
                <button onClick={onClose} className="bg-earth-brown/5 p-2 rounded-full hover:bg-earth-brown/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex p-1 bg-earth-brown/5 rounded-2xl mb-8">
                <button 
                  onClick={() => setType('eatery')}
                  className={cn(
                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                    type === 'eatery' ? "bg-white text-terracotta shadow-sm" : "text-earth-brown/40"
                  )}
                >
                  <Utensils size={16} />
                  EATERY
                </button>
                <button 
                  onClick={() => setType('santhe')}
                  className={cn(
                    "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all",
                    type === 'santhe' ? "bg-white text-dark-olive shadow-sm" : "text-earth-brown/40"
                  )}
                >
                  <Store size={16} />
                  SANTHE
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-earth-brown/40 ml-1 mb-1 block">Title / Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Hoysala Jolada Rotti"
                    className="w-full bg-white border border-earth-brown/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-earth-brown/40 ml-1 mb-1 block">Location Precision</label>
                  <button 
                   type="button"
                   onClick={getActualLocation}
                   className={cn(
                     "w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all",
                     currentCoords ? "bg-dark-olive/5 border-dark-olive text-dark-olive" : "bg-earth-brown/5 border-earth-brown/20 text-earth-brown/60"
                   )}
                  >
                    {locating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MapPin size={16} />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {currentCoords ? `Locked: ${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}` : 'Tag Current Spot'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-earth-brown/40 ml-1 mb-1 block">Village / Town</label>
                    <input 
                      required
                      value={formData.village}
                      onChange={e => setFormData({...formData, village: e.target.value})}
                      placeholder="e.g. Halebidu"
                      className="w-full bg-white border border-earth-brown/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                    />
                  </div>
                  <div>
                    {type === 'santhe' ? (
                      <>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-earth-brown/40 ml-1 mb-1 block">Day of Week</label>
                        <select 
                          className="w-full bg-white border border-earth-brown/10 rounded-2xl p-4 outline-none appearance-none font-medium"
                          value={formData.dayOfWeek}
                          onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                        >
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-earth-brown/40 ml-1 mb-1 block">Eatery Type</label>
                        <select 
                          className="w-full bg-white border border-earth-brown/10 rounded-2xl p-4 outline-none appearance-none font-medium"
                          value={formData.eateryType}
                          onChange={e => setFormData({...formData, eateryType: e.target.value})}
                        >
                          <option value="hotel">Hotel</option>
                          <option value="homestay">Homestay</option>
                          <option value="pop-up">Pop-up</option>
                          <option value="mess">Mess</option>
                        </select>
                      </>
                    )}
                  </div>
                </div>

                <div>
                   <label className="text-[10px] uppercase tracking-widest font-bold text-earth-brown/40 ml-1 mb-1 block">Specialty / Category</label>
                   <input 
                    value={formData.specialty}
                    onChange={e => setFormData({...formData, specialty: e.target.value})}
                    placeholder="e.g. Ragi Mudde, Handicrafts"
                    className="w-full bg-white border border-earth-brown/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={handlePhotoClick}
                    className={cn(
                      "flex-1 bg-white border border-earth-brown/10 rounded-2xl p-4 flex flex-col items-center gap-1 hover:bg-earth-brown/5 transition-all active:scale-95",
                      photo ? "border-terracotta/30 bg-terracotta/5" : ""
                    )}
                  >
                    {photo ? (
                      <Check size={20} className="text-terracotta" />
                    ) : (
                      <Camera size={20} className="text-terracotta" />
                    )}
                    <span className="text-[10px] font-bold uppercase">{photo ? 'Photo Added' : 'Add Photo'}</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={toggleRecording}
                    className={cn(
                      "flex-1 bg-white border border-earth-brown/10 rounded-2xl p-4 flex flex-col items-center gap-1 hover:bg-earth-brown/5 transition-all active:scale-95 overflow-hidden relative",
                      isRecording ? "border-dark-olive/50 bg-dark-olive/5" : ""
                    )}
                  >
                    {isRecording ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-1"
                      >
                         <div className="flex items-center gap-2">
                            <Square size={14} className="text-dark-olive fill-dark-olive" />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1 }}
                              className="w-2 h-2 rounded-full bg-red-500"
                            />
                         </div>
                         <span className="text-[8px] font-bold text-dark-olive animate-pulse">RECORDING...</span>
                      </motion.div>
                    ) : (
                      <>
                        <Mic size={20} className="text-dark-olive" />
                        <span className="text-[10px] font-bold uppercase">Voice Note</span>
                      </>
                    )}
                  </button>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-earth-brown text-cream p-5 rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-terracotta transition-all shadow-xl shadow-earth-brown/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
                  PIN TO MAP
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
