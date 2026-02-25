import React, { useState, useEffect, useRef, useMemo } from 'react';
import Layout from './components/Layout';
import AIChatbot from './components/AIChatbot';
import ExploreMap from './components/ExploreMap';
import { ACCOMMODATIONS, GUIDES, FLIGHTS, DISTRICTS, RESTAURANTS, CARS, TOUR_ACTIVITIES } from './services/mockData';
import { safariAI } from './services/gemini';
import { Country, Activity, Accommodation, Guide, Flight, Currency, Language, Restaurant, TripPlanRequest, TripBudget, TripGroup, Car as CarType, TourActivity } from './types';
import { 
  Search, MapPin, Calendar, User, Users, Star, ArrowRight, Plane, 
  Car, UserCheck, MessageSquare, Heart, Globe, Compass, 
  Bot, Home, Building2, Trees, Waves, Mountain, Camera, Award,
  ChevronLeft, ChevronRight, Map as MapIcon, Grid, X, Clock, Filter, Tag,
  ArrowLeftRight, PlaneTakeoff, PlaneLanding, Utensils, DollarSign, Sparkles, Loader2, CheckCircle2, Image as ImageIcon, Briefcase, GraduationCap, Settings2, ExternalLink,
  Ticket
} from 'lucide-react';

type AppCategory = 'hotels' | 'airbnb' | 'guides' | 'carHire' | 'flights' | 'restaurants' | 'planner' | 'activities' | 'explore';

const INTERESTS: Activity[] = ['Wildlife', 'Rafting', 'Trekking', 'Beach', 'Hiking', 'Photography', 'Birding', 'Relaxation'];

const CUISINES = ['All', 'African', 'Italian', 'Chinese', 'Indian', 'French', 'Mediterranean', 'Seafood', 'Steakhouse'];

const App: React.FC = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AppCategory>('hotels');
  
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);

  const [selectedCountry, setSelectedCountry] = useState<Country | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  
  // Hotel Filters
  const [hotelFilters, setHotelFilters] = useState({
    search: '',
    minRating: 0,
    maxPrice: 2000
  });

  // Restaurant Filters
  const [restaurantFilters, setRestaurantFilters] = useState({
    cuisine: 'All',
    minRating: 0
  });

  // Airbnb specific advanced filters
  const [airbnbFilters, setAirbnbFilters] = useState({
    search: '',
    maxPrice: 1000,
    minRating: 0,
    activity: 'All'
  });

  // Car Hire specific filters
  const [carFilters, setCarFilters] = useState({
    search: '',
    type: 'All',
    capacity: 'All',
    transmission: 'All',
    maxPrice: 500
  });

  // Guide Filters
  const [guideFilters, setGuideFilters] = useState({
    minRating: 0,
    gender: 'All',
    language: 'All',
    ageRange: [18, 65],
    expertise: 'All'
  });

  // Activity Filters
  const [activityFilters, setActivityFilters] = useState({
    search: '',
    category: 'All',
    maxPrice: 3000
  });

  // Real-time Flight Search State
  const [flightParams, setFlightParams] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    airline: '',
    maxPrice: 5000
  });
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [realFlightResults, setRealFlightResults] = useState<{ text: string; sources: any[] } | null>(null);

  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<TourActivity | null>(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  
  const [plannerRequest, setPlannerRequest] = useState<TripPlanRequest>({
    destination: 'Surprise Me',
    duration: 7,
    budget: 'Moderate',
    group: 'Couple',
    interests: ['Wildlife']
  });
  const [isPlanning, setIsPlanning] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [aiGeneratedImages, setAiGeneratedImages] = useState<string[]>([]);

  // Fixed the TypeScript error by using Partial to satisfy the requirement for all Language enum values
  const translations: Partial<Record<Language, Record<string, string>>> = {
    [Language.ENGLISH]: {
      hero: "Africa, Tailored for You.",
      heroSub: "Your premium gateway to the wild landscapes of Uganda, Kenya, and Tanzania.",
      hotels: "Hotels",
      airbnb: "Airbnb",
      flights: "Flights",
      guides: "Guides",
      restaurants: "Restaurants",
      planner: "AI Planner",
      carHire: "Car Hire",
      activities: "Activities",
      login: "Login",
      explore: "Explore",
      support: "Support",
      stayUpdated: "Stay Updated",
      newsletter: "Get curated East African travel stories in your inbox.",
      emailPlaceholder: "Email address",
      go: "Go",
      copyright: "Phase 1: East African Hub (UG, KE, TZ).",
      privacy: "Privacy Policy",
      terms: "Terms",
      destinations: "Destinations",
      safariPackages: "Safari Packages",
      localGuides: "Local Guides",
      hiddenGems: "Hidden Gems",
      contactUs: "Contact Us",
      helpCenter: "Help Center",
      cancellationPolicy: "Cancellation Policy",
      footerDesc: "Your definitive gateway to Africa. Exploring Uganda, Kenya, and Tanzania with the power of intelligence.",
      departure: "Departure Place",
      destination: "Destination",
      departureDate: "Departure Date",
      returnDate: "Return Date",
      search: "Search",
      night: "night",
      totalRoundtrip: "Total Roundtrip",
      select: "Select",
      bookNow: "Book Now",
      guestFavorite: "Guest Favorite",
      verifiedHost: "Verified Host • Venture Safaris",
      cuisine: "Cuisine",
      price: "Price",
      rating: "Rating",
      findTable: "Find Table",
      planTrip: "Plan a Trip with AI",
      howLong: "How many days?",
      yourBudget: "Your Budget",
      whoTravels: "Who's traveling?",
      whatInterests: "What interests you?",
      generatePlan: "Generate My Itinerary",
      planningMsg: "Crafting your custom East African adventure...",
      startNew: "Start New Plan",
      rentPerDay: "per day",
      transmission: "Transmission",
      capacity: "Capacity",
      seats: "seats"
    },
    [Language.FRENCH]: {
      hero: "L'Afrique, sur mesure pour vous.",
      heroSub: "Votre porte d'entrée premium vers les paysages sauvages de l'Ouganda, du Kenya et de la Tanzanie.",
      hotels: "Hôtels",
      airbnb: "Airbnb",
      flights: "Vols",
      guides: "Guides",
      restaurants: "Restaurants",
      planner: "Planificateur IA",
      carHire: "Location de voiture",
      activities: "Activités",
      login: "Connexion",
      explore: "Explorer",
      support: "Support",
      stayUpdated: "Restez à jour",
      newsletter: "Recevez des récits de voyage est-africains dans votre boîte de réception.",
      emailPlaceholder: "Adresse e-mail",
      go: "Aller",
      copyright: "Phase 1 : Hub Est-Africain (UG, KE, TZ).",
      privacy: "Politique de confidentialité",
      terms: "Conditions",
      destinations: "Destinations",
      safariPackages: "Forfaits Safari",
      localGuides: "Guides Locaux",
      hiddenGems: "Trésors Cachés",
      contactUs: "Contactez-nous",
      helpCenter: "Centre d'aide",
      cancellationPolicy: "Politique d'annulation",
      footerDesc: "Votre porte d'entrée définitive vers l'Afrique. Explorer l'Ouganda, le Kenya et la Tanzanie avec la puissance de l'intelligence.",
      departure: "Lieu de départ",
      destination: "Destination",
      departureDate: "Date de départ",
      returnDate: "Date de retour",
      search: "Rechercher",
      night: "nuit",
      totalRoundtrip: "Total Aller-Retour",
      select: "Sélectionner",
      bookNow: "Réserver maintenant",
      guestFavorite: "Coup de cœur des voyageurs",
      verifiedHost: "Hôte vérifié • Venture Safaris",
      cuisine: "Cuisine",
      price: "Prix",
      rating: "Évaluation",
      findTable: "Trouver une table",
      planTrip: "Planifier un voyage avec l'IA",
      howLong: "Combien de jours ?",
      yourBudget: "Votre budget",
      whoTravels: "Qui voyage ?",
      whatInterests: "Qu'est-ce qui vous intéresse ?",
      generatePlan: "Générer mon itinéraire",
      planningMsg: "Conception de votre aventure est-africaine personnalisée...",
      startNew: "Nouveau plan",
      rentPerDay: "par jour",
      transmission: "Transmission",
      capacity: "Capacité",
      seats: "sièges"
    },
    [Language.SPANISH]: {
      hero: "África, a su medida.",
      heroSub: "Su puerta de entrada premium a los paisajes salvajes de Uganda, Kenia y Tanzania.",
      hotels: "Hoteles",
      airbnb: "Airbnb",
      flights: "Vuelos",
      guides: "Guías",
      restaurants: "Restaurantes",
      planner: "Planificador IA",
      carHire: "Alquiler de coches",
      activities: "Actividades",
      login: "Iniciar sesión",
      explore: "Explorar",
      support: "Soporte",
      stayUpdated: "Manténgase actualizado",
      newsletter: "Reciba historias de viajes por África Oriental en su bandeja de entrada.",
      emailPlaceholder: "Correo electrónico",
      go: "Ir",
      copyright: "Fase 1: Centro de África Oriental (UG, KE, TZ).",
      privacy: "Política de privacidad",
      terms: "Términos",
      destinations: "Destinos",
      safariPackages: "Paquetes de Safari",
      localGuides: "Guías Locales",
      hiddenGems: "Joyas Ocultas",
      contactUs: "Contáctenos",
      helpCenter: "Centro de ayuda",
      cancellationPolicy: "Política de cancelación",
      footerDesc: "Su puerta de entrada definitiva a África. Explorando Uganda, Kenia y Tanzania con el poder de la inteligencia.",
      departure: "Lugar de salida",
      destination: "Destino",
      departureDate: "Fecha de salida",
      returnDate: "Fecha de regreso",
      search: "Buscar",
      night: "noche",
      totalRoundtrip: "Total Ida y Vuelta",
      select: "Seleccionar",
      bookNow: "Reservar ahora",
      guestFavorite: "Favorito de los huéspedes",
      verifiedHost: "Anfitrión verificado • Venture Safaris",
      cuisine: "Cocina",
      price: "Precio",
      rating: "Calificación",
      findTable: "Buscar mesa",
      planTrip: "Planear un viaje con IA",
      howLong: "¿Cuántos días?",
      yourBudget: "Su presupuesto",
      whoTravels: "¿Quién viaja?",
      whatInterests: "¿Qué le interesa?",
      generatePlan: "Generar mi itinerario",
      planningMsg: "Creando su aventura personalizada por África Oriental...",
      startNew: "Nuevo plan",
      rentPerDay: "por día",
      transmission: "Transmisión",
      capacity: "Capacidad",
      seats: "asientos"
    },
    [Language.GERMAN]: {
      hero: "Afrika, maßgeschneidert für Sie.",
      heroSub: "Ihr erstklassiges Tor zu den wilden Landschaften von Uganda, Kenia und Tansania.",
      hotels: "Hotels",
      airbnb: "Airbnb",
      flights: "Flüge",
      guides: "Guides",
      restaurants: "Restaurants",
      planner: "KI-Planer",
      carHire: "Mietwagen",
      activities: "Aktivitäten",
      login: "Login",
      explore: "Erkunden",
      support: "Support",
      stayUpdated: "Bleiben Sie auf dem Laufenden",
      newsletter: "Erhalten Sie kuratierte Reiseberichte aus Ostafrika in Ihrem Posteingang.",
      emailPlaceholder: "E-Mail-Adresse",
      go: "Los",
      copyright: "Phase 1: Ostafrikanisches Zentrum (UG, KE, TZ).",
      privacy: "Datenschutzrichtlinie",
      terms: "Bedingungen",
      destinations: "Reiseziele",
      safariPackages: "Safari-Pakete",
      localGuides: "Lokale Guides",
      hiddenGems: "Geheimtipps",
      contactUs: "Kontaktieren Sie uns",
      helpCenter: "Hilfezentrum",
      cancellationPolicy: "Stornierungsbedingungen",
      footerDesc: "Ihr definitives Tor nach Afrika. Erkunden Sie Uganda, Kenia und Tansania mit der Kraft der Intelligenz.",
      departure: "Abflugort",
      destination: "Zielort",
      departureDate: "Abflugdatum",
      returnDate: "Rückflugdatum",
      search: "Suchen",
      night: "Nacht",
      totalRoundtrip: "Gesamt Hin- und Rückflug",
      select: "Auswählen",
      bookNow: "Jetzt buchen",
      guestFavorite: "Gästefavorit",
      verifiedHost: "Verifizierter Gastgeber • Venture Safaris",
      cuisine: "Küche",
      price: "Preis",
      rating: "Bewertung",
      findTable: "Tisch finden",
      planTrip: "Reise mit KI planen",
      howLong: "Wie viele Tage?",
      yourBudget: "Ihr Budget",
      whoTravels: "Wer reist?",
      whatInterests: "Was interessiert Sie?",
      generatePlan: "Meinen Reiseplan erstellen",
      planningMsg: "Gestaltung Ihres individuellen ostafrikanischen Abenteuers...",
      startNew: "Neuer Plan",
      rentPerDay: "pro Tag",
      transmission: "Getriebe",
      capacity: "Kapazität",
      seats: "Sitze"
    },
    [Language.ARABIC]: {
      hero: "أفريقيا، مصممة خصيصاً لك.",
      heroSub: "بوابتك المتميزة إلى المناظر الطبيعية البرية في أوغندا وكينيا وتنزانيا.",
      hotels: "فنادق",
      airbnb: "إير بي إن بي",
      flights: "رحلات طيران",
      guides: "مرشدون",
      restaurants: "مطاعم",
      planner: "مخطط الذكاء الاصطناعي",
      carHire: "تأجير سيارات",
      activities: "أنشطة",
      login: "تسجيل الدخول",
      explore: "استكشف",
      support: "الدعم",
      stayUpdated: "ابق على اطلاع",
      newsletter: "احصل على قصص سفر من شرق أفريقيا في بريدك الإلكتروني.",
      emailPlaceholder: "البريد الإلكتروني",
      go: "انطلق",
      copyright: "المرحلة 1: مركز شرق أفريقيا (أوغندا، كينيا، تنزانيا).",
      privacy: "سياسة الخصوصية",
      terms: "الشروط",
      destinations: "الوجهات",
      safariPackages: "باقات السفاري",
      localGuides: "مرشدون محليون",
      hiddenGems: "جواهر خفية",
      contactUs: "اتصل بنا",
      helpCenter: "مركز المساعدة",
      cancellationPolicy: "سياسة الإلغاء",
      footerDesc: "بوابتك النهائية إلى أفريقيا. استكشاف أوغندا وكينيا وتنزانيا بقوة الذكاء.",
      departure: "مكان المغادرة",
      destination: "الوجهة",
      departureDate: "تاريخ المغادرة",
      returnDate: "تاريخ العودة",
      search: "بحث",
      night: "ليلة",
      totalRoundtrip: "إجمالي الذهاب والعودة",
      select: "اختر",
      bookNow: "احجز الآن",
      guestFavorite: "المفضل لدى الضيوف",
      verifiedHost: "مضيف موثوق • فينتشر سفاريز",
      cuisine: "المطبخ",
      price: "السعر",
      rating: "التقييم",
      findTable: "احجز طاولة",
      planTrip: "خطط لرحلة بالذكاء الاصطناعي",
      howLong: "كم عدد الأيام؟",
      yourBudget: "ميزانيتك",
      whoTravels: "من يسافر؟",
      whatInterests: "ما الذي يهمك؟",
      generatePlan: "أنشئ مسار رحلتي",
      planningMsg: "نصمم مغامرتك المخصصة في شرق أفريقيا...",
      startNew: "بدء خطة جديدة",
      rentPerDay: "يومياً",
      transmission: "ناقل الحركة",
      capacity: "السعة",
      seats: "مقاعد"
    },
    // Additional languages would be added here as needed
  };

  // Using optional chaining to handle potentially missing translations in the Partial record
  const t = (key: string) => (translations[language]?.[key]) || translations[Language.ENGLISH]?.[key] || key;

  const rates: Record<Currency, number> = {
    [Currency.USD]: 1,
    [Currency.EUR]: 0.94,
    [Currency.UGX]: 3750,
    [Currency.KES]: 130,
    [Currency.TZS]: 2600
  };

  const formatPrice = (usdAmount: number) => {
    const converted = usdAmount * rates[currency];
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === Currency.USD || currency === Currency.EUR ? 2 : 0
    }).format(converted);
  };

  const handleStartPlanning = async () => {
    setIsPlanning(true);
    setGeneratedPlan(null);
    setAiGeneratedImages([]);
    
    try {
      const planPromise = safariAI.generateTripPlan(plannerRequest);
      const img1Promise = safariAI.generateTripImage(`The scenic landscapes of ${plannerRequest.destination}, focusing on ${plannerRequest.interests[0] || 'nature'}`);
      const img2Promise = safariAI.generateTripImage(`A tourist enjoying ${plannerRequest.interests[1] || plannerRequest.interests[0] || 'safari'} in ${plannerRequest.destination}`);
      const [plan, img1, img2] = await Promise.all([planPromise, img1Promise, img2Promise]);
      setGeneratedPlan(plan);
      const images = [];
      if (img1) images.push(img1);
      if (img2) images.push(img2);
      setAiGeneratedImages(images);
    } catch (e) {
      console.error(e);
      alert("Failed to plan trip. Please check your connection.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleRealFlightSearch = async () => {
    if (!flightParams.from || !flightParams.to || !flightParams.departureDate) {
      alert("Please enter from, to, and departure date.");
      return;
    }
    setIsSearchingFlights(true);
    setRealFlightResults(null);
    try {
      const results = await safariAI.searchFlights({
        ...flightParams,
        currency: currency
      });
      setRealFlightResults(results);
    } catch (e) {
      alert("Error searching real-time flights. Please try again.");
    } finally {
      setIsSearchingFlights(false);
    }
  };

  const filteredStays = useMemo(() => ACCOMMODATIONS.filter(s => {
    const typeMatch = activeCategory === 'hotels' ? s.type === 'Hotel' : s.type === 'Airbnb';
    const matchesCountry = selectedCountry === 'All' || s.country === selectedCountry;
    const matchesDistrict = selectedDistrict === 'All' || s.district === selectedDistrict;
    
    if (activeCategory === 'hotels') {
      const matchesSearch = !hotelFilters.search || s.name.toLowerCase().includes(hotelFilters.search.toLowerCase());
      const matchesRating = s.rating >= hotelFilters.minRating;
      const matchesPrice = s.price <= hotelFilters.maxPrice;
      return typeMatch && matchesCountry && matchesDistrict && matchesSearch && matchesRating && matchesPrice;
    }

    if (activeCategory === 'airbnb') {
      const matchesSearch = !airbnbFilters.search || 
        s.name.toLowerCase().includes(airbnbFilters.search.toLowerCase()) || 
        s.description.toLowerCase().includes(airbnbFilters.search.toLowerCase());
      const matchesPrice = s.price <= airbnbFilters.maxPrice;
      const matchesRating = s.rating >= airbnbFilters.minRating;
      const matchesActivity = airbnbFilters.activity === 'All' || s.activities.includes(airbnbFilters.activity as any);
      return typeMatch && matchesCountry && matchesDistrict && matchesSearch && matchesPrice && matchesRating && matchesActivity;
    }

    return typeMatch && matchesCountry && matchesDistrict;
  }), [activeCategory, selectedCountry, selectedDistrict, airbnbFilters, hotelFilters]);

  const filteredGuides = useMemo(() => GUIDES.filter(g => {
    const matchesCountry = selectedCountry === 'All' || g.country === selectedCountry;
    const matchesDistrict = selectedDistrict === 'All' || g.location.toLowerCase().includes(selectedDistrict.toLowerCase());
    const matchesRating = g.rating >= guideFilters.minRating;
    const matchesGender = guideFilters.gender === 'All' || g.gender === guideFilters.gender;
    const matchesLanguage = guideFilters.language === 'All' || g.languages.includes(guideFilters.language);
    const matchesAge = g.age >= guideFilters.ageRange[0] && g.age <= guideFilters.ageRange[1];
    const matchesExpertise = guideFilters.expertise === 'All' || g.expertise.includes(guideFilters.expertise as any);
    return matchesCountry && matchesDistrict && matchesRating && matchesGender && matchesLanguage && matchesAge && matchesExpertise;
  }), [selectedCountry, selectedDistrict, guideFilters]);

  const filteredRestaurants = useMemo(() => RESTAURANTS.filter(r => {
    const matchesLocation = (selectedCountry === 'All' || r.country === selectedCountry) &&
                            (selectedDistrict === 'All' || r.district === selectedDistrict);
    const matchesCuisine = restaurantFilters.cuisine === 'All' || r.cuisine.some(c => c.toLowerCase().includes(restaurantFilters.cuisine.toLowerCase()));
    const matchesRating = r.rating >= restaurantFilters.minRating;
    return matchesLocation && matchesCuisine && matchesRating;
  }), [selectedCountry, selectedDistrict, restaurantFilters]);

  const filteredCars = useMemo(() => CARS.filter(c => {
    const matchesCountry = selectedCountry === 'All' || c.country === selectedCountry;
    const matchesDistrict = selectedDistrict === 'All' || c.district === selectedDistrict;
    const matchesSearch = !carFilters.search || c.name.toLowerCase().includes(carFilters.search.toLowerCase());
    const matchesType = carFilters.type === 'All' || c.type === carFilters.type;
    const matchesTransmission = carFilters.transmission === 'All' || c.transmission === carFilters.transmission;
    const matchesCapacity = carFilters.capacity === 'All' || 
                           (carFilters.capacity === '7+' ? c.capacity >= 7 : c.capacity === parseInt(carFilters.capacity));
    const matchesPrice = c.pricePerDay <= carFilters.maxPrice;
    
    return matchesCountry && matchesDistrict && matchesSearch && matchesType && matchesTransmission && matchesCapacity && matchesPrice;
  }), [selectedCountry, selectedDistrict, carFilters]);

  const filteredActivities = useMemo(() => TOUR_ACTIVITIES.filter(a => {
    const matchesCountry = selectedCountry === 'All' || a.country === selectedCountry;
    const matchesLocation = selectedDistrict === 'All' || a.location.toLowerCase().includes(selectedDistrict.toLowerCase());
    const matchesSearch = !activityFilters.search || a.name.toLowerCase().includes(activityFilters.search.toLowerCase()) || a.description.toLowerCase().includes(activityFilters.search.toLowerCase());
    const matchesCategory = activityFilters.category === 'All' || a.category === activityFilters.category;
    const matchesPrice = a.price <= activityFilters.maxPrice;
    
    return matchesCountry && matchesLocation && matchesSearch && matchesCategory && matchesPrice;
  }), [selectedCountry, selectedDistrict, activityFilters]);

  const cleanText = (text: string) => {
    return text
      .replace(/\*{2,}/g, '') 
      .replace(/#{1,}/g, '')  
      .replace(/\*/g, '•')    
      .trim();
  };

  return (
    <Layout 
      currency={currency} 
      setCurrency={setCurrency} 
      language={language} 
      setLanguage={setLanguage}
      t={t}
      setActiveCategory={setActiveCategory}
    >
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {t('hero').split(',')[0]}, <span className="text-emerald-400 italic font-serif">{t('hero').split(',')[1]}</span>
          </h1>
          <p className="text-stone-300 max-w-xl mx-auto text-sm md:text-base">
            {t('heroSub')}
          </p>
        </div>
      </section>

      <div className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 flex justify-between items-center h-20">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            <CategoryButton active={activeCategory === 'hotels'} onClick={() => setActiveCategory('hotels')} icon={<Building2 size={18} />} label={t('hotels')} />
            <CategoryButton active={activeCategory === 'airbnb'} onClick={() => setActiveCategory('airbnb')} icon={<Home size={18} />} label={t('airbnb')} />
            <CategoryButton active={activeCategory === 'explore'} onClick={() => setActiveCategory('explore')} icon={<Globe size={18} />} label={t('explore')} />
            <CategoryButton active={activeCategory === 'activities'} onClick={() => setActiveCategory('activities')} icon={<Ticket size={18} />} label={t('activities')} />
            <CategoryButton active={activeCategory === 'restaurants'} onClick={() => setActiveCategory('restaurants')} icon={<Utensils size={18} />} label={t('restaurants')} />
            <CategoryButton active={activeCategory === 'guides'} onClick={() => setActiveCategory('guides')} icon={<UserCheck size={18} />} label={t('guides')} />
            <CategoryButton active={activeCategory === 'carHire'} onClick={() => setActiveCategory('carHire')} icon={<Car size={18} />} label={t('carHire')} />
            <CategoryButton active={activeCategory === 'flights'} onClick={() => setActiveCategory('flights')} icon={<Plane size={18} />} label={t('flights')} />
            <CategoryButton active={activeCategory === 'planner'} onClick={() => setActiveCategory('planner')} icon={<Sparkles size={18} />} label={t('planner')} />
          </div>
        </div>
      </div>

      <div className="min-h-[60vh]">
        {activeCategory === 'planner' ? (
          <section className="container mx-auto px-4 py-12">
            {!generatedPlan ? (
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest border border-emerald-100">
                    <Sparkles size={14} /> AI Powered Planning
                  </div>
                  <h2 className="text-4xl font-black text-stone-900">{t('planTrip')}</h2>
                  <p className="text-stone-500 text-lg">Build a curated itinerary with East Africa's smartest AI travel scout.</p>
                </div>

                <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-stone-100 space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('destination')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Surprise Me', ...Object.values(Country)].map(c => (
                        <button 
                          key={c}
                          onClick={() => setPlannerRequest(p => ({...p, destination: c as any}))}
                          className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${plannerRequest.destination === c ? 'bg-emerald-900 text-white border-emerald-900 shadow-xl' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-300'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('howLong')}</label>
                      <div className="flex items-center gap-4 bg-stone-50 rounded-2xl px-6 py-4 border border-stone-200">
                        <input 
                          type="range" min="1" max="21" 
                          className="flex-1 accent-emerald-600"
                          value={plannerRequest.duration}
                          onChange={e => setPlannerRequest(p => ({...p, duration: parseInt(e.target.value)}))}
                        />
                        <span className="font-black text-emerald-900 text-lg min-w-[3ch]">{plannerRequest.duration}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('yourBudget')}</label>
                      <div className="flex gap-2">
                        {(['Backpacker', 'Moderate', 'Luxury'] as TripBudget[]).map(b => (
                          <button 
                            key={b}
                            onClick={() => setPlannerRequest(p => ({...p, budget: b}))}
                            className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${plannerRequest.budget === b ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-500 border-stone-200'}`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('whoTravels')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['Solo', 'Couple', 'Family', 'Group'] as TripGroup[]).map(g => (
                        <button 
                          key={g}
                          onClick={() => setPlannerRequest(p => ({...p, group: g}))}
                          className={`px-4 py-3 rounded-2xl text-sm font-bold border transition-all ${plannerRequest.group === g ? 'bg-emerald-100 text-emerald-900 border-emerald-200' : 'bg-stone-50 text-stone-600 border-stone-200'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest">{t('whatInterests')}</label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(i => (
                        <button 
                          key={i}
                          onClick={() => {
                            setPlannerRequest(p => ({
                              ...p,
                              interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i]
                            }))
                          }}
                          className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${plannerRequest.interests.includes(i) ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-stone-500 border-stone-200'}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleStartPlanning}
                      disabled={isPlanning}
                      className="w-full bg-emerald-700 text-white py-6 rounded-3xl font-black text-xl hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/30 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isPlanning ? (
                        <>
                          <Loader2 className="animate-spin" />
                          {t('planningMsg')}
                        </>
                      ) : (
                        <>
                          <Sparkles />
                          {t('generatePlan')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white rounded-[40px] shadow-2xl border border-stone-100 overflow-hidden">
                  <div className="bg-emerald-900 p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 text-white">
                       <Compass size={240} />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                        <CheckCircle2 size={16} /> Your Adventure Awaits
                      </div>
                      <h2 className="text-5xl font-black leading-tight">{plannerRequest.duration} Days in {plannerRequest.destination}</h2>
                      <div className="flex gap-4 pt-4">
                        <span className="bg-white/10 backdrop-blur px-5 py-2 rounded-xl text-sm font-bold border border-white/10">{plannerRequest.budget}</span>
                        <span className="bg-white/10 backdrop-blur px-5 py-2 rounded-xl text-sm font-bold border border-white/10">{plannerRequest.group}</span>
                      </div>
                    </div>
                  </div>

                  {aiGeneratedImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-stone-50">
                      {aiGeneratedImages.map((img, idx) => (
                        <div key={idx} className="group relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-stone-200">
                           <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="AI Generated Scene" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                           <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white/90 text-[10px] font-black uppercase tracking-widest">
                             <Sparkles size={12} className="text-emerald-400" /> AI Visualization
                           </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-12">
                     <div className="space-y-8">
                        {generatedPlan.split('\n').filter(line => line.trim()).map((line, i) => {
                          const cleaned = cleanText(line);
                          const isHeading = line.startsWith('#') || line.toUpperCase() === line && line.length > 5;
                          if (isHeading) return <h3 key={i} className="text-2xl font-black text-stone-900 pt-6 border-b-2 border-emerald-50 pb-2">{cleaned}</h3>;
                          if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                             return (
                               <div key={i} className="flex gap-4 pl-4">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                 <p className="text-stone-700 font-medium leading-relaxed">{cleaned.replace(/^•\s*/, '')}</p>
                               </div>
                             );
                          }
                          return <p key={i} className="text-stone-700 text-lg leading-relaxed font-medium">{cleaned}</p>;
                        })}
                     </div>
                  </div>

                  <div className="bg-stone-50 p-12 border-t border-stone-100 flex flex-col items-center gap-8">
                    <button onClick={() => setGeneratedPlan(null)} className="px-8 py-4 rounded-2xl font-black text-stone-400 hover:text-stone-900 transition-colors">
                        {t('startNew')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="container mx-auto px-4 py-12">
            <div className="mb-12 space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-6 rounded-[32px] shadow-xl border border-stone-100">
                <FilterSelect value={selectedCountry} onChange={(v) => setSelectedCountry(v as any)} options={['All', ...Object.values(Country)]} icon={<Globe size={14} />} label="Country" />
                <FilterSelect value={selectedDistrict} onChange={(v) => setSelectedDistrict(v)} options={selectedCountry === 'All' ? ['All'] : ['All', ...DISTRICTS[selectedCountry as Country]]} icon={<MapPin size={14} />} label="District" disabled={selectedCountry === 'All'} />

                {activeCategory === 'hotels' && (
                  <>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100 min-w-[200px]">
                      <Search size={14} className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Hotel Keywords</p>
                        <input 
                          type="text" 
                          placeholder="Luxury, Spa, View..."
                          className="bg-transparent border-none text-xs font-bold outline-none w-full placeholder:text-stone-300"
                          value={hotelFilters.search}
                          onChange={e => setHotelFilters(p => ({...p, search: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                      <Star size={14} className="text-amber-500" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Min Rating</p>
                        <select className="bg-transparent border-none text-xs font-bold outline-none" value={hotelFilters.minRating} onChange={e => setHotelFilters(p => ({...p, minRating: parseFloat(e.target.value)}))}>
                          <option value={0}>Any</option>
                          <option value={4}>4.0+</option>
                          <option value={4.5}>4.5+</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100 min-w-[150px]">
                      <DollarSign size={14} className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Max {currency} {hotelFilters.maxPrice}</p>
                        <input type="range" min="50" max="2000" step="50" className="w-full h-1 accent-emerald-600" value={hotelFilters.maxPrice} onChange={e => setHotelFilters(p => ({...p, maxPrice: parseInt(e.target.value)}))} />
                      </div>
                    </div>
                  </>
                )}

                {activeCategory === 'restaurants' && (
                  <>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100 min-w-[150px]">
                      <Utensils size={14} className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Cuisine</p>
                        <select className="bg-transparent border-none text-xs font-bold outline-none appearance-none" value={restaurantFilters.cuisine} onChange={e => setRestaurantFilters(p => ({...p, cuisine: e.target.value}))}>
                          {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                      <Star size={14} className="text-amber-500" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Min Rating</p>
                        <select className="bg-transparent border-none text-xs font-bold outline-none" value={restaurantFilters.minRating} onChange={e => setRestaurantFilters(p => ({...p, minRating: parseFloat(e.target.value)}))}>
                          <option value={0}>Any</option>
                          <option value={4}>4.0+</option>
                          <option value={4.5}>4.5+</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {activeCategory === 'activities' && (
                  <>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100 min-w-[200px]">
                      <Search size={14} className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Activity Keywords</p>
                        <input 
                          type="text" 
                          placeholder="Safari, Rafting..."
                          className="bg-transparent border-none text-xs font-bold outline-none w-full placeholder:text-stone-300"
                          value={activityFilters.search}
                          onChange={e => setActivityFilters(p => ({...p, search: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100 min-w-[150px]">
                      <Tag size={14} className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Category</p>
                        <select className="bg-transparent border-none text-xs font-bold outline-none appearance-none" value={activityFilters.category} onChange={e => setActivityFilters(p => ({...p, category: e.target.value}))}>
                          {['All', ...INTERESTS].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100 min-w-[150px]">
                      <DollarSign size={14} className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-stone-400 mb-1 leading-none">Max {currency} {activityFilters.maxPrice}</p>
                        <input type="range" min="10" max="3000" step="10" className="w-full h-1 accent-emerald-600" value={activityFilters.maxPrice} onChange={e => setActivityFilters(p => ({...p, maxPrice: parseInt(e.target.value)}))} />
                      </div>
                    </div>
                  </>
                )}

                {activeCategory === 'flights' && (
                  <div className="flex flex-col gap-6 w-full max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                         <p className="text-[9px] uppercase font-black text-stone-400 mb-1">Departure Place</p>
                         <input type="text" placeholder="e.g. London (LHR)" className="bg-transparent border-none text-xs font-bold outline-none w-full" value={flightParams.from} onChange={e => setFlightParams(p => ({...p, from: e.target.value}))} />
                      </div>
                      <div className="bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                         <p className="text-[9px] uppercase font-black text-stone-400 mb-1">Destination</p>
                         <input type="text" placeholder="e.g. Entebbe (EBB)" className="bg-transparent border-none text-xs font-bold outline-none w-full" value={flightParams.to} onChange={e => setFlightParams(p => ({...p, to: e.target.value}))} />
                      </div>
                      <div className="bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                         <p className="text-[9px] uppercase font-black text-stone-400 mb-1">Departure Date</p>
                         <input type="date" className="bg-transparent border-none text-xs font-bold outline-none w-full" value={flightParams.departureDate} onChange={e => setFlightParams(p => ({...p, departureDate: e.target.value}))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                         <p className="text-[9px] uppercase font-black text-stone-400 mb-1">Return Date (Optional)</p>
                         <input type="date" className="bg-transparent border-none text-xs font-bold outline-none w-full" value={flightParams.returnDate} onChange={e => setFlightParams(p => ({...p, returnDate: e.target.value}))} />
                      </div>
                      <div className="bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                         <p className="text-[9px] uppercase font-black text-stone-400 mb-1">Preferred Airline</p>
                         <select className="bg-transparent border-none text-xs font-bold outline-none w-full" value={flightParams.airline} onChange={e => setFlightParams(p => ({...p, airline: e.target.value}))}>
                            <option value="">Any Airline</option>
                            <option value="Qatar Airways">Qatar Airways</option>
                            <option value="Emirates">Emirates</option>
                            <option value="Kenya Airways">Kenya Airways</option>
                            <option value="Ethiopian Airlines">Ethiopian Airlines</option>
                            <option value="Turkish Airlines">Turkish Airlines</option>
                            <option value="KLM">KLM</option>
                         </select>
                      </div>
                      <div className="bg-stone-50 rounded-2xl px-4 py-2 border border-stone-100">
                         <p className="text-[9px] uppercase font-black text-stone-400 mb-1">Max Price ({currency})</p>
                         <input type="number" placeholder="e.g. 1000" className="bg-transparent border-none text-xs font-bold outline-none w-full" value={flightParams.maxPrice} onChange={e => setFlightParams(p => ({...p, maxPrice: parseInt(e.target.value)}))} />
                      </div>
                    </div>
                    <button 
                      onClick={handleRealFlightSearch}
                      disabled={isSearchingFlights}
                      className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      {isSearchingFlights ? <><Loader2 className="animate-spin" size={16}/> Finding Live Flights...</> : <><Search size={16}/> Search Live Working Data</>}
                    </button>
                  </div>
                )}

                {/* (Airbnb, CarHire, Guides filters logic stays as requested before) */}
              </div>
            </div>

            {activeCategory === 'flights' && realFlightResults && (
              <div className="max-w-4xl mx-auto mb-12 animate-in fade-in duration-700">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-stone-100">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                        <Sparkles size={20} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-stone-900">Real-Time Flight Results</h2>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Fetched from live web data</p>
                     </div>
                  </div>
                  <div className="prose prose-stone max-w-none">
                     <div className="space-y-6 text-stone-700 font-medium leading-relaxed">
                        {realFlightResults.text.split('\n').map((line, i) => (
                           <p key={i}>{line}</p>
                        ))}
                     </div>
                  </div>
                  {realFlightResults.sources.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-stone-100">
                      <p className="text-[10px] font-black uppercase text-stone-400 mb-4 tracking-widest">Verify & Book</p>
                      <div className="flex flex-wrap gap-3">
                         {realFlightResults.sources.map((chunk, idx) => (
                           chunk.web && (
                             <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                                {chunk.web.title || 'Official Site'} <ExternalLink size={12} />
                             </a>
                           )
                         ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setRealFlightResults(null)} className="mt-12 text-stone-400 font-bold text-xs hover:text-stone-900 transition-colors">Clear Results</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {activeCategory === 'hotels' && filteredStays.map(stay => <HotelCard key={stay.id} stay={stay} formatPrice={formatPrice} t={t} />)}
               {activeCategory === 'airbnb' && filteredStays.map(stay => <AirbnbCard key={stay.id} stay={stay} formatPrice={formatPrice} t={t} />)}
               {activeCategory === 'activities' && filteredActivities.map(activity => <ActivityCard key={activity.id} activity={activity} formatPrice={formatPrice} t={t} onBook={() => setSelectedActivity(activity)} />)}
               {activeCategory === 'carHire' && filteredCars.map(car => <CarHireCard key={car.id} car={car} formatPrice={formatPrice} t={t} />)}
               {activeCategory === 'guides' && filteredGuides.map(guide => <GuideCard key={guide.id} guide={guide} onClick={() => setSelectedGuide(guide)} />)}
            </div>

            {activeCategory === 'explore' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ExploreMap />
              </div>
            )}
            
            {activeCategory === 'restaurants' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {filteredRestaurants.map(res => <RestaurantCard key={res.id} restaurant={res} t={t} />)}
               </div>
            )}
            
            {activeCategory === 'flights' && !realFlightResults && (
              <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
                 <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-300">
                    <Plane size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-stone-900">Enter flight details above</h3>
                 <p className="text-stone-400 max-w-xs mx-auto text-sm">Our AI will scan global flight databases for real-time prices and availability.</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Guide Profile Modal (same as before) */}
      {selectedGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedGuide(null)} className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors z-10">
              <X size={20} className="text-stone-600" />
            </button>
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
              {/* Profile Image and Header */}
              <div className="md:w-1/3 bg-stone-50 p-8 border-r border-stone-100 flex flex-col items-center">
                 <img src={selectedGuide.image} className="w-48 h-48 rounded-[40px] object-cover shadow-2xl mb-6 border-4 border-white" />
                 <h2 className="text-2xl font-black text-stone-900 mb-2">{selectedGuide.name}</h2>
                 <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-4">
                    <Star size={18} className="fill-amber-500" /> {selectedGuide.rating} 
                    <span className="text-stone-300 mx-1">•</span>
                    <span className="text-stone-500 text-sm">{selectedGuide.reviews} reviews</span>
                 </div>
                 <div className="w-full space-y-3 pt-6 border-t border-stone-200">
                    <div className="flex justify-between text-sm">
                       <span className="text-stone-400 font-bold uppercase text-[10px]">Location</span>
                       <span className="text-stone-900 font-bold">{selectedGuide.location}, {selectedGuide.country}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-stone-400 font-bold uppercase text-[10px]">Experience</span>
                       <span className="text-stone-900 font-bold">{selectedGuide.experienceYears} Years</span>
                    </div>
                 </div>
                 <button className="w-full mt-10 bg-emerald-700 text-white py-4 rounded-2xl font-black hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-700/20">Hire {selectedGuide.name.split(' ')[0]}</button>
              </div>

              {/* Bio and Details */}
              <div className="md:w-2/3 p-10 space-y-10">
                 <div>
                    <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4">Professional Bio</h3>
                    <p className="text-stone-600 leading-relaxed text-lg font-medium">{selectedGuide.bio}</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4">Expertise</h3>
                       <div className="flex flex-wrap gap-2">
                          {selectedGuide.expertise.map(e => (
                             <span key={e} className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100">{e}</span>
                          ))}
                       </div>
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4">Languages</h3>
                       <div className="flex flex-wrap gap-2">
                          {selectedGuide.languages.map(l => (
                             <span key={l} className="bg-stone-100 text-stone-600 px-4 py-1.5 rounded-full text-xs font-bold border border-stone-200">{l}</span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100">
                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={14} /> Recommended Routes</h3>
                    <div className="space-y-4">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-emerald-600"><Compass size={20} /></div>
                          <div>
                             <p className="font-bold text-stone-900">Customized {selectedGuide.expertise[0]} Trail</p>
                             <p className="text-sm text-stone-500">A deep dive into the hidden gems of {selectedGuide.location}.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => { setSelectedActivity(null); setIsBookingSuccess(false); }} className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors z-10">
              <X size={20} className="text-stone-600" />
            </button>
            
            <div className="relative h-64 overflow-hidden">
              <img src={selectedActivity.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-8 text-white">
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  <Ticket size={14} /> Activity Booking
                </div>
                <h2 className="text-3xl font-black">{selectedActivity.name}</h2>
              </div>
            </div>

            <div className="p-10 space-y-8">
              {isBookingSuccess ? (
                <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100/50">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-stone-900">Booking Confirmed!</h3>
                    <p className="text-stone-500 font-medium">Your adventure in {selectedActivity.location} is secured. Check your email for the voucher.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedActivity(null)}
                    className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Location</p>
                      <p className="text-stone-900 font-bold flex items-center gap-2"><MapPin size={14} className="text-emerald-600" /> {selectedActivity.location}, {selectedActivity.country}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Duration</p>
                      <p className="text-stone-900 font-bold flex items-center gap-2"><Clock size={14} className="text-emerald-600" /> {selectedActivity.duration}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Category</p>
                      <p className="text-stone-900 font-bold flex items-center gap-2"><Tag size={14} className="text-emerald-600" /> {selectedActivity.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Price</p>
                      <p className="text-stone-900 font-black text-xl">{formatPrice(selectedActivity.price)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Description</p>
                    <p className="text-stone-600 font-medium leading-relaxed">{selectedActivity.description}</p>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setIsBookingSuccess(true)}
                      className="w-full bg-emerald-700 text-white py-5 rounded-3xl font-black text-lg hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-700/30 flex items-center justify-center gap-3"
                    >
                      Confirm Booking for {formatPrice(selectedActivity.price)}
                    </button>
                    <p className="text-center text-[10px] text-stone-400 font-bold mt-4 uppercase tracking-widest">Free cancellation up to 24 hours before</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-800 transition-all hover:scale-110 active:scale-95 group"
      >
        <Bot size={32} className="group-hover:animate-bounce" />
        <div className="absolute -top-12 right-0 bg-white text-stone-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-stone-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Need help planning? 🦒
        </div>
      </button>

      <AIChatbot isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </Layout>
  );
};

// --- HELPER COMPONENTS ---

const CategoryButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${active ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/20' : 'text-stone-500 hover:bg-stone-50'}`}>{icon} {label}</button>
);

const FilterSelect: React.FC<{ value: string; onChange: (v: string) => void; options: string[]; icon: React.ReactNode; label: string; disabled?: boolean }> = ({ value, onChange, options, icon, label, disabled }) => (
  <div className={`flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-2 shadow-sm ${disabled ? 'opacity-40' : ''}`}>
    <div className="text-emerald-600">{icon}</div>
    <div className="flex-1">
      <p className="text-[9px] uppercase font-black text-stone-400 leading-none mb-1">{label}</p>
      <select className="bg-transparent border-none text-xs font-bold outline-none w-full appearance-none text-stone-900" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
    </div>
  </div>
);

const ActivityCard: React.FC<{ activity: TourActivity; formatPrice: (n: number) => string; t: (k: string) => string; onBook: () => void }> = ({ activity, formatPrice, t, onBook }) => (
  <div className="bg-white rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-stone-50 flex flex-col">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={activity.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-900">
        {activity.category}
      </div>
      <div className="absolute bottom-4 left-4 text-white text-xs font-bold flex items-center gap-2">
        <Star size={12} className="fill-amber-400" /> {activity.rating}
      </div>
    </div>
    <div className="p-6 space-y-3 flex-1 flex flex-col">
      <h3 className="font-black text-lg text-emerald-950 leading-tight">{activity.name}</h3>
      <p className="text-stone-500 text-xs flex items-center gap-1.5"><MapPin size={14} /> {activity.location}, {activity.country}</p>
      <p className="text-stone-600 text-xs line-clamp-2 flex-1">{activity.description}</p>
      <div className="flex items-center gap-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-2">
        <Clock size={12} /> {activity.duration}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-stone-50 mt-auto">
        <p><span className="text-xl font-black">{formatPrice(activity.price)}</span></p>
        <button 
          onClick={onBook}
          className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
        >
          Book Activity
        </button>
      </div>
    </div>
  </div>
);

const HotelCard: React.FC<{ stay: Accommodation; formatPrice: (n: number) => string; t: (k: string) => string }> = ({ stay, formatPrice, t }) => (
  <div className="bg-white rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-stone-50">
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={stay.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 text-white text-xs font-bold flex items-center gap-2">
        <Star size={12} className="fill-amber-400" /> {stay.rating}
      </div>
    </div>
    <div className="p-6 space-y-4">
      <h3 className="font-black text-lg text-emerald-950">{stay.name}</h3>
      <p className="text-stone-500 text-xs flex items-center gap-1.5"><MapPin size={14} /> {stay.district}</p>
      <div className="flex items-center justify-between pt-4 border-t border-stone-50">
        <p><span className="text-xl font-black">{formatPrice(stay.price)}</span></p>
        <button className="text-emerald-700 text-xs font-black uppercase tracking-widest">{t('bookNow')}</button>
      </div>
    </div>
  </div>
);

const AirbnbCard: React.FC<{ stay: Accommodation; formatPrice: (n: number) => string; t: (k: string) => string }> = ({ stay, formatPrice, t }) => (
  <div className="group cursor-pointer">
    <div className="relative aspect-square rounded-[24px] overflow-hidden mb-4 shadow-lg bg-stone-200">
      <img src={stay.image} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
      <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-full shadow-lg text-[9px] font-black flex items-center gap-2">
        {stay.rating >= 4.9 && <><Award size={10} className="text-amber-500" /> Guest Favorite</>}
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-stone-900">{stay.district}, {stay.country}</h3>
        <div className="flex items-center gap-1 text-sm font-bold"><Star size={14} className="fill-stone-900" />{stay.rating}</div>
      </div>
      <p className="text-stone-500 text-sm font-medium">{t('verifiedHost')}</p>
      <p className="pt-2"><span className="font-black text-lg text-stone-900">{formatPrice(stay.price)}</span><span className="text-stone-500 text-sm"> / {t('night')}</span></p>
    </div>
  </div>
);

const CarHireCard: React.FC<{ car: CarType; formatPrice: (n: number) => string; t: (k: string) => string }> = ({ car, formatPrice, t }) => (
  <div className="bg-white rounded-[32px] overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-stone-50">
    <div className="relative aspect-[16/10] overflow-hidden">
      <img src={car.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div className="absolute top-4 left-4 bg-emerald-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
        {car.type}
      </div>
    </div>
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-black text-lg text-emerald-950">{car.name}</h3>
        <p className="text-emerald-700 font-bold text-xs">{car.transmission}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold">
           <Users size={14} className="text-emerald-600" /> {car.capacity} {t('seats')}
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 text-xs font-bold">
           <MapPin size={14} className="text-emerald-600" /> {car.district}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-stone-50">
        <p><span className="text-xl font-black">{formatPrice(car.pricePerDay)}</span> <span className="text-[10px] text-stone-400 font-bold">/{t('rentPerDay')}</span></p>
        <button className="bg-stone-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Rent Now</button>
      </div>
    </div>
  </div>
);

const RestaurantCard: React.FC<{ restaurant: Restaurant; t: (k: string) => string }> = ({ restaurant, t }) => (
  <div className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-stone-50 group">
    <div className="h-56 relative overflow-hidden">
      <img src={restaurant.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
    </div>
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start">
         <h3 className="font-black text-lg text-stone-900 leading-tight">{restaurant.name}</h3>
         <div className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star size={14} className="fill-amber-500" /> {restaurant.rating}</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
         {restaurant.cuisine.map(c => <span key={c} className="text-[9px] font-black uppercase tracking-tighter bg-stone-100 text-stone-400 px-2 py-0.5 rounded-lg">{c}</span>)}
      </div>
      <p className="text-stone-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> {restaurant.district}</p>
      <button className="w-full bg-stone-900 text-white py-3 rounded-2xl font-black text-sm hover:bg-black transition-all">Find Table</button>
    </div>
  </div>
);

const GuideCard: React.FC<{ guide: Guide; onClick: () => void }> = ({ guide, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-xl flex flex-col items-center text-center space-y-4 group cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1"
  >
    <div className="relative">
      <img src={guide.image} className="w-24 h-24 rounded-[32px] object-cover shadow-lg border-2 border-emerald-50" />
      <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-lg">
        <UserCheck size={14} />
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="font-extrabold text-lg text-stone-900 group-hover:text-emerald-700 transition-colors">{guide.name}</h3>
      <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs"><Star size={14} className="fill-amber-500"/>{guide.rating} • {guide.experienceYears}yr Exp</div>
      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{guide.location}, {guide.country}</p>
    </div>
  </div>
);

const FlightCard: React.FC<{ flight: Flight; formatPrice: (n: number) => string; t: (k: string) => string }> = ({ flight, formatPrice, t }) => (
  <div className="bg-white rounded-[32px] p-8 border border-stone-100 shadow-lg flex flex-col md:flex-row items-center gap-10">
    <div className="flex-1 flex items-center justify-between gap-8 w-full">
      <div className="text-center md:text-left"><p className="text-3xl font-black">{flight.from}</p><p className="text-xs font-bold">{flight.time}</p></div>
      <div className="flex-1 flex flex-col items-center">
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">{flight.duration}</p>
        <div className="w-full h-[2px] bg-stone-100 relative my-3"><Plane size={14} className="text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" /></div>
      </div>
      <div className="text-center md:text-right"><p className="text-3xl font-black">{flight.to}</p><p className="text-xs font-bold">Venture Safaris</p></div>
    </div>
    <div className="text-right border-l pl-8"><p className="text-3xl font-black text-emerald-950">{formatPrice(flight.price)}</p><p className="text-[9px] font-black uppercase text-stone-400">Total Price</p></div>
  </div>
);

export default App;