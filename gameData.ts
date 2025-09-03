import React from 'react';

// --- TYPES ---

export enum GameStatus {
  LOBBY = 'LOBBY',
  SCENARIO_SELECTION = 'SCENARIO_SELECTION',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY',
}

export interface Choice {
  id: string;
  text: string;
  score: number;
}

export interface Fact {
    text: string;
    url: string;
}

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
  theme?: string;
  fact?: Fact;
}

export interface Scenario {
  id: string;
  title: string;
  icon: 'briefcase' | 'volunteer' | 'heart' | 'cake' | 'planet';
  color: string;
  description: string;
  imageUrl: string;
  questions: {
    [theme: string]: Question[];
  };
}

export interface Answer {
  questionId: string;
  choice: Choice;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  tokens: number;
  cLevel: string;
  answers: Answer[];
  questions?: Question[];
  achievements: string[];
  newAchievements?: Achievement[];
}

export interface GameState {
  status: GameStatus;
  players: Player[];
  scenarios: Scenario[];
  scenario: Scenario | null;
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  temperature: number;
  lastTempChange: number;
}

export type Action =
  | { type: 'START_GAME'; payload: {name: string, avatar: string}[] }
  | { type: 'SELECT_SCENARIO'; payload: Scenario }
  | { type: 'ANSWER_QUESTION'; payload: { playerId: string; questionId: string; choice: Choice } }
  | { type: 'CALCULATE_RESULTS' }
  | { type: 'RESTART' };

// --- ICONS & AVATARS ---

export const ICONS = {
  briefcase: '💼',
  volunteer: '🤝',
  heart: '❤️',
  cake: '🎉',
  planet: '🌍',
  token: '🪙',
  sun: '☀️',
  snowflake: '❄️'
};

export const AVATARS = ['😊', '😎', '🚀', '🦄', '🤖', '🦊', '🐼', '🐸'];


// --- STYLES & CONSTANTS ---

export const C_LEVEL_STYLES: { [key: string]: { className: string; emoji: string } } = {
    'Climate Champion': { className: 'bg-green-100 text-green-800', emoji: '🌟' },
    'Conscious Citizen': { className: 'bg-lime-100 text-lime-800', emoji: '✨' },
    'Casual Consumer': { className: 'bg-yellow-100 text-yellow-800', emoji: '😐' },
    'Carbon Creator': { className: 'bg-orange-100 text-orange-800', emoji: '⚠️' },
    'Crisis Catalyst': { className: 'bg-red-100 text-red-800', emoji: '🔥' },
};

export const ACHIEVEMENTS: { [id: string]: Achievement } = {
    'eco-hero': { id: 'eco-hero', name: 'Eco-Hero!', description: 'You got a perfect low score of 3!', icon: '🏆' },
    'champion': { id: 'champion', name: 'Climate Champion', description: 'Achieved the highest C-Level!', icon: '🌟' },
};


export const INITIAL_STATE: GameState = {
  status: GameStatus.LOBBY,
  players: [],
  scenarios: [],
  scenario: null,
  currentPlayerIndex: 0,
  currentQuestionIndex: 0,
  temperature: 22,
  lastTempChange: 0,
};

export const INDIVIDUAL_SCORING: { [key: number]: { range: [number, number], level: string, tokenChange: number }[] } = {
    3: [
        { range: [3, 4], level: 'Climate Champion', tokenChange: 5 },
        { range: [5, 7], level: 'Conscious Citizen', tokenChange: 3 },
        { range: [8, 10], level: 'Casual Consumer', tokenChange: 0 },
        { range: [11, 13], level: 'Carbon Creator', tokenChange: -4 },
        { range: [14, 15], level: 'Crisis Catalyst', tokenChange: -6 }
    ],
    4: [
        { range: [4, 7], level: 'Climate Champion', tokenChange: 5 },
        { range: [8, 11], level: 'Conscious Citizen', tokenChange: 3 },
        { range: [12, 15], level: 'Casual Consumer', tokenChange: 0 },
        { range: [16, 18], level: 'Carbon Creator', tokenChange: -4 },
        { range: [19, 20], level: 'Crisis Catalyst', tokenChange: -6 }
    ],
    6: [
        { range: [6, 10], level: 'Climate Champion', tokenChange: 5 },
        { range: [11, 16], level: 'Conscious Citizen', tokenChange: 3 },
        { range: [17, 22], level: 'Casual Consumer', tokenChange: 0 },
        { range: [23, 27], level: 'Carbon Creator', tokenChange: -4 },
        { range: [28, 30], level: 'Crisis Catalyst', tokenChange: -6 }
    ]
};

export const TEMP_SCORING: { [key: number]: { [key: number]: { range: [number, number], change: number }[] } } = {
    2: {
        3: [{ range: [6, 8], change: 0 }, { range: [9, 14], change: 1 }, { range: [15, 20], change: 2 }, { range: [21, 26], change: 3 }, { range: [27, 30], change: 5 }],
        4: [{ range: [8, 11], change: 0 }, { range: [12, 19], change: 1 }, { range: [20, 27], change: 2 }, { range: [28, 35], change: 3 }, { range: [36, 40], change: 5 }],
        6: [{ range: [12, 16], change: 0 }, { range: [17, 28], change: 1 }, { range: [29, 40], change: 2 }, { range: [41, 52], change: 3 }, { range: [53, 60], change: 5 }]
    },
    3: {
        3: [{ range: [9, 12], change: 0 }, { range: [13, 21], change: 1 }, { range: [22, 30], change: 2 }, { range: [31, 39], change: 3 }, { range: [40, 45], change: 5 }],
        4: [{ range: [12, 17], change: 0 }, { range: [18, 28], change: 1 }, { range: [29, 40], change: 2 }, { range: [41, 52], change: 3 }, { range: [53, 60], change: 5 }],
        6: [{ range: [18, 25], change: 0 }, { range: [26, 42], change: 1 }, { range: [43, 60], change: 2 }, { range: [61, 78], change: 3 }, { range: [79, 90], change: 5 }]
    },
    4: {
        3: [{ range: [12, 17], change: 0 }, { range: [18, 28], change: 1 }, { range: [29, 40], change: 2 }, { range: [41, 52], change: 3 }, { range: [53, 60], change: 5 }],
        4: [{ range: [16, 23], change: 0 }, { range: [24, 38], change: 1 }, { range: [39, 53], change: 2 }, { range: [54, 69], change: 3 }, { range: [70, 80], change: 5 }],
        6: [{ range: [24, 33], change: 0 }, { range: [34, 56], change: 1 }, { range: [57, 80], change: 2 }, { range: [81, 104], change: 3 }, { range: [105, 120], change: 5 }]
    },
    5: {
        3: [{ range: [15, 21], change: 0 }, { range: [22, 35], change: 1 }, { range: [36, 50], change: 2 }, { range: [51, 65], change: 3 }, { range: [66, 75], change: 5 }],
        4: [{ range: [20, 28], change: 0 }, { range: [29, 47], change: 1 }, { range: [48, 67], change: 2 }, { range: [68, 87], change: 3 }, { range: [88, 100], change: 5 }],
        6: [{ range: [30, 41], change: 0 }, { range: [42, 70], change: 1 }, { range: [71, 100], change: 2 }, { range: [101, 130], change: 3 }, { range: [131, 150], change: 5 }]
    }
};

// --- GAME DATA ---

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'The Dream Interview',
    icon: 'briefcase',
    color: 'bg-blue-500',
    description: 'Every choice, from lunch to your commute, reveals who you are. Will you choose mindfulness or convenience?',
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/interview.svg',
    questions: {
      Mobility: [
        {
          id: 'q1m1',
          text: 'Your interview is across town. How do you ensure you arrive looking crisp and punctual?',
          choices: [
            { id: 'c1', text: 'Cycle the whole way, leaving extra time to cool down and change.', score: 1 },
            { id: 'c2', text: 'Take the bus and train, enjoying the time to mentally prepare.', score: 2 },
            { id: 'c3', text: 'Use a ride-share service to split the cost and route.', score: 3 },
            { id: 'c4', text: 'Rent an e-scooter for a direct, door-to-door trip.', score: 4 },
            { id: 'c5', text: 'Book a private car for a guaranteed stress-free, seated journey.', score: 5 },
          ],
          fact: { text: 'In the EU, transport is responsible for 25% of greenhouse gas emissions, with passenger cars contributing 44% of that total. Cycling produces zero.', url: 'https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emissions-from-transport' }
        }
      ],
      Food: [
        {
          id: 'q1f1',
          text: 'You need a quick breakfast that will keep you focused. You choose?',
          choices: [
            { id: 'c1', text: 'Soaked oats with nuts and seeds prepared at home.', score: 1 },
            { id: 'c2', text: 'A fresh piece of fruit and a coffee from the local bakery.', score: 2 },
            { id: 'c3', text: 'A protein bar and a bottled juice for on-the-go efficiency.', score: 3 },
            { id: 'c4', text: 'A breakfast sandwich and smoothie from a grab-and-go chain.', score: 4 },
            { id: 'c5', text: 'A heated pastry and large flavored coffee from a drive-through.', score: 5 },
          ],
          fact: { text: 'Producing 1 kg of beef requires approximately 15,000 liters of water, mostly for growing animal feed, compared to 250 liters for 1 kg of oats.', url: 'https://waterfootprint.org/en/water-footprint/product-water-footprint/water-footprint-crop-and-animal-products/' }
        }
      ],
      Fashion: [
        {
          id: 'q1s1',
          text: 'You need to look sharp. How do you source your interview outfit?',
          choices: [
            { id: 'c1', text: 'Wear a trusted, classic combination you already own.', score: 1 },
            { id: 'c2', text: 'Borrow a key statement piece from a friend who is your size.', score: 2 },
            { id: 'c3', text: 'Rent a designer outfit for a fraction of the retail price.', score: 3 },
            { id: 'c4', text: 'Buy a new outfit from a sustainable-focused online brand.', score: 4 },
            { id: 'c5', text: 'Get a great deal on a new suit from a fast-fashion retailer.', score: 5 },
          ],
          fact: { text: 'The fashion industry is responsible for ~10% of global carbon emissions—more than international flights and maritime shipping combined.', url: 'https://unece.org/forestry/news/fashion-environmental-and-social-emergency-can-also-drive-progress-towards' }
        }
      ],
      Digital: [
        {
          id: 'q1d1',
          text: 'How do you prepare your portfolio to share in the interview?',
          choices: [
            { id: 'c1', text: 'Print a single copy on recycled paper to leave behind.', score: 1 },
            { id: 'c2', text: 'Have it ready on your tablet to display smoothly.', score: 2 },
            { id: 'c3', text: 'Email a PDF to the interviewers beforehand as a preview.', score: 3 },
            { id: 'c4', text: 'Build an interactive online portfolio hosted on a server.', score: 4 },
            { id: 'c5', text: 'Use a high-resolution projector for an immersive presentation.', score: 5 },
          ],
          fact: { text: 'The ICT sector (data centers, networks, devices) is estimated to account for 2-4% of global carbon emissions.', url: 'https://documents1.worldbank.org/curated/en/099121223165540890/pdf/P17859712a98880541a4b71d57876048abb.pdf' }
        }
      ]
    }
  },
  {
    id: 's2',
    title: 'A Year of Volunteering Abroad',
    icon: 'volunteer',
    color: 'bg-emerald-500',
    description: "You're off to make a difference, but your journey has an impact too. How will you balance your contribution with your footprint?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/volunteer.svg',
    questions: {
      Mobility: [
        {
          id: 'q2m1',
          text: 'Your main luggage is ready. How will you travel the 1200 km to your volunteer site?',
          choices: [
            { id: 'c1', text: 'Take a direct overnight train, sharing a cabin to reduce costs.', score: 1 },
            { id: 'c2', text: 'Drive alone in your own car, splitting the journey into two shorter days.', score: 2 },
            { id: 'c3', text: 'Join a rideshare group to split the fuel cost for the two-day drive.', score: 3 },
            { id: 'c4', text: 'Fly with a budget airline for the long leg and use a local bus for the last stretch.', score: 4 },
            { id: 'c5', text: 'Book a direct flight for speed and check one large suitcase for convenience.', score: 5 },
          ],
          fact: { text: 'Aviation is one of the fastest-growing sources of GHG emissions. A single long-haul flight can emit more CO2 per passenger than the average person in many countries produces in a year.', url: 'https://www.transportenvironment.org/challenges/planes/' }
        }
      ],
      Food: [
        {
          id: 'q2f1',
          text: "You're invited to a welcome potluck. What will you contribute?",
          choices: [
            { id: 'c1', text: "Go to the local farmers' market and buy fresh produce to make something new.", score: 1 },
            { id: 'c2', text: 'Prepare a simple dish from your home country with packed ingredients.', score: 2 },
            { id: 'c3', text: "Offer to help with setup or cleanup instead of bringing food.", score: 3 },
            { id: 'c4', text: 'Pick up a pre-made salad or dessert from a supermarket.', score: 4 },
            { id: 'c5', text: 'Bring imported beers or sodas that everyone might like.', score: 5 },
          ],
          fact: { text: 'Food packaging accounts for about 5% of the energy used in the life cycle of a food product. Making the packaging often consumes more energy than producing the food itself.', url: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/food-packaging-materials' }
        }
      ],
      Fashion: [
        {
          id: 'q2s1',
          text: 'How will you assemble your core wardrobe for the year?',
          choices: [
            { id: 'c1', text: 'Pack only versatile items I already own and love.', score: 1 },
            { id: 'c2', text: 'Pack very light and rely on second-hand shopping abroad.', score: 2 },
            { id: 'c3', text: 'Buy a full new wardrobe from sustainable brands online.', score: 3 },
            { id: 'c4', text: 'Bring my basics but plan to buy a few new trendy pieces there.', score: 4 },
            { id: 'c5', text: 'Ship a large box of clothes ahead of me to ensure I have options.', score: 5 },
          ],
          fact: { text: 'The average European buys 15kg of textiles annually and discards about 11kg. Extending the life of clothes by 9 months can reduce their carbon footprint by 30%.', url: 'https://www.wrap.org.uk/resources/guide/extending-life-clothes' }
        }
      ],
      Digital: [
        {
          id: 'q2d1',
          text: 'How will you stay in touch with family and friends back home?',
          choices: [
            { id: 'c1', text: 'Rely mostly on texting and occasional voice messages.', score: 1 },
            { id: 'c2', text: 'Send a detailed email update every couple of weeks with photos.', score: 2 },
            { id: 'c3', text: 'Schedule a weekly video call and use messaging in between.', score: 3 },
            { id: 'c4', text: 'Have brief video calls multiple times a week to chat.', score: 4 },
            { id: 'c5', text: 'Post daily stories on social media so everyone can see.', score: 5 },
          ],
          fact: { text: 'A one-hour video call can emit between 150-1000 grams of CO2, depending on the service and device used. Turning off video can reduce this footprint by 96%.', url: 'https://www.bbc.com/future/article/20200310-why-and-how-to-cut-your-digital-carbon-footprint' }
        }
      ]
    }
  },
  {
    id: 's3',
    title: 'The Perfect Date',
    icon: 'heart',
    color: 'bg-rose-500',
    description: 'Every choice on this date reveals your values. Will it be charm or consciousness? Chemistry or consideration?',
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/date.svg',
    questions: {
      Mobility: [
        {
          id: 'q3m1',
          text: 'How do you plan your travel to the date location?',
          choices: [
            { id: 'c1', text: 'Walk or cycle, checking the route on an offline map app.', score: 1 },
            { id: 'c2', text: 'Take a direct bus or tram line.', score: 2 },
            { id: 'c3', text: 'Coordinate a carpool if your date is driving that way.', score: 3 },
            { id: 'c4', text: 'Use a ride-hailing app just for yourself.', score: 4 },
            { id: 'c5', text: 'Drive your own car alone for maximum convenience.', score: 5 },
          ],
          fact: { text: 'Active mobility like walking and cycling not only produces zero emissions but also reduces noise pollution, a major environmental stressor in urban areas.', url: 'https://www.eea.europa.eu/publications/noise-in-europe' }
        }
      ],
      Food: [
        {
          id: 'q3f1',
          text: "You're planning a picnic date. What food do you bring?",
          choices: [
            { id: 'c1', text: 'Homemade snacks with local veggies and dips in reusable containers.', score: 1 },
            { id: 'c2', text: 'A homemade pie and baked muffins from market ingredients.', score: 2 },
            { id: 'c3', text: 'A pre-made pasta salad and drinks in cans from a supermarket.', score: 3 },
            { id: 'c4', text: 'Grab fast food and lay it out on napkins.', score: 4 },
            { id: 'c5', text: 'Individually packaged gas station snacks and plastic bottles.', score: 5 },
          ],
          fact: { text: 'Food waste is a major emitter of methane in landfills. If global food waste were a country, it would be the third-largest emitter of GHG (GreenHouse Gases)s after China and the USA.', url: 'https://www.fao.org/3/bb144e/bb144e.pdf' }
        }
      ],
      Fashion: [
        {
          id: 'q3s1',
          text: 'Where do you look for an outfit for this important date?',
          choices: [
            { id: 'c1', text: 'Find something great you already own and love.', score: 1 },
            { id: 'c2', text: 'Borrow a special outfit from a close friend.', score: 2 },
            { id: 'c3', text: 'Hunt for a unique piece in local second-hand shops.', score: 3 },
            { id: 'c4', text: 'Buy a new organic cotton outfit online.', score: 4 },
            { id: 'c5', text: 'Buy a new, trendy outfit from a fast-fashion brand.', score: 5 },
          ],
          fact: { text: 'The second-hand clothing market helps combat textile waste. Buying one used item reduces its carbon footprint by 82% compared to a new one.', url: 'https://www.wrap.org.uk/content/new-report-shows-potential-circular-economy-fashion' }
        }
      ],
      Digital: [
        {
          id: 'q3d1',
          text: 'How do you handle photos about the date?',
          choices: [
            { id: 'c1', text: 'Be present; take one or two meaningful photos for memory.', score: 1 },
            { id: 'c2', text: 'Take a few nice photos to share later.', score: 2 },
            { id: 'c3', text: 'Take photos and videos throughout the evening.', score: 3 },
            { id: 'c4', text: 'Post stories on social media in real-time.', score: 4 },
            { id: 'c5', text: 'Vlog the entire experience for your followers.', score: 5 },
          ],
          fact: { text: 'Uploading one photo to a social media platform may seem small, but with billions of users, the energy for storage and transmission is immense.', url: 'https://www.greenpeace.org/usa/reports/clicking-clean/' }
        }
      ]
    }
  },
   {
    id: 's4',
    title: 'Organising a Birthday Party',
    icon: 'cake',
    color: 'bg-purple-500',
    description: "Your best friend's 25th! Can you prove that fun and responsibility can coexist by throwing a memorable party without excessive waste?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/party.svg',
    questions: {
      Mobility: [
        {
          id: 'q4m1',
          text: "Choosing a venue for your friend's party. What's your priority for guest arrival?",
          choices: [
            { id: 'c1', text: 'A spot within walking or biking distance for almost everyone.', score: 1 },
            { id: 'c2', text: 'A local hall with excellent and frequent tram connections.', score: 2 },
            { id: 'c3', text: 'A space a bit further out, but right next to a major bus interchange.', score: 3 },
            { id: 'c4', text: 'A cool bar in the suburbs, easiest to reach by car.', score: 4 },
            { id: 'c5', text: 'A unique, upscale venue in the countryside for a special experience.', score: 5 },
          ],
          fact: { text: 'Urban sprawl, driven by car-centric development, leads to habitat fragmentation and loss of agricultural land, increasing flood risks through soil sealing.', url: 'https://www.eea.europa.eu/publications/urban-sprawl-in-europe' }
        }
      ],
      Food: [
        {
          id: 'q4f1',
          text: "You're bringing the birthday cake. What kind do you choose?",
          choices: [
            { id: 'c1', text: 'Bake it yourself using ingredients from nearby farms.', score: 1 },
            { id: 'c2', text: 'Buy a fresh, simple cake from the bakery down the street.', score: 2 },
            { id: 'c3', text: 'Pick up a standard, pre-made cake from the supermarket.', score: 3 },
            { id: 'c4', text: 'Order an elaborate custom cake with imported specialty ingredients.', score: 4 },
            { id: 'c5', text: 'Get a huge, multi-tiered novelty cake shipped from afar overnight.', score: 5 },
          ],
          fact: { text: 'Local food systems shorten supply chains, reducing "food miles" and the associated CO2 emissions from transportation and refrigeration.', url: 'https://www.nature.com/articles/s43016-020-0093-y' }
        }
      ],
      Fashion: [
        {
          id: 'q4s1',
          text: 'You want a new outfit for the party. Where do you get it?',
          choices: [
            { id: 'c1', text: 'Host a clothing swap with friends to find something "new".', score: 1 },
            { id: 'c2', text: 'Spend an afternoon hunting for a unique piece at a vintage store.', score: 2 },
            { id: 'c3', text: 'Rent a stylish outfit from a local rental service for the night.', score: 3 },
            { id: 'c4', text: 'Order a new shirt from a sustainable brand with fast shipping.', score: 4 },
            { id: 'c5', text: 'Buy a cheap, trendy top from a fast-fashion retailer.', score: 5 },
          ],
          fact: { text: 'Clothing swaps are a prime example of the circular economy, keeping resources in use for longer and reducing the demand for new, resource-intensive production.', url: 'https://www.ellenmacarthurfoundation.org/assets/downloads/publications/A-New-Textiles-Economy_Full-Report.pdf' }
        }
      ],
      Digital: [
        {
          id: 'q4d1',
          text: "It's time to send the invitations. What's your method?",
          choices: [
            { id: 'c1', text: 'Drop a handwritten note in the mail or deliver it in person.', score: 1 },
            { id: 'c2', text: 'Send one simple message to the existing group chat.', score: 2 },
            { id: 'c3', text: 'Email a nice digital invitation to each guest individually.', score: 3 },
            { id: 'c4', text: 'Use a specialized online service with fancy designs and RSVP tracking.', score: 4 },
            { id: 'c5', text: 'Create and post a video invitation on all your social networks.', score: 5 },
          ],
          fact: { text: 'Online invitation services with complex tracking and RSVP features run on data centers, which have a continuous and growing energy demand.', url: 'https://www.iea.org/reports/data-centres-and-data-transmission-networks' }
        }
      ]
    }
  },
  {
    id: 's5',
    title: 'New Travel Destination',
    icon: 'planet',
    color: 'bg-amber-500',
    description: "Two weeks of freedom, a world to explore. Can you have an authentic adventure that creates memories without exploiting your destination?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/travel.svg',
    questions: {
      Mobility: [
        {
          id: 'q5m1',
          text: 'Your dream destination is 500 km away. How do you get there?',
          choices: [
            { id: 'c1', text: 'Take a direct train or coach journey.', score: 1 },
            { id: 'c2', text: 'Organise a carpool with friends to drive there together.', score: 2 },
            { id: 'c3', text: 'Drive alone in your own car for maximum flexibility.', score: 3 },
            { id: 'c4', text: 'Book a flight with one layover to save a little money.', score: 4 },
            { id: 'c5', text: 'Book the fastest, most direct flight available.', score: 5 },
          ],
          fact: { text: "Aviation's non-CO2 effects (like contrails and nitrous oxide emissions) may double its warming impact compared to CO2 emissions alone.", url: 'https://www.eea.europa.eu/publications/aviation-and-shipping' }
        }
      ],
      Food: [
        {
          id: 'q5f1',
          text: "What's your strategy for eating during your two-week trip?",
          choices: [
            { id: 'c1', text: 'Cook most meals with local ingredients from markets.', score: 1 },
            { id: 'c2', text: 'Eat at small, family-run cafes and street food stalls.', score: 2 },
            { id: 'c3', text: 'Mix street food with meals at standard restaurants.', score: 3 },
            { id: 'c4', text: 'Dine at popular international chain restaurants for familiarity.', score: 4 },
            { id: 'c5', text: 'Seek out high-end restaurants with imported luxury ingredients.', score: 5 },
          ],
          fact: { text: 'Street food and local eateries often have a smaller carbon footprint than large, air-conditioned international chain restaurants.', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0959652616316037' }
        }
      ],
      Fashion: [
        {
          id: 'q5s1',
          text: 'How do you plan your holiday wardrobe?',
          choices: [
            { id: 'c1', text: 'Build a capsule wardrobe from clothes you already own.', score: 1 },
            { id: 'c2', text: 'Borrow a key versatile item, like a jacket, from a friend.', score: 2 },
            { id: 'c3', text: "Buy one new, versatile piece that you'll wear often.", score: 3 },
            { id: 'c4', text: 'Buy a few new trendy items specifically for the trip.', score: 4 },
            { id: 'c5', text: 'Buy a full new holiday wardrobe from fast-fashion stores.', score: 5 },
          ],
          fact: { text: 'A "capsule wardrobe" of versatile, mix-and-match items is the most sustainable travel option, reducing the weight you carry and the need for new purchases.', url: 'https://www.wrap.org.uk/sites/default/files/2021-04/VoC%20FINAL%20REPORT.pdf' }
        }
      ],
      Digital: [
        {
          id: 'q5d1',
          text: 'How will you stay in touch with people back home?',
          choices: [
            { id: 'c1', text: 'Send a few text messages and one weekly call on Wi-Fi.', score: 1 },
            { id: 'c2', text: 'Message daily and have a short video call every few days.', score: 2 },
            { id: 'c3', text: 'Message regularly and have several video calls a week.', score: 3 },
            { id: 'c4', text: 'Message constantly and have daily video calls.', score: 4 },
            { id: 'c5', text: 'Maintain a near-constant video call connection throughout the day.', score: 5 },
          ],
          fact: { text: 'Near-constant video calling requires a stable, high-bandwidth connection, driving energy use in data centers and on transmission networks.', url: 'https://www.iea.org/reports/data-centres-and-data-transmission-networks' }
        }
      ]
    }
  }
];
