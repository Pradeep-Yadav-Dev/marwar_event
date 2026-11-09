# Marwar Event — Saved Dummy & Reference Data (`notes.md`)

This file preserves all dummy/sample data removed from the live website and admin panel so you can reference, copy, or re-seed any content in the future.

---

## 1. Categories Dummy Data (`initialCategories` / `FALLBACK_CATEGORIES`)

```ts
export const savedCategories = [
  {
    id: 1,
    name: "Wedding",
    slug: "wedding",
    hindi: "शादी व विवाह",
    description:
      "Shaadi, Sangeet, Haldi, Mehndi & Sagai ceremonies staged in royal heritage palaces.",
    image: "/assets/service-wedding-DdBkBope.jpg",
    status: "active",
  },
  {
    id: 2,
    name: "Family",
    slug: "family",
    hindi: "पारिवारिक उत्सव",
    description:
      "Birthday soirées, Godh Bharai, silver & golden anniversaries, and joyous family gatherings.",
    image: "/assets/service-birthday-BpYNsBYk.jpg",
    status: "active",
  },
  {
    id: 3,
    name: "Milestones",
    slug: "milestones",
    hindi: "सम्मान व विदाई",
    description:
      "Retirements, lifetime achievement durbars, Griha Pravesh, and sacred Vedic ceremonies.",
    image: "/assets/service-retirement-XJ43dCl-.jpg",
    status: "active",
  },
  {
    id: 4,
    name: "Corporate",
    slug: "corporate",
    hindi: "कॉर्पोरेट समारोह",
    description:
      "Conferences, executive retreats, award nights, and product launches with royal hospitality.",
    image: "/assets/service-corporate-B-bMIGXO.jpg",
    status: "active",
  },
];
```

---

## 2. Homepage — "Celebrations We Craft" Services (`app/page.tsx`)

```ts
export const homepageServices = [
  {
    image: "/assets/service-wedding-DdBkBope.jpg",
    title: "Shaadi & Vivaah",
    description:
      "Palace weddings with royal baraats, grand mandaps and traditions honoured to the last ritual.",
  },
  {
    image: "/assets/service-sangeet-PuIPsslO.jpg",
    title: "Sangeet & Mehndi",
    description:
      "Dhol-filled nights, floral swings and folk artists that keep the whole family dancing.",
  },
  {
    image: "/assets/service-birthday-BpYNsBYk.jpg",
    title: "Birthday Soirées",
    description:
      "Themed royal parties with lavish decor, desserts and entertainment for every age.",
  },
  {
    image: "/assets/service-retirement-XJ43dCl-.jpg",
    title: "Retirement & Farewells",
    description:
      "Dignified banquets that honour a lifetime of service with warmth and royal grace.",
  },
  {
    image: "/assets/service-corporate-B-bMIGXO.jpg",
    title: "Corporate Galas",
    description:
      "Conferences, award nights and offsites staged in heritage venues with flawless polish.",
  },
  {
    image: "/assets/service-anniversary-D8I_Fgl8.jpg",
    title: "Anniversaries",
    description:
      "Candlelit courtyards, rose-petal pathways and intimate celebrations of enduring love.",
  },
];
```

---

## 3. Homepage — Hero Stats & "The Marwar Signature" Pillars (`app/page.tsx`)

```ts
export const homepageStats = [
  { value: "500+", label: "Events Crafted" },
  { value: "12+", label: "Years of Legacy" },
  { value: "40+", label: "Palace Venues" },
];

export const homepageSignaturePillars = [
  {
    icon: "Landmark",
    num: "01",
    hindi: "शाही महल",
    title: "Royal Venues",
    tag: "40+ Palaces & Forts",
    text: "Palaces, havelis, forts and heritage resorts — handpicked across Jodhpur, Udaipur, Jaipur and Jaisalmer.",
  },
  {
    icon: "Flower2",
    num: "02",
    hindi: "राजसी सजावट",
    title: "Royal Decor",
    tag: "In-House Atelier",
    text: "Marigold curtains, carved jharokha stages, brass urlis and bespoke royal themes crafted in-house.",
  },
  {
    icon: "UtensilsCrossed",
    num: "03",
    hindi: "मारवाड़ी रसोई",
    title: "Royal Rasoi",
    tag: "Silver Thali Manuhaar",
    text: "Authentic Marwari delicacies and global gourmet feasts served with legendary Rajasthani manuhaar.",
  },
  {
    icon: "Camera",
    num: "04",
    hindi: "शाही यादें",
    title: "Cinematic Memories",
    tag: "Editorial & Drone Films",
    text: "Fine-art photography and heritage documentary films that capture every ritual in timeless splendour.",
  },
  {
    icon: "Music",
    num: "05",
    hindi: "लोक संगीत",
    title: "Folk & Festivity",
    tag: "Manganiyar & Ghoomar",
    text: "State-honoured Manganiyar ensembles, royal dhol troupes, Kalbelia dancers and celebrity sangeet DJs.",
  },
  {
    icon: "HeartHandshake",
    num: "06",
    hindi: "अतिथि सत्कार",
    title: "Guest Hospitality",
    tag: "24×7 Royal Concierge",
    text: "Safa welcomes, vintage car convoys, luxury stays and personalised concierge care for every guest.",
  },
];
```

---

## 4. Homepage — "Memoirs of Royal Hospitality" Testimonials (`app/page.tsx`)

```ts
export const homepageMemoirs = [
  {
    initials: "RS",
    bg: "#fde2e4",
    text: "#5c1624",
    name: "Ranvijay Singh Rathore",
    meta: "Royal Wedding • Mehrangarh, Jodhpur",
    quote:
      "Our daughter’s wedding at Mehrangarh Fort felt straight out of an imperial folktale. The Vedic Agni rituals, the Shehnai welcome at the Pol gates, and the royal silver thali manuhaar left 800 international dignitaries spellbound.",
  },
  {
    initials: "MK",
    bg: "#fde6b8",
    text: "#4a2c0a",
    name: "Dr. Meenakshi Kasliwal",
    meta: "Lifetime Honor Durbar • Ajit Bhawan",
    quote:
      "My father’s 75th Amrit Mahotsav & Civic Honor Durbar was managed with breathtaking reverence. From the Safa ceremony to the retrospective documentary on water-screen projection, every elder wept tears of pure joy.",
  },
  {
    initials: "GS",
    bg: "#cdece6",
    text: "#0f3d36",
    name: "Ghanshyamdas Somani",
    meta: "Anant Chaturdashi Maha-Utsav • Jodhpur",
    quote:
      "The Anant Chaturdashi and Ganesh Visarjan lakefront Maha-Aarti on Kaylana lake was transcendent. Managing 1,200 devotees with pristine Vedic order, floral boats, and satvik cuisine was nothing short of divine.",
  },
  {
    initials: "VR",
    bg: "#e6dffb",
    text: "#351b66",
    name: "Maharajkumar Vikramaditya",
    meta: "Sangeet & Royal Banquet • Umaid Bhawan",
    quote:
      "From the 40-artist Manganiyar ensemble under starlit courtyards to the bespoke heritage hospitality for our overseas guests, Marwar Event orchestrated every moment with regal precision and warmth.",
  },
];
```

---

## 5. Homepage — "From Instagram" Reels (`app/page.tsx`)

```ts
export const homepageReels = [
  {
    image: "/assets/service-wedding-DdBkBope.jpg",
    title: "Royal Palace Baraat & Fireworks",
    location: "Umaid Bhawan, Jodhpur",
    views: "48.2K",
    likes: "4.1K",
    url: "https://instagram.com/marwarevent",
  },
  {
    image: "/assets/service-sangeet-PuIPsslO.jpg",
    title: "Manganiyar Folk & Sangeet Night",
    location: "Mehrangarh Courtyard",
    views: "36.5K",
    likes: "3.4K",
    url: "https://instagram.com/marwarevent",
  },
  {
    image: "/assets/service-anniversary-D8I_Fgl8.jpg",
    title: "Candlelit Courtyard Celebration",
    location: "Lake Pichola, Udaipur",
    views: "29.8K",
    likes: "2.9K",
    url: "https://instagram.com/marwarevent",
  },
  {
    image: "/assets/service-corporate-B-bMIGXO.jpg",
    title: "Grand Heritage Gala Evening",
    location: "Rambagh Lawns, Jaipur",
    views: "24.1K",
    likes: "2.2K",
    url: "https://instagram.com/marwarevent",
  },
];
```

---

## 6. Services Page — All 14 Celebrations (`app/services/page.tsx`)

```ts
export const servicesPageCategories = [
  { id: "all", label: "All Events" },
  { id: "wedding", label: "Weddings" },
  { id: "family", label: "Family & Milestones" },
  { id: "rituals", label: "Traditional Rites" },
  { id: "corporate", label: "Corporate" },
];

export const allServicesCatalog = [
  {
    icon: "Crown",
    title: "Shaadi & Vivaah",
    hindi: "शादी विवाह",
    image: "/assets/service-wedding-DdBkBope.jpg",
    description:
      "Grand palace weddings — royal baraats, majestic mandaps, marigold arches and every ritual honoured to the last phera.",
    tags: ["Palace Mandap", "Royal Baraat", "Marwari Rasoi"],
    category: "wedding",
  },
  {
    icon: "Music",
    title: "Sangeet & Mehndi Night",
    hindi: "संगीत मेहंदी",
    image: "/assets/service-sangeet-PuIPsslO.jpg",
    description:
      "Dhol-filled evenings, floral swings, Manganiyar folk singers and dance floors that keep the whole family on their feet.",
    tags: ["Manganiyar Folk", "Floral Jhoola", "Concert Sound"],
    category: "wedding",
  },
  {
    icon: "Sparkles",
    title: "Haldi & Mayian",
    hindi: "हल्दी मययन",
    image: "/assets/service-wedding-DdBkBope.jpg",
    description:
      "Golden-yellow courtyards, traditional geet and playful ceremonies staged with authentic Marwari rituals.",
    tags: ["Marigold Courtyard", "Folk Geet", "Brass Urli Setup"],
    category: "wedding",
  },
  {
    icon: "Gem",
    title: "Sagai & Ring Ceremony",
    hindi: "सगाई",
    image: "/assets/service-anniversary-D8I_Fgl8.jpg",
    description:
      "Intimate engagement evenings with jewelled decor, bespoke stages and a celebration that marks the first promise.",
    tags: ["Jharokha Stage", "Tilak & Thaal", "Gala Dinner"],
    category: "wedding",
  },
  {
    icon: "Cake",
    title: "Birthday Soirées",
    hindi: "जन्मदिन",
    image: "/assets/service-birthday-BpYNsBYk.jpg",
    description:
      "Themed royal parties for every age — lavish decor, dessert tables, live entertainment and cake ceremonies.",
    tags: ["Bespoke Themes", "Royal Dessert Bar", "Live Acts"],
    category: "family",
  },
  {
    icon: "Baby",
    title: "Godh Bharai & Baby Shower",
    hindi: "गोद भराई",
    image: "/assets/service-sangeet-PuIPsslO.jpg",
    description:
      "A blessing-filled celebration for the mother-to-be — floral thrones, traditional songs and joyful family rituals.",
    tags: ["Floral Throne", "Bangle Ceremony", "Traditional Geet"],
    category: "family",
  },
  {
    icon: "Smile",
    title: "Mundan Sanskar",
    hindi: "मुंडन संस्कार",
    image: "/assets/hero-palace-D_WyR0gy.jpg",
    description:
      "The first head-shaving ceremony staged with purity and grace — temple-style mandaps and priest-arranged rituals.",
    tags: ["Vedic Pandits", "Temple Mandap", "Satvik Bhoj"],
    category: "rituals",
  },
  {
    icon: "Heart",
    title: "Anniversaries",
    hindi: "वर्षगांठ",
    image: "/assets/service-anniversary-D8I_Fgl8.jpg",
    description:
      "Candlelit courtyards, rose-petal pathways and renewed vows — celebrating love that grows richer each year.",
    tags: ["Candlelit Courtyard", "Sufi Violin", "Private Fireworks"],
    category: "family",
  },
  {
    icon: "Award",
    title: "Retirement & Farewells",
    hindi: "विदाई समारोह",
    image: "/assets/service-retirement-XJ43dCl-.jpg",
    description:
      "Dignified banquets honouring a lifetime of service — tribute films, garland ceremonies and warm speeches.",
    tags: ["Safa & Shawl Honor", "Tribute Film", "Royal Banquet"],
    category: "family",
  },
  {
    icon: "Flame",
    title: "Chaudash & Traditional Rites",
    hindi: "चौदश संस्कार",
    image: "/assets/service-retirement-XJ43dCl-.jpg",
    description:
      "Marwari ceremonies observed with full tradition — panchak, chaudash and sankalp feasts arranged with reverence and care.",
    tags: ["Vedic Rituals", "Dignified Seating", "Traditional Rasoi"],
    category: "rituals",
  },
  {
    icon: "Home",
    title: "Griha Pravesh",
    hindi: "गृह प्रवेश",
    image: "/assets/hero-palace-D_WyR0gy.jpg",
    description:
      "Auspicious housewarming ceremonies — kalash pooja, threshold decor and a feast to bless the new home.",
    tags: ["Kalash Pooja", "Fresh Toran Decor", "Auspicious Bhoj"],
    category: "rituals",
  },
  {
    icon: "Bell",
    title: "Jagran & Bhajan Sandhya",
    hindi: "जागरण भजन",
    image: "/assets/service-sangeet-PuIPsslO.jpg",
    description:
      "Devotional nights with Mata ki Chowki, live bhajan mandlis and beautifully lit stages for the entire community.",
    tags: ["Darbar Stage", "Bhajan Mandli", "Prasad Counter"],
    category: "rituals",
  },
  {
    icon: "Briefcase",
    title: "Corporate Galas",
    hindi: "कॉर्पोरेट जलसा",
    image: "/assets/service-corporate-B-bMIGXO.jpg",
    description:
      "Conferences, award nights and annual days staged in heritage venues with flawless AV, staging and hospitality.",
    tags: ["LED Stage", "VIP Protocol", "Heritage Gala"],
    category: "corporate",
  },
  {
    icon: "Users",
    title: "Corporate Offsites & Meets",
    hindi: "टीम मीट",
    image: "/assets/service-corporate-B-bMIGXO.jpg",
    description:
      "Team retreats and dealer meets in palaces and resorts — travel, stay, activities and banquets, all handled.",
    tags: ["Palace Stay", "Chauffeur Fleet", "Desert Experiences"],
    category: "corporate",
  },
];
```

---

## 7. Backend Seed & Detail Services (`server/src/lib/seedData.ts` & `app/services/[slug]/page.tsx`)

```ts
export const initialServices = [
  {
    id: 1,
    title: "Royal Destination Weddings",
    slug: "royal-destination-weddings",
    category: "Wedding",
    price: "₹3,50,000 Onwards",
    shortDesc:
      "Experience grandeur in heritage palaces and forts of Rajasthan with bespoke royal wedding planning.",
    description:
      "From palace booking to grand baraat with royal elephants, traditional shehnai, exquisite royal mandap setup, and gourmet Marwari culinary banquets. We handle end-to-end wedding logistics, hospitality, decor, artist bookings, and guest concierge.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    icon: "Crown",
    features: JSON.stringify([
      "Heritage Palace Venue Booking",
      "Royal Theme Decor & Lighting",
      "Celebrity Artist & Folk Performances",
      "Royal Guest Concierge & Fleet",
      "Bespoke Royal Dining Menu",
    ]),
    isPopular: true,
    status: "active",
    metaTitle: "Royal Destination Weddings in Rajasthan | Marwar Events",
    metaDesc:
      "Plan your dream royal palace wedding in Jodhpur, Udaipur, or Jaipur with Marwar Events.",
  },
  {
    id: 2,
    title: "Corporate Galas & Summits",
    slug: "corporate-galas-summits",
    category: "Corporate",
    price: "₹1,50,000 Onwards",
    shortDesc:
      "Sophisticated corporate conferences, award ceremonies, leadership retreats, and product launches.",
    description:
      "Flawless corporate event execution with state-of-the-art audiovisual setups, simultaneous translation, stage architecture, VIP protocol, and curated networking dinners.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    icon: "Briefcase",
    features: JSON.stringify([
      "High-tech AV & LED Walls",
      "Branding & Stage Production",
      "VIP Hospitality & Logistics",
      "Hybrid Streaming Facilities",
    ]),
    isPopular: false,
    status: "active",
    metaTitle: "Corporate Event Planners Rajasthan | Marwar Events",
    metaDesc:
      "Premier corporate retreats, award shows, and summit management in Rajasthan.",
  },
  {
    id: 3,
    title: "Desert Safari & Luxury Dune Camping",
    slug: "desert-safari-luxury-camping",
    category: "Experience",
    price: "₹75,000 Onwards",
    shortDesc:
      "Exclusive Thar desert events with Swiss tents, candlelit sand dunes, and authentic Rajasthani folk artists.",
    description:
      "An unforgettable Arabian Nights experience right in Osian & Jaisalmer dunes. Sunset camel treks, dune bashing in 4x4s, live Kalbelia dance, soulful Manganiyar music by bonfire, and royal starlit dining.",
    image:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    icon: "Flame",
    features: JSON.stringify([
      "Royal Luxury Swiss Tents",
      "Folk Dance & Fire Acts",
      "Sunset Camel Caravan",
      "Bonfire Royal Barbecue",
    ]),
    isPopular: true,
    status: "active",
    metaTitle: "Desert Safari Events & Luxury Camping | Marwar Events",
    metaDesc:
      "Exclusive luxury desert camping and theme night experiences in Rajasthan.",
  },
  {
    id: 4,
    title: "Heritage Decor & Floral Styling",
    slug: "heritage-decor-floral-styling",
    category: "Decor",
    price: "₹1,20,000 Onwards",
    shortDesc:
      "Bespoke floral architecture, vintage Rajasthani textiles, fairy lights, and grand entrance installations.",
    description:
      "Immersive aesthetic designs blending authentic heritage motifs with modern contemporary elegance. Exotic floral arches, handcrafted brass lanterns, mirror work canopies, and mesmerizing lighting ambiance.",
    image:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
    icon: "Sparkles",
    features: JSON.stringify([
      "Fresh Imported Floral Installations",
      "Custom Mandap & Stage Styling",
      "Acoustic Lighting & Chandeliers",
      "Handcrafted Traditional Decor Props",
    ]),
    isPopular: false,
    status: "active",
    metaTitle: "Luxury Event Decor & Floral Design | Marwar Events",
    metaDesc:
      "Exquisite wedding decor, floral installations, and thematic styling in Rajasthan.",
  },
  {
    id: 5,
    title: "Folk Artists & Entertainment",
    slug: "folk-artists-entertainment",
    category: "Entertainment",
    price: "₹50,000 Onwards",
    shortDesc:
      "Live symphony of Langas, Manganiyars, Ghoomar dancers, Sufi vocalists, and DJ entertainment.",
    description:
      "Elevate your celebrations with India's most celebrated folk masters, international DJ artists, laser light choreographies, and celebrity performers.",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    icon: "Music",
    features: JSON.stringify([
      "Langa & Manganiyar Troupe",
      "Chari & Kalbelia Dancers",
      "Bollywood DJs & Sound Reinforcement",
      "Puppet Shows & Welcome Troupes",
    ]),
    isPopular: false,
    status: "active",
    metaTitle: "Folk Artists & Entertainment Management | Marwar Events",
    metaDesc:
      "Book renowned Rajasthani folk artists, Sufi singers, and entertainment for weddings and events.",
  },
];
```

---

## 8. Sample Inquiries (`initialInquiries` / `makeFallbackInquiries`)

```ts
export const initialInquiries = [
  {
    id: 1,
    name: "Vikramaditya Rathore",
    email: "vikram.rathore@example.com",
    phone: "+91 98290 12345",
    serviceId: 1,
    serviceName: "Royal Destination Weddings",
    eventDate: "2026-12-18",
    guestCount: "350 Guests",
    budget: "₹25,00,000",
    message:
      "Planning a destination royal wedding in Umaid Bhawan / Mehrangarh area. Need full event management, decor, catering and artist lineup.",
    status: "PENDING",
    notes: "Followed up via WhatsApp. Client requested palace availability quotes.",
  },
  {
    id: 2,
    name: "Sneha Shekhawat",
    email: "sneha.s@techcorp.in",
    phone: "+91 99887 66554",
    serviceId: 2,
    serviceName: "Corporate Galas & Summits",
    eventDate: "2026-11-25",
    guestCount: "120 Guests",
    budget: "₹8,00,000",
    message:
      "Annual leadership summit and awards gala in Jodhpur. Need complete AV setup, stage, and networking dinner.",
    status: "CONFIRMED",
    notes: "Contract signed, 20% advance received.",
  },
  {
    id: 3,
    name: "Rajesh & Ananya Verma",
    email: "ananya.verma@gmail.com",
    phone: "+91 91234 56789",
    serviceId: 3,
    serviceName: "Desert Safari & Luxury Dune Camping",
    eventDate: "2027-01-10",
    guestCount: "50 Guests",
    budget: "₹4,50,000",
    message:
      "Silver anniversary celebration at Osian dunes with luxury Swiss tents and bonfire dinner.",
    status: "CONTACTED",
    notes: "Sent desert tent layout and menu options.",
  },
];
```

---

## 9. Admin Panel — Reviews (`app/service/admin/page.tsx`)

```ts
export const adminSampleReviews = [
  {
    name: "Maharaja Vikramaditya Rathore",
    event: "Royal Destination Wedding, Jodhpur",
    rating: 5,
    text: "The royal mandap at Mehrangarh and the traditional Manganiyar welcome surpassed our expectations. Marwar Event executed every ritual flawlessly.",
  },
  {
    name: "Sneha Shekhawat",
    event: "Annual Corporate Gala, Jaipur",
    rating: 5,
    text: "Flawless staging, crisp sound reinforcement, and pristine Rajasthani hospitality. Our international delegates were completely mesmerized.",
  },
];
```

---

## 10. Inquiry Form — Service Options (`components/InquiryForm.tsx`)

```ts
export const savedServiceOptions = [
  { value: "Shaadi & Vivaah", label: "Shaadi & Vivaah (Royal Wedding)" },
  { value: "Sangeet & Mehndi", label: "Sangeet & Mehndi Night" },
  { value: "Haldi & Mayian", label: "Haldi & Mayian" },
  { value: "Sagai & Ring Ceremony", label: "Sagai & Ring Ceremony" },
  { value: "Birthday Soirées", label: "Birthday Soirées" },
  { value: "Godh Bharai & Baby Shower", label: "Godh Bharai & Baby Shower" },
  { value: "Mundan Sanskar", label: "Mundan Sanskar" },
  { value: "Anniversaries", label: "Anniversaries & Vows" },
  { value: "Retirement & Farewells", label: "Retirement & Farewells" },
  {
    value: "Chaudash & Traditional Rites",
    label: "Chaudash & Traditional Rites",
  },
  { value: "Griha Pravesh", label: "Griha Pravesh" },
  { value: "Jagran & Bhajan Sandhya", label: "Jagran & Bhajan Sandhya" },
  { value: "Corporate Galas", label: "Corporate Galas & Offsites" },
  { value: "Corporate Offsites & Meets", label: "Corporate Offsites & Meets" },
];
```

