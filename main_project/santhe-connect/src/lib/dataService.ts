import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import type { Santhe, Eatery, Review } from '../types';

export async function seedInitialData() {
  const santhes = [
    {
      name: "Sagar Tuesday Santhe",
      village: "Sagar",
      dayOfWeek: "Tuesday",
      description: "One of the largest weekly markets in the Malnad region. Famous for high-quality areca nut, forest-grown spices, and local iron tools.",
      specialties: ["Areca Nut", "Malnad Spices", "Agricultural Tools"],
      coordinates: { lat: 14.1623, lng: 75.0298 },
      imageUrl: "https://images.unsplash.com/photo-1543083477-4f7f44aad226?q=80&w=800",
      hasPhoto: true,
      hasVoice: false,
      createdAt: serverTimestamp()
    },
    {
      name: "Udupi Sunday Market",
      village: "Udupi",
      dayOfWeek: "Sunday",
      description: "Located near the Service Bus Stand, this market is a treasure trove of coastal produce like Mattu Gulla (special brinjals), jackfruit papads, and coconut-based handicrafts.",
      specialties: ["Mattu Gulla", "Jackfruit Products", "Coconut Oil"],
      coordinates: { lat: 13.3409, lng: 74.7421 },
      imageUrl: "https://images.unsplash.com/photo-1590540179852-2110a54f813a?q=80&w=800",
      hasPhoto: true,
      hasVoice: true,
      createdAt: serverTimestamp()
    },
    {
      name: "Sirsi Sunday Santhe",
      village: "Sirsi",
      dayOfWeek: "Sunday",
      description: "Deep in the Uttara Kannada forests, this market offers unique wild fruits, Kokum, and authentic forest honey.",
      specialties: ["Kokum", "Wild Honey", "Forest Herbs"],
      coordinates: { lat: 14.6195, lng: 74.8441 },
      imageUrl: "https://images.unsplash.com/photo-1596409054703-a1851b439c06?q=80&w=800",
      hasPhoto: true,
      hasVoice: false,
      createdAt: serverTimestamp()
    },
    {
      name: "Belagavi Saturday Bazaar",
      village: "Belagavi",
      dayOfWeek: "Saturday",
      description: "A massive border market famous for North Karnataka brassware, Khadi fabric, and incredible varieties of organic jaggery.",
      specialties: ["Brassware", "Khadi", "Organic Jaggery"],
      coordinates: { lat: 15.8497, lng: 74.4977 },
      imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800",
      hasPhoto: true,
      hasVoice: false,
      createdAt: serverTimestamp()
    },
    {
      name: "Madikeri Friday Market",
      village: "Madikeri",
      dayOfWeek: "Friday",
      description: "Experience the scents of Coorg. Best for home-grown coffee, black pepper, and unique Coorgi pickles.",
      specialties: ["Coffee Beans", "Black Pepper", "Coorgi Pickles"],
      coordinates: { lat: 12.4244, lng: 75.7389 },
      imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800",
      hasPhoto: true,
      hasVoice: false,
      createdAt: serverTimestamp()
    },
    {
      name: "Dharwad Thursday Santhe",
      village: "Dharwad",
      dayOfWeek: "Thursday",
      description: "A hub for North Karnataka's agricultural abundance. Best place to find authentic Jolada Rotti, dry chilies, and organic grains.",
      specialties: ["Jolada Rotti", "Byadagi Chillies", "Organic Grains"],
      coordinates: { lat: 15.4589, lng: 74.9813 },
      imageUrl: "https://images.unsplash.com/photo-1506484334402-40f21557d66a?q=80&w=800",
      hasPhoto: true,
      hasVoice: true,
      createdAt: serverTimestamp()
    },
    {
      name: "Chikmagalur Wednesday Market",
      village: "Chikmagalur",
      dayOfWeek: "Wednesday",
      description: "The coffee capital's market. Sells premium coffee beans, cardamom, and mountain vegetables.",
      specialties: ["Coffee", "Cardamom", "Mountain Veggies"],
      coordinates: { lat: 13.3161, lng: 75.7720 },
      imageUrl: "https://images.unsplash.com/photo-1447933631397-80a2c04b494a?q=80&w=800",
      hasPhoto: true,
      hasVoice: false,
      createdAt: serverTimestamp()
    },
    {
      name: "Hassan Monday Santhe",
      village: "Hassan",
      dayOfWeek: "Monday",
      description: "Major hub for potato and onion trade, also famous for local pottery and agricultural implements.",
      specialties: ["Pottery", "Potatoes", "Farming Tools"],
      coordinates: { lat: 13.0063, lng: 76.0960 },
      imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800",
      hasPhoto: true,
      hasVoice: false,
      createdAt: serverTimestamp()
    }
  ];

  const eateries = [
    {
      name: "Mitra Samaj",
      village: "Temple Square, Udupi",
      type: "hotel",
      specialty: "Udupi Buns & Goli Baje",
      description: "The most iconic breakfast spot in Udupi, located right in front of the Krishna Temple. Famous for their fluffy banana buns.",
      coordinates: { lat: 13.3408, lng: 74.7473 },
      imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=800",
      createdAt: serverTimestamp()
    },
    {
      name: "Hotel Diana",
      village: "Udupi",
      type: "hotel",
      specialty: "Gadbad Ice Cream",
      description: "Legendary for inventing the 'Gadbad' ice cream - a multi-layered delight that has become a coastal staple.",
      coordinates: { lat: 13.3422, lng: 74.7450 },
      imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800",
      createdAt: serverTimestamp()
    },
    {
      name: "Vidyarthi Bhavan",
      village: "Gandhi Bazaar, Bengaluru",
      type: "hotel",
      specialty: "Masala Dosa",
      description: "A culinary landmark since 1943. Their thick, crispy-on-the-outside Masala Dosas are iconic.",
      coordinates: { lat: 12.9439, lng: 77.5707 },
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800",
      createdAt: serverTimestamp()
    },
    {
      name: "Hotel Hanumanthu",
      village: "Mysuru",
      type: "hotel",
      specialty: "Mutton Pulav",
      description: "Operating for 90+ years, famous for the authentic 'Hanumanthu Pulav' cooked over firewood.",
      coordinates: { lat: 12.3168, lng: 76.6438 },
      imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800",
      createdAt: serverTimestamp()
    },
    {
      name: "Machali",
      village: "Mangaluru",
      type: "hotel",
      specialty: "Seafood Thali",
      description: "Famous for pristine Coastal Karnataka seafood meals and Anjal fish fry.",
      coordinates: { lat: 12.8710, lng: 74.8436 },
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
      createdAt: serverTimestamp()
    },
    {
      name: "Narayana Hotel",
      village: "Bunder, Mangaluru",
      type: "hotel",
      specialty: "Fish Fry & Thali",
      description: "Extremely popular spot for fresh fish fry. Known for its rustic atmosphere and perfectly spiced seafood.",
      coordinates: { lat: 12.8625, lng: 74.8385 },
      imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
      createdAt: serverTimestamp()
    },
    {
      name: "Sri Guru Kottureshwara",
      village: "Davanagere",
      type: "hotel",
      specialty: "Benne Dosa",
      description: "World famous for Davanagere Benne Dosa, served with spicy potato palya and coconut chutney.",
      coordinates: { lat: 14.4644, lng: 75.9218 },
      imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=800",
      createdAt: serverTimestamp()
    }
  ];

  const reviews = [
    {
      userName: "Prashanth",
      userPhoto: "https://i.pravatar.cc/150?u=prashanth",
      content: "Vidyarthi Bhavan is more than a hotel; it's a feeling. The dosa still tastes exactly like it did 20 years ago when my father first brought me here.",
      type: "text",
      createdAt: serverTimestamp()
    },
    {
      userName: "Sahana",
      userPhoto: "https://i.pravatar.cc/150?u=sahana",
      content: "The Tuesday Santhe in Sagar is incredible. I found wild honey and forest herbs that you simply cannot buy in any city supermarket.",
      type: "text",
      hasPhoto: true,
      createdAt: serverTimestamp()
    }
  ];

  try {
    for (const data of santhes) {
       await addDoc(collection(db, 'santhes'), { ...data, addedBy: auth.currentUser?.uid || 'system' });
    }
    for (const data of eateries) {
       await addDoc(collection(db, 'eateries'), { ...data, addedBy: auth.currentUser?.uid || 'system' });
    }
    for (const review of reviews) {
       await addDoc(collection(db, 'reviews'), { ...review, userId: auth.currentUser?.uid || 'system' });
    }
    console.log("Heritage and Gem data seeded successfully!");
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'seed');
  }
}

export async function addReview(review: Omit<Review, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reviews');
  }
}

export function subscribeToSanthes(onUpdate: (santhes: Santhe[]) => void) {
  const q = query(collection(db, 'santhes'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const santhes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Santhe[];
    onUpdate(santhes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'santhes');
  });
}

export function subscribeToEateries(onUpdate: (eateries: Eatery[]) => void) {
  const q = query(collection(db, 'eateries'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const eateries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Eatery[];
    onUpdate(eateries);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'eateries');
  });
}

export function subscribeToReviews(onUpdate: (reviews: Review[]) => void) {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    onUpdate(reviews);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'reviews');
  });
}
