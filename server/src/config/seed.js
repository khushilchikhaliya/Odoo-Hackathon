const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  await db.initPromise;
  console.log('🌱 Initializing database with global cities & activity catalog...');

  // 1. Seed Users (Traveler Demo & Admin Demo)
  const passwordHash = bcrypt.hashSync('password123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(['demo@globetrotter.com']);
  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar_url, bio, currency, language, travel_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      1,
      'Alex Morgan',
      'demo@globetrotter.com',
      passwordHash,
      'user',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'Passionate world traveler, photographer, and coffee enthusiast. Always exploring new horizons.',
      'USD',
      'en',
      'Adventure & Culture'
    ]);
  }

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(['admin@globetrotter.com']);
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar_url, bio, currency, language, travel_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run([
      2,
      'Admin Leader',
      'admin@globetrotter.com',
      adminPasswordHash,
      'admin',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'GlobeTrotter Platform Administrator & Community Lead.',
      'USD',
      'en',
      'Luxury'
    ]);
  }

  // 2. Seed 12 Global World Cities
  const cities = [
    {
      id: 1,
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 98,
      description: 'The City of Light captivates with iconic architecture, haute cuisine, world-class art museums, and timeless romantic charm.',
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 165.0,
      currency: 'EUR',
      latitude: 48.8566,
      longitude: 2.3522
    },
    {
      id: 2,
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      cost_index: 4,
      popularity_score: 96,
      description: 'An exhilarating blend of neon skyscrapers, historic temples, culinary mastery, anime culture, and serene Zen gardens.',
      image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 140.0,
      currency: 'JPY',
      latitude: 35.6762,
      longitude: 139.6503
    },
    {
      id: 3,
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 95,
      description: 'The Eternal City brims with ancient ruins, Renaissance palaces, vibrant piazzas, and mouthwatering artisanal pasta & gelato.',
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 130.0,
      currency: 'EUR',
      latitude: 41.9028,
      longitude: 12.4964
    },
    {
      id: 4,
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      cost_index: 3,
      popularity_score: 94,
      description: 'Sun-drenched Mediterranean city celebrated for Gaudí’s whimsical architecture, lively tapas bars, and sandy city beaches.',
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 120.0,
      currency: 'EUR',
      latitude: 41.3851,
      longitude: 2.1734
    },
    {
      id: 5,
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      cost_index: 2,
      popularity_score: 93,
      description: 'Island of the Gods boasting emerald rice terraces, sacred sea temples, surf breaks, and tranquil wellness retreats.',
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 65.0,
      currency: 'IDR',
      latitude: -8.3405,
      longitude: 115.092
    },
    {
      id: 6,
      name: 'New York City',
      country: 'United States',
      region: 'North America',
      cost_index: 5,
      popularity_score: 97,
      description: 'The cultural epicenter featuring legendary Broadway shows, soaring skyscrapers, Central Park, and non-stop energy.',
      image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 220.0,
      currency: 'USD',
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      id: 7,
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa',
      cost_index: 2,
      popularity_score: 89,
      description: 'Dramatic coastal haven beneath Table Mountain, offering wine estates, penguin colonies, and scenic ocean drives.',
      image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 75.0,
      currency: 'ZAR',
      latitude: -33.9249,
      longitude: 18.4241
    },
    {
      id: 8,
      name: 'Bangkok',
      country: 'Thailand',
      region: 'Asia',
      cost_index: 1,
      popularity_score: 92,
      description: 'Vibrant street life, ornate golden shrines, bustling canal markets, and world-renowned street food delights.',
      image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 50.0,
      currency: 'THB',
      latitude: 13.7563,
      longitude: 100.5018
    },
    {
      id: 9,
      name: 'Sydney',
      country: 'Australia',
      region: 'Oceania',
      cost_index: 4,
      popularity_score: 91,
      description: 'Spectacular natural harbour, golden beaches, iconic Opera House sails, and outdoor coastal lifestyle.',
      image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 160.0,
      currency: 'AUD',
      latitude: -33.8688,
      longitude: 151.2093
    },
    {
      id: 10,
      name: 'Jaipur',
      country: 'India',
      region: 'Asia',
      cost_index: 1,
      popularity_score: 88,
      description: 'The Pink City of Rajasthan filled with majestic hill forts, royal palaces, colourful bazaars, and rich heritage.',
      image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 40.0,
      currency: 'INR',
      latitude: 26.9124,
      longitude: 75.7873
    },
    {
      id: 11,
      name: 'Dubai',
      country: 'United Arab Emirates',
      region: 'Middle East',
      cost_index: 5,
      popularity_score: 94,
      description: 'Ultra-modern oasis featuring Burj Khalifa, desert safaris, futuristic architecture, and luxury shopping.',
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 210.0,
      currency: 'AED',
      latitude: 25.2048,
      longitude: 55.2708
    },
    {
      id: 12,
      name: 'Amsterdam',
      country: 'Netherlands',
      region: 'Europe',
      cost_index: 4,
      popularity_score: 93,
      description: 'Charming canal networks, bicycle-friendly streets, historic gabled houses, and legendary art museums.',
      image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80',
      avg_daily_cost: 150.0,
      currency: 'EUR',
      latitude: 52.3676,
      longitude: 4.9041
    }
  ];

  for (const city of cities) {
    const existing = db.prepare('SELECT id FROM cities WHERE id = ?').get([city.id]);
    if (!existing) {
      db.prepare(`
        INSERT INTO cities (id, name, country, region, cost_index, popularity_score, description, image_url, avg_daily_cost, currency, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        city.id, city.name, city.country, city.region, city.cost_index,
        city.popularity_score, city.description, city.image_url,
        city.avg_daily_cost, city.currency, city.latitude, city.longitude
      ]);
    }
  }

  // 3. Seed City Activities Catalog
  const activities = [
    // Paris Activities
    {
      id: 1,
      city_id: 1,
      name: 'Eiffel Tower Sunset Summit Access',
      description: 'Ascend to the top deck of the iron lady for breathtaking 360-degree twilight vistas over Paris.',
      category: 'Sightseeing',
      cost: 35.0,
      duration_hours: 2.5,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
      location_address: 'Champ de Mars, 5 Av. Anatole France'
    },
    {
      id: 2,
      city_id: 1,
      name: 'Louvre Museum Masterpieces Guided Tour',
      description: 'Skip-the-line access to marvel at the Mona Lisa, Venus de Milo, and Winged Victory with an art historian.',
      category: 'Culture',
      cost: 45.0,
      duration_hours: 3.0,
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=600&q=80',
      location_address: 'Rue de Rivoli, 75001 Paris'
    },
    {
      id: 3,
      city_id: 1,
      name: 'Montmartre Artisanal Pastry & Bakery Walk',
      description: 'Taste authentic warm croissants, macarons, and éclairs through the bohemian cobblestone alleys.',
      category: 'Food & Dining',
      cost: 55.0,
      duration_hours: 2.5,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      location_address: 'Place du Tertre, Montmartre'
    },
    {
      id: 4,
      city_id: 1,
      name: 'Seine River Evening Wine & Champagne Cruise',
      description: 'Glide past illuminated monuments while sipping French vintages with live acoustic music.',
      category: 'Nightlife',
      cost: 40.0,
      duration_hours: 1.5,
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      location_address: 'Port de la Bourdonnais'
    },

    // Tokyo Activities
    {
      id: 5,
      city_id: 2,
      name: 'Shibuya Crossing & Secret Rooftop View',
      description: 'Experience the world-famous pedestrian scramble and capture the neon maze from a sky observation lounge.',
      category: 'Sightseeing',
      cost: 20.0,
      duration_hours: 1.5,
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      location_address: 'Shibuya Scramble Square'
    },
    {
      id: 6,
      city_id: 2,
      name: 'Tsukiji Outer Market Gourmet Food Crawl',
      description: 'Savor fresh fatty tuna sashimi, wagyu skewers, tamagoyaki, and matcha delicacies.',
      category: 'Food & Dining',
      cost: 60.0,
      duration_hours: 3.0,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
      location_address: 'Tsukiji, Chuo City'
    },
    {
      id: 7,
      city_id: 2,
      name: 'Senso-ji Asakusa & Kimono Experience',
      description: 'Wear traditional kimono attire while discovering Tokyo’s oldest Buddhist sanctuary.',
      category: 'Culture',
      cost: 35.0,
      duration_hours: 2.5,
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      location_address: 'Asakusa, Taito City'
    },
    {
      id: 8,
      city_id: 2,
      name: 'Akihabara VR Arcade & Retro Gaming Night',
      description: 'Immerse into Japan’s electric paradise with retro arcades and cutting-edge VR simulations.',
      category: 'Adventure',
      cost: 30.0,
      duration_hours: 2.0,
      rating: 4.6,
      image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      location_address: 'Akihabara Electric Town'
    },

    // Rome Activities
    {
      id: 9,
      city_id: 3,
      name: 'Colosseum Gladiator Arena & Roman Forum',
      description: 'Walk on the reconstructed arena floor and explore the ruins where ancient Roman emperors ruled.',
      category: 'Sightseeing',
      cost: 42.0,
      duration_hours: 3.0,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
      location_address: 'Piazza del Colosseo, 1'
    },
    {
      id: 10,
      city_id: 3,
      name: 'Trastevere Sunset Food & Natural Wine Tour',
      description: 'Wander lively ivy-covered streets tasting carbonara, suppli, pecorino cheese, and Tuscan wines.',
      category: 'Food & Dining',
      cost: 65.0,
      duration_hours: 3.5,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80',
      location_address: 'Piazza Santa Maria in Trastevere'
    },
    {
      id: 11,
      city_id: 3,
      name: 'Vatican Museums & Sistine Chapel VIP Entry',
      description: 'Admire Michelangelo’s legendary frescoes in early morning tranquility.',
      category: 'Culture',
      cost: 55.0,
      duration_hours: 3.0,
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1548625361-195f24ec4ca5?auto=format&fit=crop&w=600&q=80',
      location_address: 'Viale Vaticano, 00165'
    },

    // Barcelona Activities
    {
      id: 12,
      city_id: 4,
      name: 'Sagrada Familia Tower Access & Audio Guide',
      description: 'Explore Antoni Gaudí’s uncompleted architectural masterpiece with kaleidoscopic stained glass light.',
      category: 'Sightseeing',
      cost: 38.0,
      duration_hours: 2.0,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80',
      location_address: 'C/ de Mallorca, 401'
    },
    {
      id: 13,
      city_id: 4,
      name: 'Park Güell Express Morning Walk',
      description: 'Marvel at colorful mosaic salamanders and panoramic city views in Gaudí’s fairy-tale park.',
      category: 'Sightseeing',
      cost: 15.0,
      duration_hours: 2.0,
      rating: 4.7,
      image_url: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?auto=format&fit=crop&w=600&q=80',
      location_address: 'Gràcia, 08024 Barcelona'
    },
    {
      id: 14,
      city_id: 4,
      name: 'El Born Tapas Crawl & Flamenco Evening',
      description: 'Enjoy traditional Iberian ham, patatas bravas, and sangria followed by an emotional live flamenco show.',
      category: 'Nightlife',
      cost: 50.0,
      duration_hours: 3.0,
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      location_address: 'El Born, Ciutat Vella'
    },

    // Bali Activities
    {
      id: 15,
      city_id: 5,
      name: 'Ubud Tegallalang Rice Terrace & Jungle Swing',
      description: 'Soar over lush tropical ravines on an exhilarating swing and hike scenic green terrace paths.',
      category: 'Adventure',
      cost: 25.0,
      duration_hours: 3.0,
      rating: 4.8,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      location_address: 'Tegallalang, Gianyar, Ubud'
    },
    {
      id: 16,
      city_id: 5,
      name: 'Mount Batur Sunrise Volcano Trek & Hot Springs',
      description: 'Early morning hike to witness sunrise above the clouds, followed by relaxing natural volcanic hot springs.',
      category: 'Adventure',
      cost: 45.0,
      duration_hours: 6.0,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80',
      location_address: 'Kintamani, Bangli'
    },
    {
      id: 17,
      city_id: 5,
      name: 'Traditional Balinese Cooking Class in Organic Farm',
      description: 'Harvest organic spices and prepare traditional Nasi Goreng and Sate Lilit with a local family.',
      category: 'Food & Dining',
      cost: 30.0,
      duration_hours: 4.0,
      rating: 4.9,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      location_address: 'Payangan, Ubud'
    }
  ];

  for (const act of activities) {
    const existing = db.prepare('SELECT id FROM city_activities WHERE id = ?').get([act.id]);
    if (!existing) {
      db.prepare(`
        INSERT INTO city_activities (id, city_id, name, description, category, cost, duration_hours, rating, image_url, location_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        act.id, act.city_id, act.name, act.description, act.category,
        act.cost, act.duration_hours, act.rating, act.image_url, act.location_address
      ]);
    }
  }

  // Activity log for initial setup
  db.prepare('INSERT INTO activity_logs (user_id, action_type, description) VALUES (?, ?, ?)')
    .run([2, 'SYSTEM_INIT', 'System initialized with global destination catalog. Clean slate for new user trips.']);

  console.log('✅ Database successfully initialized (0 initial trips, full catalog ready)!');
}

if (require.main === module) {
  seedDatabase().catch(err => console.error('Seed error:', err));
}

module.exports = seedDatabase;
