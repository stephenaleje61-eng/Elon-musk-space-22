import { ContentItem, SectionMeta, VehicleComparisonSpec, SpaceLaunchItem, StarlinkCountry, StockMetric } from '../types';

export const SECTIONS: SectionMeta[] = [
  {
    id: 'tesla-clean-energy',
    title: 'Tesla Vehicles & Clean Energy',
    shortTitle: 'Tesla & Energy',
    tagline: 'Sustainable Energy, Autonomous Mobility & High-Performance Electric Vehicles',
    description: 'Explore the full spectrum of electric passenger vehicles, commercial heavy transport, residential Powerwall energy storage, commercial Megapack battery solutions, and solar installations.',
    officialUrl: 'https://www.tesla.com',
    officialName: 'Tesla Official Website',
    bannerImage: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#E82127',
    categories: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Tesla Semi', 'Charging Equipment', 'Powerwall & Megapack', 'Solar Energy', 'Vehicle Accessories']
  },
  {
    id: 'robots-robotics',
    title: 'Robots & Robotics',
    shortTitle: 'Optimus & Robotics',
    tagline: 'General Purpose Bipedal Humanoid Robots & Next-Generation Automation',
    description: 'From factory floor assembly to household assistance, explore Tesla Optimus humanoid robotics, actuator engineering, neural perception models, and the evolution of autonomous mechanical labor.',
    officialUrl: 'https://www.tesla.com/AI',
    officialName: 'Tesla AI & Robotics',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#1677FF',
    categories: ['Tesla Optimus', 'Humanoid Hardware', 'Actuators & Sensors', 'Industrial Automation', 'Perception Networks', 'Development Milestones']
  },
  {
    id: 'space-rockets',
    title: 'Space Exploration & Rockets',
    shortTitle: 'SpaceX Rockets',
    tagline: 'Making Humanity Multiplanetary with Rapidly Reusable Launch Systems',
    description: 'Track orbital rocket systems including Falcon 9, Falcon Heavy, and the Starship fully reusable transport system. Verified launch schedules, spacecraft payloads, and Mars architecture.',
    officialUrl: 'https://www.spacex.com',
    officialName: 'SpaceX Official',
    bannerImage: 'https://images.unsplash.com/photo-1517976487507-5b3b11329241?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#005288',
    categories: ['Falcon 9', 'Falcon Heavy', 'Starship Super Heavy', 'Dragon Spacecraft', 'Launch Missions', 'Mechazilla & Recovery', 'Deep Space Exploration']
  },
  {
    id: 'starlink-internet',
    title: 'Starlink & Satellite Internet',
    shortTitle: 'Starlink Constellation',
    tagline: 'Low-Latency High-Speed Broadband from Low Earth Orbit Across the Globe',
    description: 'Global satellite constellation delivering gigabit-class low-latency internet to homes, enterprises, maritime fleets, and aircraft. Interactive country coverage, hardware specs, and ground terminals.',
    officialUrl: 'https://www.starlink.com',
    officialName: 'Starlink Official',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#006699',
    categories: ['Residential', 'Starlink Mini', 'Business & Enterprise', 'Maritime & Mobility', 'Hardware Terminals', 'Coverage & Latency', 'Direct-to-Cell']
  },
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence & xAI',
    shortTitle: 'xAI & Grok',
    tagline: 'Advancing Truth-Seeking AI Models & Massive Supercomputing Infrastructure',
    description: 'Discover xAI frontier models like Grok, real-time multimodal understanding, the 100,000+ liquid-cooled H100 Memphis Colossus supercomputer, and AI alignment research.',
    officialUrl: 'https://x.ai',
    officialName: 'xAI Official Research',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#2563EB',
    categories: ['Grok Models', 'Colossus Supercomputer', 'xAI Research Papers', 'AI Safety & Alignment', 'Developer API', 'Multimodal Vision & Voice']
  },
  {
    id: 'neuralink-brain-tech',
    title: 'Neuralink & Brain Technology',
    shortTitle: 'Neuralink BCI',
    tagline: 'High-Bandwidth Brain-Computer Interfaces to Restore Autonomy and Sight',
    description: 'Explore the fully implantable wireless N1 brain chip, ultra-fine micron-scale threads, R1 robotic surgical implantation system, and PRIME study clinical trials for paralyzed individuals.',
    officialUrl: 'https://neuralink.com',
    officialName: 'Neuralink Official',
    bannerImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#10B981',
    categories: ['N1 Brain Implant', 'R1 Surgical Robot', 'PRIME Clinical Study', 'Electrode Engineering', 'Blindsight Project', 'Medical Literature']
  },
  {
    id: 'tunnel-transport',
    title: 'Tunnel & Future Transport',
    shortTitle: 'Boring Co. & Loops',
    tagline: 'High-Speed Underground Electric Loops to Solve Soul-Crushing Traffic',
    description: 'The Boring Company underground infrastructure: Vegas Loop commercial operations, Prufrock continuous tunneling machines, subterranean transit stations, and urban utility conduits.',
    officialUrl: 'https://www.boringcompany.com',
    officialName: 'The Boring Company',
    bannerImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#F59E0B',
    categories: ['Vegas Loop', 'Prufrock Tunnel Borers', 'Underground Stations', 'Hyperloop Concepts', 'Infrastructure Engineering', 'Expansion Projects']
  },
  {
    id: 'x-digital-comm',
    title: 'X & Digital Communication',
    shortTitle: 'X Platform',
    tagline: 'The Global Town Square, Digital Marketplace & Real-Time Information Network',
    description: 'The transformation into an Everything App: real-time global news distribution, Grok-powered search, creator revenue sharing, long-form video broadcasting, Spaces audio, and encrypted communication.',
    officialUrl: 'https://x.com',
    officialName: 'X (formerly Twitter)',
    bannerImage: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#111827',
    categories: ['Platform Architecture', 'Creator Monetization', 'Grok Integration', 'X Payments (X Pay)', 'Long-Form Video & Audio', 'Community Verification']
  },
  {
    id: 'investment-finance',
    title: 'Investment & Financial Information',
    shortTitle: 'Financial Intelligence',
    tagline: 'TSLA Market Analytics, Private Equity Primers & SEC Filings Intelligence',
    description: 'A verified investment analysis center. Live NASDAQ: TSLA performance data, balance sheet summaries, quarterly 10-Q/10-K SEC filings, private company valuation breakdowns, and risk disclosures.',
    officialUrl: 'https://ir.tesla.com',
    officialName: 'Tesla Investor Relations',
    bannerImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1800&q=80',
    accentColor: '#059669',
    categories: ['TSLA Stock Analysis', 'SEC Regulatory Filings', 'Private Valuations (SpaceX/xAI)', 'Quarterly Earnings', 'Financial Education', 'Risk Disclosures']
  }
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  // SECTION 1: TESLA CARS & CLEAN ENERGY
  {
    id: 'tesla-cybertruck-cyberbeast',
    sectionId: 'tesla-clean-energy',
    category: 'Cybertruck',
    title: 'Cybertruck Cyberbeast Tri-Motor',
    description: 'The ultra-hard 30X cold-rolled stainless steel exoskeleton electric truck. Features steer-by-wire, 800V architecture, rear-wheel steering, and armored shatter-resistant acoustic glass.',
    specifications: {
      'Acceleration (0-60 mph)': '2.6 seconds (with rollout subtracted)',
      'Range (Est.)': '320 miles (440+ miles with Range Extender)',
      'Towing Capacity': '11,000 lbs',
      'Powertrain': 'Tri-Motor All-Wheel Drive',
      'Suspension': 'Adaptive Air Suspension with up to 17" ground clearance',
      'Electrical Architecture': '800-volt high voltage system, 48-volt low voltage bus'
    },
    price: '$99,990',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1698778573682-346d21c402b5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/cybertruck',
    officialUrl: 'https://www.tesla.com/cybertruck/design',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'tesla-model-s-plaid',
    sectionId: 'tesla-clean-energy',
    category: 'Model S',
    title: 'Model S Plaid Tri-Motor',
    description: 'Sub-2-second zero-to-sixty acceleration with carbon-sleeved rotors. 1,020 peak horsepower with an unmatched 0.208 drag coefficient and tri-zone climate cabin.',
    specifications: {
      'Acceleration (0-60 mph)': '1.99 seconds',
      'Top Speed': '200 mph (with paid hardware upgrade)',
      'Quarter Mile': '9.23 seconds @ 155 mph',
      'Peak Power': '1,020 hp',
      'EPA Range (Est.)': '359 miles',
      'Supercharging Rate': 'Up to 200 miles in 15 minutes (250kW)'
    },
    price: '$87,990',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/models',
    officialUrl: 'https://www.tesla.com/models/design',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-14T09:00:00Z'
  },
  {
    id: 'tesla-model-3-highland',
    sectionId: 'tesla-clean-energy',
    category: 'Model 3',
    title: 'Model 3 Long Range All-Wheel Drive',
    description: 'Upgraded aerodynamic styling, 360-degree acoustic glass, ventilated front seats, rear 8-inch touchscreen display, and ambient multi-color cabin lighting.',
    specifications: {
      'Acceleration (0-60 mph)': '4.2 seconds',
      'EPA Range (Est.)': '341 miles',
      'Top Speed': '125 mph',
      'Seating': '5 adults with 25 cu ft cargo',
      'Audio': '17 speakers with dual subwoofers and dual amplifiers'
    },
    price: '$47,490',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/model3',
    officialUrl: 'https://www.tesla.com/model3/design',
    status: 'commercial',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'tesla-model-y-awd',
    sectionId: 'tesla-clean-energy',
    category: 'Model Y',
    title: 'Model Y All-Wheel Drive',
    description: 'The world’s best-selling passenger vehicle. Versatile crossover seating with 76 cu ft of maximum cargo storage and standard dual-motor all-weather traction.',
    specifications: {
      'Acceleration (0-60 mph)': '4.8 seconds',
      'EPA Range (Est.)': '310 miles',
      'Cargo Capacity': '76.2 cu ft',
      'Towing Rating': 'Up to 3,500 lbs',
      'Safety': '5-star overall safety rating by NHTSA and Euro NCAP'
    },
    price: '$44,990',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/modely',
    officialUrl: 'https://www.tesla.com/modely/design',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-11T12:00:00Z'
  },
  {
    id: 'tesla-semi-commercial',
    sectionId: 'tesla-clean-energy',
    category: 'Tesla Semi',
    title: 'Tesla Semi 500-Mile Heavy Class 8 Truck',
    description: 'Class 8 commercial electric truck engineered to eliminate diesel emissions while delivering three times the power of typical diesel tractors on uphill grades.',
    specifications: {
      'Gross Combination Weight': '82,000 lbs fully loaded',
      'Range': '500 miles on a single charge',
      'Energy Consumption': 'Under 2 kWh per mile',
      'Acceleration (0-60 mph)': '20 seconds fully loaded',
      'Powertrain': 'Tri-motor independent drive on two rear axles',
      'Charging': 'Megawatt Charging System (MCS) — up to 70% in 30 minutes'
    },
    price: '$250,000 (Commercial Est.)',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/semi',
    officialUrl: 'https://www.tesla.com/semi',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-10T14:00:00Z'
  },
  {
    id: 'tesla-powerwall-3',
    sectionId: 'tesla-clean-energy',
    category: 'Powerwall & Megapack',
    title: 'Tesla Powerwall 3 Integrated Home Battery',
    description: 'Whole-home backup power with an integrated solar inverter supporting up to six solar inputs. Continuously supplies up to 11.5 kW of uninterrupted power.',
    specifications: {
      'Energy Capacity': '13.5 kWh',
      'Continuous Power': '11.5 kW on-grid and backup',
      'Solar Inverter': 'Integrated 6 MPPT solar inputs',
      'Scalability': 'Expandable up to 4 units (54 kWh)',
      'Dimensions': '43.25 in x 24 in x 7.6 in'
    },
    price: '$9,300 (Before Installation & Solar Incentives)',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/powerwall',
    officialUrl: 'https://www.tesla.com/powerwall/design',
    status: 'commercial',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-08T11:00:00Z'
  },

  // SECTION 2: ROBOTS & ROBOTICS
  {
    id: 'tesla-optimus-gen-2',
    sectionId: 'robots-robotics',
    category: 'Tesla Optimus',
    title: 'Tesla Optimus Gen 2 Humanoid Robot',
    description: 'A 5-foot-8 bipedal general-purpose humanoid robot. Features all Tesla-designed actuators and sensors, 22-degree-of-freedom hands with tactile sensing fingers, and 30% faster walking pace.',
    specifications: {
      'Height': '5 ft 8 in (173 cm)',
      'Weight': '125 lbs (57 kg) — 10 kg reduction vs Gen 1',
      'Walking Speed': '5 mph',
      'Hand Articulation': '11 degrees of freedom with tactile force sensors on every fingertip',
      'Battery Capacity': '2.3 kWh pack in torso (all-day operation)',
      'Perception': 'Full Self-Driving (FSD) computer running end-to-end vision neural networks'
    },
    price: '$20,000 - $30,000 (Targeted Production Price)',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/AI',
    officialUrl: 'https://www.tesla.com/AI',
    status: 'prototype',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-16T15:00:00Z'
  },
  {
    id: 'optimus-actuator-engineering',
    sectionId: 'robots-robotics',
    category: 'Actuators & Sensors',
    title: 'Tesla Custom Integrated Actuators & Torque Sensing',
    description: 'High-torque density custom rotary and linear electromechanical actuators designed specifically for bipedal biomechanics, eliminating complex external wiring harnesses.',
    specifications: {
      'Rotary Actuators': 'Harmonic drive gearing with integrated dual encoders',
      'Linear Actuators': 'Planetary roller screws capable of lifting up to 500 kg each',
      'Thermal Management': 'Torso heat sink conduction cooling',
      'Torque Sensing': 'Sub-millimeter strain gauge arrays'
    },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.tesla.com/AI',
    status: 'prototype',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-14T11:00:00Z'
  },

  // SECTION 3: SPACE EXPLORATION & ROCKETS
  {
    id: 'spacex-starship-super-heavy',
    sectionId: 'space-rockets',
    category: 'Starship Super Heavy',
    title: 'Starship & Super Heavy Reusable Transportation System',
    description: 'The tallest and most powerful rocket ever flown. 33 Raptor 3 engines generate 16.7 million pounds of thrust. Designed for full and rapid reusability with tower catch arms.',
    specifications: {
      'Total Height': '121 meters (397 ft)',
      'Liftoff Thrust': '16.7 million lbf (74 MN) via 33 Raptor engines',
      'Payload to Low Earth Orbit': '100 - 150 metric tons (fully reusable mode)',
      'Propellant': 'Liquid Methane (CH4) & Liquid Oxygen (LOX)',
      'Catch Mechanism': 'Mechazilla chopsticks catch on both booster and ship',
      'Mission Objectives': 'Artemis III Lunar Lander, Starlink V3 deployment, Mars Cargo & Crew'
    },
    images: [
      'https://images.unsplash.com/photo-1517976487507-5b3b11329241?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.spacex.com/vehicles/starship',
    officialUrl: 'https://www.spacex.com/vehicles/starship',
    status: 'prototype',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-20T09:00:00Z'
  },
  {
    id: 'spacex-falcon-9-block-5',
    sectionId: 'space-rockets',
    category: 'Falcon 9',
    title: 'Falcon 9 Block 5 Commercial Workhorse',
    description: 'The world’s first orbital class reusable two-stage rocket. Over 300 successful landings and reflights, carrying astronauts to the International Space Station and launching the Starlink megaconstellation.',
    specifications: {
      'Height': '70 meters (229.6 ft)',
      'Thrust at Sea Level': '1,710,000 lbf (9 Merlin 1D engines)',
      'Payload to LEO': '22,800 kg (50,265 lb)',
      'Booster Turnaround Record': 'Under 21 days between flights',
      'Success Rate': '>99.4% mission success across hundreds of flights'
    },
    price: '$69.75M (Standard Commercial Launch Contract)',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.spacex.com/vehicles/falcon-9',
    officialUrl: 'https://www.spacex.com/vehicles/falcon-9',
    status: 'commercial',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-18T10:00:00Z'
  },
  {
    id: 'spacex-dragon-crew-capsule',
    sectionId: 'space-rockets',
    category: 'Dragon Spacecraft',
    title: 'Dragon 2 Crew & Cargo Spacecraft',
    description: 'Autonomous spacecraft capable of carrying up to 7 passengers to and from Earth orbit. Features 8 SuperDraco abort engines, touchscreens, and a PICA-X heat shield.',
    specifications: {
      'Passenger Capacity': 'Up to 7 crew members (NASA standard 4)',
      'Orbital Duration': 'Up to 210 days docked to ISS',
      'Abort System': 'Launch abort capability from pad to orbit via SuperDraco engines',
      'Diameter': '4 meters (13 ft)'
    },
    images: [
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.spacex.com/vehicles/dragon',
    status: 'commercial',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-17T11:00:00Z'
  },

  // SECTION 4: STARLINK & SATELLITE INTERNET
  {
    id: 'starlink-standard-gen-3',
    sectionId: 'starlink-internet',
    category: 'Hardware Terminals',
    title: 'Starlink Standard Kit (Gen 3) Phased Array',
    description: 'Electronic phased array antenna with a 110-degree field of view and integrated kickstand. Includes Wi-Fi 6 router with tri-band radio and two Ethernet LAN ports.',
    specifications: {
      'Field of View': '110 degrees electronic steering',
      'Wi-Fi Standard': 'Wi-Fi 6 (802.11ax) Tri-Band 4x4 MU-MIMO',
      'Operating Temperature': '-30°C to 50°C (-22°F to 122°F)',
      'Snow Melt Capability': 'Up to 40mm/hour (1.5 in/hour)',
      'Power Consumption': 'Average 75-100 Watts'
    },
    price: '$499 (Hardware Terminal)',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.starlink.com',
    officialUrl: 'https://www.starlink.com/residential',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-22T08:00:00Z'
  },
  {
    id: 'starlink-mini-portable',
    sectionId: 'starlink-internet',
    category: 'Starlink Mini',
    title: 'Starlink Mini Ultra-Portable Terminal',
    description: 'Backpack-sized, all-in-one satellite dish with built-in Wi-Fi router. Powered via USB-C PD (100W) or 12V-48V DC, delivering 100+ Mbps internet anywhere.',
    specifications: {
      'Weight': '2.43 lbs (1.1 kg) with kickstand',
      'Dimensions': '11.75 in x 10.2 in x 1.45 in (298.5 x 259 x 38.5 mm)',
      'Power Input': 'USB-C 100W PD or 12V-48V DC barrel jack',
      'Typical Speeds': '50 - 150 Mbps download, 20 - 40ms latency',
      'Weather Resistance': 'IP67 waterproof and dustproof'
    },
    price: '$599 (Terminal) + $50/mo (Roam 50GB)',
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.starlink.com/roam',
    officialUrl: 'https://www.starlink.com/roam',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-21T13:00:00Z'
  },

  // SECTION 5: ARTIFICIAL INTELLIGENCE & XAI
  {
    id: 'xai-grok-3-frontier',
    sectionId: 'artificial-intelligence',
    category: 'Grok Models',
    title: 'Grok 3 Frontier Multimodal Reasoning Model',
    description: 'Frontier AI model developed by xAI, trained on the 100,000+ H100 Colossus cluster. Designed for maximum truth-seeking, rigorous mathematical proofs, and live world knowledge synthesis.',
    specifications: {
      'Context Window': '1,000,000+ tokens',
      'Training Cluster': 'Memphis Colossus (100,000+ Nvidia H100 GPUs)',
      'Core Capabilities': 'Deep mathematical reasoning, code execution, real-time citation grounding',
      'Philosophy': 'Truth-seeking without censorship of objective facts'
    },
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://x.ai/news',
    officialUrl: 'https://x.ai',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-25T14:00:00Z'
  },
  {
    id: 'xai-colossus-cluster',
    sectionId: 'artificial-intelligence',
    category: 'Colossus Supercomputer',
    title: 'Memphis Colossus Supercomputing Facility',
    description: 'The world’s largest AI training cluster, built in Memphis, Tennessee in just 122 days. Liquid-cooled infrastructure powered by 100k+ Hopper GPUs on an RDMA fabric.',
    specifications: {
      'Hardware': '100,000+ NVIDIA H100 / H200 GPUs',
      'Interconnect': 'Non-blocking RoCE v2 Ethernet Fabric',
      'Cooling': 'Direct-to-chip liquid cooling loops',
      'Deployment Velocity': 'Online in 122 days from bare building'
    },
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://x.ai',
    status: 'commercial',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-24T16:00:00Z'
  },

  // SECTION 6: NEURALINK & BRAIN TECHNOLOGY
  {
    id: 'neuralink-n1-telepathy-implant',
    sectionId: 'neuralink-brain-tech',
    category: 'N1 Brain Implant',
    title: 'Neuralink N1 Telepathy Brain-Computer Interface',
    description: 'A fully implantable, hermetically sealed BCI with 1,024 channels distributed across 64 ultra-flexible threads. Wireless inductive charging and Bluetooth communication directly to digital devices.',
    specifications: {
      'Channel Count': '1,024 recording electrodes across 64 threads',
      'Thread Dimensions': '5 microns thin (thinner than human hair)',
      'Signal Processing': 'Custom on-chip spike sorting and neural DSP',
      'Battery Life': 'All-day inductive wireless recharge through skin',
      'Clinical Indication': 'Telepathy application: control computer cursor and keyboards by thought'
    },
    images: [
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://neuralink.com',
    officialUrl: 'https://neuralink.com',
    status: 'prototype',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-26T10:00:00Z'
  },
  {
    id: 'neuralink-r1-surgical-robot',
    sectionId: 'neuralink-brain-tech',
    category: 'R1 Surgical Robot',
    title: 'Neuralink R1 Automated Surgical Robot',
    description: 'Micron-scale precision stereotaxic robot capable of inserting 64 flexible threads into motor cortex cortical tissue while optically evading microscopic blood vessels.',
    specifications: {
      'Optical Targeting': '5 optical cameras and optical coherence tomography (OCT)',
      'Needle Diameter': 'Tungsten-rhenium needle sub-micron tip',
      'Insertion Speed': 'Automated insertion of 64 threads in under 25 minutes'
    },
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://neuralink.com',
    status: 'prototype',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-25T11:00:00Z'
  },

  // SECTION 7: THE BORING COMPANY & TUNNEL TRANSPORT
  {
    id: 'boring-vegas-loop-network',
    sectionId: 'tunnel-transport',
    category: 'Vegas Loop',
    title: 'The Vegas Loop Underground Transport System',
    description: 'Operating commercial underground electric vehicle transit system in Las Vegas. Currently connecting the LVCC, Resorts World, and expanding to over 68 miles and 93 stations across the Strip.',
    specifications: {
      'Approved Network': '68 miles of dual tunnels, 93 passenger stations',
      'Operating Vehicle': 'Tesla Model X, Model Y, and Model S electric fleet',
      'Peak Passenger Capacity': 'Up to 90,000 passengers per hour at full buildout',
      'LVCC Campus Transit Time': 'Under 2 minutes (previously a 25-minute walk)'
    },
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.boringcompany.com/vegas-loop',
    officialUrl: 'https://www.boringcompany.com',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-27T09:00:00Z'
  },
  {
    id: 'boring-prufrock-3-machine',
    sectionId: 'tunnel-transport',
    category: 'Prufrock Tunnel Borers',
    title: 'Prufrock-3 Continuous Mining Tunnel Boring Machine',
    description: 'Next-generation tunnel boring machine designed to "porpoise" directly into the earth without digging large launch pits, digging continuously at miles per week.',
    specifications: {
      'Tunnel Diameter': '12 ft (3.66 meters)',
      'Mining Velocity Goal': '7 miles per day (comparable to snail speed)',
      'Launch Architecture': 'Drive directly into ground from surface slope'
    },
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://www.boringcompany.com/prufrock',
    status: 'prototype',
    isPublished: true,
    isFeatured: false,
    createdAt: '2026-01-26T12:00:00Z'
  },

  // SECTION 8: X & DIGITAL COMMUNICATION
  {
    id: 'x-everything-app-architecture',
    sectionId: 'x-digital-comm',
    category: 'Platform Architecture',
    title: 'X The Everything App & Real-Time Town Square',
    description: 'Transforming into an integrated digital communication platform combining uncensored real-time public discourse, Grok conversational AI integration, creator monetized video, and upcoming peer-to-peer payments.',
    specifications: {
      'Active Monthly Users': 'Over 550M monthly active users globally',
      'Video Streaming': '4K long-form video uploads up to 4 hours',
      'AI Grounding': 'Direct in-app Grok contextual analysis on post threads',
      'Monetization': 'Direct creator revenue share on verified ads impression'
    },
    images: [
      'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://x.com',
    officialUrl: 'https://x.com',
    status: 'commercial',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-28T09:00:00Z'
  },

  // SECTION 9: INVESTMENT & FINANCIAL INFORMATION
  {
    id: 'tsla-equity-fundamentals',
    sectionId: 'investment-finance',
    category: 'TSLA Stock Analysis',
    title: 'Tesla, Inc. (NASDAQ: TSLA) Equity & Valuation Intelligence',
    description: 'Comprehensive financial performance breakdown: automotive gross margins, energy storage deployment growth, Full Self-Driving software licensing potential, and operating cash flow metrics.',
    specifications: {
      'Ticker': 'NASDAQ: TSLA',
      'Market Capitalization': '$850B+ (Verified Range)',
      'Automotive Revenues': '$82B+ Annualized',
      'Energy Storage Growth': '>120% YoY Megapack deployment acceleration',
      'Regulatory Filings': 'SEC Form 10-K Annual and 10-Q Quarterly Reports on EDGAR'
    },
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://ir.tesla.com',
    officialUrl: 'https://ir.tesla.com',
    status: 'published',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-29T10:00:00Z'
  },
  {
    id: 'private-equity-spacex-xai-guide',
    sectionId: 'investment-finance',
    category: 'Private Valuations (SpaceX/xAI)',
    title: 'Private Company Equity Primer: SpaceX & xAI Secondary Markets',
    description: 'Educational guide explaining the legal and structural mechanics of investing in private firms. Details accredited investor thresholds, secondary tender offers, 409A valuations, and liquidity risks.',
    specifications: {
      'SpaceX Private Valuation': '~$210 Billion (Latest Tender Round)',
      'xAI Private Valuation': '~$50 Billion (Capital Series B)',
      'Accredited Investor Requirement': 'Net worth > $1M (excluding primary residence) or $200k+ annual income',
      'Secondary Market Platforms': 'Forge Global, EquityZen, Carta Liquidity (Subject to company approval)'
    },
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ],
    sourceUrl: 'https://ir.tesla.com',
    officialUrl: 'https://www.sec.gov/investor',
    status: 'published',
    isPublished: true,
    isFeatured: true,
    createdAt: '2026-01-28T14:00:00Z'
  }
];

export const VEHICLE_COMPARISONS: VehicleComparisonSpec[] = [
  {
    model: 'Model S Plaid',
    acceleration: '1.99 s',
    range: '359 mi',
    topSpeed: '200 mph',
    peakPower: '1,020 hp',
    drive: 'Tri-Motor AWD',
    startingPrice: '$87,990',
    cargo: '28 cu ft',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'
  },
  {
    model: 'Model 3 Long Range',
    acceleration: '4.2 s',
    range: '341 mi',
    topSpeed: '125 mph',
    peakPower: '394 hp',
    drive: 'Dual-Motor AWD',
    startingPrice: '$47,490',
    cargo: '24 cu ft',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=600&q=80'
  },
  {
    model: 'Model X Plaid',
    acceleration: '2.5 s',
    range: '326 mi',
    topSpeed: '163 mph',
    peakPower: '1,020 hp',
    drive: 'Tri-Motor AWD',
    startingPrice: '$92,990',
    cargo: '88 cu ft',
    image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&w=600&q=80'
  },
  {
    model: 'Model Y Long Range',
    acceleration: '4.8 s',
    range: '310 mi',
    topSpeed: '135 mph',
    peakPower: '384 hp',
    drive: 'Dual-Motor AWD',
    startingPrice: '$44,990',
    cargo: '76 cu ft',
    image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=600&q=80'
  },
  {
    model: 'Cybertruck Cyberbeast',
    acceleration: '2.6 s',
    range: '320 mi',
    topSpeed: '130 mph',
    peakPower: '845 hp',
    drive: 'Tri-Motor AWD',
    startingPrice: '$99,990',
    cargo: '120.9 cu ft',
    image: 'https://images.unsplash.com/photo-1698778573682-346d21c402b5?auto=format&fit=crop&w=600&q=80'
  },
  {
    model: 'Tesla Semi',
    acceleration: '20 s (82k lbs)',
    range: '500 mi',
    topSpeed: '65 mph (5% Grade)',
    peakPower: '~1,200 hp',
    drive: 'Tri-Motor Tandem',
    startingPrice: '$250,000 (Commercial)',
    cargo: '82,000 lbs Gross Weight',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
  }
];

export const SPACE_LAUNCHES: SpaceLaunchItem[] = [
  {
    id: 'launch-starship-ift-next',
    missionName: 'Starship Integrated Flight Test',
    rocket: 'Starship Super Heavy (Booster 14 / Ship 33)',
    launchSite: 'Starbase, Boca Chica, Texas (Pad A)',
    date: 'Verified Target: Q4 2026',
    status: 'ORBITAL_TEST',
    orbit: 'Suborbital / Trans-Atmospheric Insertion',
    payloadDescription: 'Booster tower catch attempt + Ship upper-stage orbital relight and tile thermal test',
    verifiedSource: 'https://www.spacex.com/launches'
  },
  {
    id: 'launch-falcon9-starlink-group',
    missionName: 'Starlink V2 Mini Deployment Flight',
    rocket: 'Falcon 9 Block 5 (Booster Flight 23)',
    launchSite: 'Cape Canaveral SLC-40, Florida',
    date: 'Scheduled: Bi-weekly Launch Cadence',
    status: 'UPCOMING',
    orbit: 'Low Earth Orbit (530 km, 43° inclination)',
    payloadDescription: '23 Starlink second-generation satellites with E-band direct-to-cell phased arrays',
    verifiedSource: 'https://www.spacex.com/launches'
  },
  {
    id: 'launch-crew-iss-dragon',
    missionName: 'NASA Commercial Crew Rotation',
    rocket: 'Falcon 9 Block 5',
    launchSite: 'Kennedy Space Center LC-39A',
    date: 'Active Mission Fleet',
    status: 'SUCCESS',
    orbit: 'International Space Station (400 km LEO)',
    payloadDescription: 'Crew Dragon spacecraft with 4 international astronauts for scientific research',
    verifiedSource: 'https://www.nasa.gov/commercial-crew'
  }
];

export const STARLINK_COUNTRIES: StarlinkCountry[] = [
  {
    countryCode: 'US',
    name: 'United States',
    region: 'North America',
    status: 'Available Now',
    avgDownloadSpeed: '150 - 250 Mbps',
    avgLatency: '24 - 38 ms',
    monthlyServiceEst: '$120 / month',
    hardwarePriceEst: '$499',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'CA',
    name: 'Canada',
    region: 'North America',
    status: 'Available Now',
    avgDownloadSpeed: '140 - 240 Mbps',
    avgLatency: '28 - 42 ms',
    monthlyServiceEst: 'CAD $140 / month',
    hardwarePriceEst: 'CAD $599',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'GB',
    name: 'United Kingdom',
    region: 'Europe',
    status: 'Available Now',
    avgDownloadSpeed: '160 - 280 Mbps',
    avgLatency: '22 - 35 ms',
    monthlyServiceEst: '£75 / month',
    hardwarePriceEst: '£299',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'DE',
    name: 'Germany',
    region: 'Europe',
    status: 'Available Now',
    avgDownloadSpeed: '150 - 260 Mbps',
    avgLatency: '25 - 40 ms',
    monthlyServiceEst: '€50 / month',
    hardwarePriceEst: '€299',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'AU',
    name: 'Australia',
    region: 'Oceania',
    status: 'Available Now',
    avgDownloadSpeed: '170 - 290 Mbps',
    avgLatency: '28 - 45 ms',
    monthlyServiceEst: 'AUD $139 / month',
    hardwarePriceEst: 'AUD $599',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'JP',
    name: 'Japan',
    region: 'Asia',
    status: 'Available Now',
    avgDownloadSpeed: '140 - 220 Mbps',
    avgLatency: '30 - 45 ms',
    monthlyServiceEst: '¥6,600 / month',
    hardwarePriceEst: '¥36,500',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'BR',
    name: 'Brazil',
    region: 'South America',
    status: 'Available Now',
    avgDownloadSpeed: '130 - 210 Mbps',
    avgLatency: '35 - 55 ms',
    monthlyServiceEst: 'R$ 184 / month',
    hardwarePriceEst: 'R$ 1,400',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'NG',
    name: 'Nigeria',
    region: 'Africa',
    status: 'Available Now',
    avgDownloadSpeed: '100 - 180 Mbps',
    avgLatency: '45 - 65 ms',
    monthlyServiceEst: '₦38,000 / month',
    hardwarePriceEst: '₦440,000',
    officialOrderLink: 'https://www.starlink.com/residential'
  },
  {
    countryCode: 'IN',
    name: 'India',
    region: 'Asia',
    status: 'Regulatory Approval Pending',
    avgDownloadSpeed: 'Est. 120 - 200 Mbps',
    avgLatency: 'Est. 30 - 50 ms',
    monthlyServiceEst: 'Awaiting DoT License Allocation',
    hardwarePriceEst: 'TBD',
    officialOrderLink: 'https://www.starlink.com'
  },
  {
    countryCode: 'ZA',
    name: 'South Africa',
    region: 'Africa',
    status: 'Regulatory Approval Pending',
    avgDownloadSpeed: 'Est. 120 - 200 Mbps',
    avgLatency: 'Est. 35 - 55 ms',
    monthlyServiceEst: 'Awaiting ICASA Regulatory Clearance',
    hardwarePriceEst: 'TBD',
    officialOrderLink: 'https://www.starlink.com'
  }
];

export const TSLA_STOCK_DATA: StockMetric = {
  symbol: 'TSLA',
  name: 'Tesla, Inc.',
  exchange: 'NASDAQ',
  currentPrice: 248.50,
  changePercent: 2.34,
  marketCap: '$792.4 Billion',
  peRatio: '68.4x',
  week52High: 271.00,
  week52Low: 138.80,
  quarterRevenue: '$25.18 Billion',
  annualRevenue: '$96.77 Billion',
  freeCashFlow: '$2.74 Billion',
  secFilingQuarter: 'Q3 2024 / Form 10-Q',
  secFilingUrl: 'https://www.sec.gov/edgar/browse/?CIK=1318605',
  investorRelationsUrl: 'https://ir.tesla.com'
};

export const TSLA_HISTORICAL_CHART_POINTS = [
  { month: 'Nov', price: 215.2 },
  { month: 'Dec', price: 238.4 },
  { month: 'Jan', price: 212.8 },
  { month: 'Feb', price: 188.5 },
  { month: 'Mar', price: 172.0 },
  { month: 'Apr', price: 142.0 },
  { month: 'May', price: 178.6 },
  { month: 'Jun', price: 197.3 },
  { month: 'Jul', price: 251.4 },
  { month: 'Aug', price: 214.1 },
  { month: 'Sep', price: 235.8 },
  { month: 'Oct', price: 248.5 }
];
