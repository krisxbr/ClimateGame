
import React from 'react';

// --- TYPES ---

export enum GameStatus {
  LOBBY = 'LOBBY',
  SCENARIO_ASSIGNMENT = 'SCENARIO_ASSIGNMENT',
  SCENARIO_SELECTION = 'SCENARIO_SELECTION', // No longer used in the main flow
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
    url:string;
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

export interface Team {
  id: string;
  name: string;
  avatar: string;
  players: string[];
  score: number;
  tokens: number;
  cLevel: string;
  answers: Answer[];
  questions?: Question[];
  achievements: string[];
  newAchievements?: Achievement[];
  scenario: Scenario;
}

export interface GameState {
  status: GameStatus;
  teams: Team[];
  scenarios: Scenario[];
  currentTeamIndex: number;
  currentQuestionIndex: number;
  temperature: number;
  lastTempChange: number;
  currentRound: number;
  totalRounds: number;
  questionsPerRound: 3 | 4 | 6;
}

export type Action =
  | { type: 'START_GAME'; payload: { teams: {name: string, avatar: string, players: string[]}[], questionsPerRound: 3 | 4 | 6, totalRounds: number } }
  | { type: 'PROCEED_TO_PLAY' }
  | { type: 'SELECT_SCENARIO'; payload: Scenario }
  | { type: 'ANSWER_QUESTION'; payload: { teamId: string; questionId: string; choice: Choice } }
  | { type: 'CALCULATE_RESULTS' }
  | { type: 'START_NEXT_ROUND' }
  | { type: 'RESTART' }
  | { type: 'RESHUFFLE_SCENARIOS' };

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
  teams: [],
  scenarios: [],
  currentTeamIndex: 0,
  currentQuestionIndex: 0,
  temperature: 22,
  lastTempChange: 0,
  currentRound: 1,
  totalRounds: 3,
  questionsPerRound: 3,
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
        3: [
            { range: [6, 8], change: 0 }, 
            { range: [9, 14], change: 1 }, 
            { range: [15, 20], change: 2 }, 
            { range: [21, 26], change: 3 }, 
            { range: [27, 30], change: 5 }
        ],
        4: [
            { range: [8, 11], change: 0 }, 
            { range: [12, 19], change: 1 }, 
            { range: [20, 27], change: 2 }, 
            { range: [28, 35], change: 3 }, 
            { range: [36, 40], change: 5 }
        ],
        6: [
            { range: [12, 16], change: 0 }, 
            { range: [17, 28], change: 1 }, 
            { range: [29, 40], change: 2 }, 
            { range: [41, 52], change: 3 }, 
            { range: [53, 60], change: 5 }
        ]
    },
    3: {
        3: [
            { range: [9, 12], change: 0 }, 
            { range: [13, 21], change: 1 }, 
            { range: [22, 30], change: 2 }, 
            { range: [31, 39], change: 3 }, 
            { range: [40, 45], change: 5 }
        ],
        4: [
            { range: [12, 17], change: 0 }, 
            { range: [18, 28], change: 1 }, 
            { range: [29, 40], change: 2 }, 
            { range: [41, 52], change: 3 }, 
            { range: [53, 60], change: 5 }
        ],
        6: [
            { range: [18, 25], change: 0 }, 
            { range: [26, 42], change: 1 }, 
            { range: [43, 60], change: 2 }, 
            { range: [61, 78], change: 3 }, 
            { range: [79, 90], change: 5 }
        ]
    },
    4: {
        3: [
            { range: [12, 17], change: 0 }, 
            { range: [18, 28], change: 1 }, 
            { range: [29, 40], change: 2 }, 
            { range: [41, 52], change: 3 }, 
            { range: [53, 60], change: 5 }
        ],
        4: [
            { range: [16, 23], change: 0 }, 
            { range: [24, 38], change: 1 }, 
            { range: [39, 53], change: 2 }, 
            { range: [54, 69], change: 3 }, 
            { range: [70, 80], change: 5 }
        ],
        6: [
            { range: [24, 33], change: 0 }, 
            { range: [34, 56], change: 1 }, 
            { range: [57, 80], change: 2 }, 
            { range: [81, 104], change: 3 }, 
            { range: [105, 120], change: 5 }
        ]
    },
    5: {
        3: [
            { range: [15, 21], change: 0 }, 
            { range: [22, 35], change: 1 }, 
            { range: [36, 50], change: 2 }, 
            { range: [51, 65], change: 3 }, 
            { range: [66, 75], change: 5 }
        ],
        4: [
            { range: [20, 28], change: 0 }, 
            { range: [29, 47], change: 1 }, 
            { range: [48, 67], change: 2 }, 
            { range: [68, 87], change: 3 }, 
            { range: [88, 100], change: 5 }
        ],
        6: [
            { range: [30, 41], change: 0 }, 
            { range: [42, 70], change: 1 }, 
            { range: [71, 100], change: 2 }, 
            { range: [101, 130], change: 3 }, 
            { range: [131, 150], change: 5 }
        ]
    }
};

// --- GAME DATA ---

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Person Going to a Job Interview',
    icon: 'briefcase',
    color: 'bg-blue-500',
    description: 'CHALLENGE: The Life-Changing Interview. The most innovative tech company in town is waiting for you. You have one chance to impress. Every choice you make – from your pre-interview lunch to how you arrive – says something about who you are. The future starts today: which path will you choose? Mindful decisions or immediate convenience?',
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/interview.svg',
    questions: {
      "Personal Mobility": [
        {
          id: 's1-m-1',
          text: 'Your interview is across town. How do you ensure you arrive looking crisp and punctual?',
          choices: [
            { id: 'c1', text: 'Cycle the whole way, leaving extra time to cool down and change.', score: 1 },
            { id: 'c2', text: 'Take the bus and train, enjoying the time to mentally prepare.', score: 2 },
            { id: 'c3', text: 'Use a ride-share service to split the cost and route.', score: 3 },
            { id: 'c4', text: 'Rent an e-scooter for a direct, door-to-door trip.', score: 4 },
            { id: 'c5', text: 'Book a private car for a guaranteed stress-free, seated journey.', score: 5 },
          ],
        },
        {
          id: 's1-m-2',
          text: 'A sudden downpour is forecast for your commute time. What\'s your plan?',
          choices: [
            { id: 'c1', text: 'Trust your waterproof gear and stick with your bike or walk plan.', score: 1 },
            { id: 'c2', text: 'Switch to the bus system to stay dry without extra cost.', score: 2 },
            { id: 'c3', text: 'Use a rideshare app, accepting the potential surge pricing.', score: 3 },
            { id: 'c4', text: 'Rent a car for the day to have a dry shelter on standby.', score: 4 },
            { id: 'c5', text: 'Call a taxi last minute to avoid any contact with the weather.', score: 5 },
          ],
        },
        {
          id: 's1-m-3',
          text: 'The location is in a remote business park with limited transit. How do you get there?',
          choices: [
            { id: 'c1', text: 'Take transit to the closest point and walk the final 20 minutes.', score: 1 },
            { id: 'c2', text: 'Coordinate with another applicant to share a cab from the station.', score: 2 },
            { id: 'c3', text: 'Rent a car for flexibility to explore the area afterwards.', score: 3 },
            { id: 'c4', text: 'Drive your own car for maximum reliability and comfort.', score: 4 },
            { id: 'c5', text: 'Use a door-to-door shuttle service for a premium, direct ride.', score: 5 },
          ],
        },
        {
          id: 's1-m-4',
          text: 'You\'re running behind schedule. How do you make up time on the go?',
          choices: [
            { id: 'c1', text: 'Pedal faster on your bike; you\'ll just be more warmed up.', score: 1 },
            { id: 'c2', text: 'Check the app for a faster transit route with more transfers.', score: 2 },
            { id: 'c3', text: 'Hail an e-scooter to cut through traffic faster than a car.', score: 3 },
            { id: 'c4', text: 'Book a priority rideshare that minimizes stops for others.', score: 4 },
            { id: 'c5', text: 'Order a private taxi that takes the fastest toll road.', score: 5 },
          ],
        },
        {
          id: 's1-m-5',
          text: 'There\'s a major transit delay on your planned route. What\'s your backup plan?',
          choices: [
            { id: 'c1', text: 'Check the app for any alternative bus or train lines, accepting a longer trip.', score: 1 },
            { id: 'c2', text: 'Quickly walk to a different transit stop to bypass the disruption.', score: 2 },
            { id: 'c3', text: 'Use a rideshare to get to a functioning part of the transit network.', score: 3 },
            { id: 'c4', text: 'Immediately rent an e-scooter to navigate around the congestion.', score: 4 },
            { id: 'c5', text: 'Hail the first available taxi to get you the entire way without delays.', score: 5 },
          ],
        },
        {
          id: 's1-m-6',
          text: 'The interview is a multi-day process. How will you handle the commute tomorrow?',
          choices: [
            { id: 'c1', text: 'Scout the route today and commit to cycling again for consistency.', score: 1 },
            { id: 'c2', text: 'Pre-purchase a transit pass for the week to simplify your journey.', score: 2 },
            { id: 'c3', text: 'Book the same rideshare service to replicate today\'s stress-free arrival.', score: 3 },
            { id: 'c4', text: 'Extend your rental car agreement for ultimate convenience.', score: 4 },
            { id: 'c5', text: 'Drive your own car again, now that you know the route and parking.', score: 5 },
          ],
        },
      ],
      "Food and Dietary Habits": [
        {
          id: 's1-f-1',
          text: 'You need a quick breakfast that will keep you focused until the interview. You choose?',
          choices: [
            { id: 'c1', text: 'Soaked oats with nuts and seeds prepared at home.', score: 1 },
            { id: 'c2', text: 'A fresh piece of fruit and a coffee from the local bakery.', score: 2 },
            { id: 'c3', text: 'A protein bar and a bottled juice for on-the-go efficiency.', score: 3 },
            { id: 'c4', text: 'A breakfast sandwich and smoothie from a grab-and-go chain.', score: 4 },
            { id: 'c5', text: 'A heated pastry and large flavored coffee from a drive-through.', score: 5 },
          ],
        },
        {
          id: 's1-f-2',
          text: 'To maintain energy, you bring a drink for the commute. It is:',
          choices: [
            { id: 'c1', text: 'Water from your tap in a container you already own.', score: 1 },
            { id: 'c2', text: 'Home-brewed coffee or tea in your thermal mug.', score: 2 },
            { id: 'c3', text: 'A freshly squeezed juice in a glass bottle from a cafe.', score: 3 },
            { id: 'c4', text: 'A branded energy drink from the convenience store.', score: 4 },
            { id: 'c5', text: 'A large fountain soda with ice in a disposable cup.', score: 5 },
          ],
        },
        {
          id: 's1-f-3',
          text: 'Lunch is with the team. How do you navigate the meal?',
          choices: [
            { id: 'c1', text: 'Suggest a place known for simple, local ingredient-based dishes.', score: 1 },
            { id: 'c2', text: 'Order a vegetarian dish from the menu they recommend.', score: 2 },
            { id: 'c3', text: 'Choose the popular fish or chicken dish everyone else is having.', score: 3 },
            { id: 'c4', text: 'Go for the imported steak, a sure sign of success and taste.', score: 4 },
            { id: 'c5', text: 'Insist on a famous burger chain for a casual, predictable meal.', score: 5 },
          ],
        },
        {
          id: 's1-f-4',
          text: 'After the interview, you celebrate. Your treat of choice is:',
          choices: [
            { id: 'c1', text: 'A piece of high-quality, locally made dark chocolate.', score: 1 },
            { id: 'c2', text: 'A craft beer or cocktail at a nearby independent bar.', score: 2 },
            { id: 'c3', text: 'A slice of cake from a well-known patisserie chain.', score: 3 },
            { id: 'c4', text: 'A shareable platter of imported snacks and drinks.', score: 4 },
            { id: 'c5', text: 'A large, decadent dessert from a delivery app.', score: 5 },
          ],
        },
        {
          id: 's1-f-5',
          text: 'You want a pre-interview snack to calm your nerves. You grab:',
          choices: [
            { id: 'c1', text: 'A handful of almonds from your bulk food stash.', score: 1 },
            { id: 'c2', text: 'A piece of fruit from a nearby grocer\'s loose display.', score: 2 },
            { id: 'c3', text: 'A single-serving bag of pretzels from a vending machine.', score: 3 },
            { id: 'c4', text: 'A plastic tub of protein pudding for a quick boost.', score: 4 },
            { id: 'c5', text: 'A small bag of individually wrapped chocolates.', score: 5 },
          ],
        },
        {
          id: 's1-f-6',
          text: 'The company offers you a bottled drink while you wait. You accept:',
          choices: [
            { id: 'c1', text: 'A glass of tap water, no ice.', score: 1 },
            { id: 'c2', text: 'Coffee or tea served in a ceramic mug.', score: 2 },
            { id: 'c3', text: 'Sparkling water from a glass bottle.', score: 3 },
            { id: 'c4', text: 'A branded soda in an aluminum can.', score: 4 },
            { id: 'c5', text: 'A plastic bottle of flavored iced tea.', score: 5 },
          ],
        },
      ],
      "Fashion and Clothing Habits": [
        {
          id: 's1-c-1',
          text: 'You need to look sharp. How do you source your interview outfit?',
          choices: [
            { id: 'c1', text: 'Wear a trusted, classic combination you already own.', score: 1 },
            { id: 'c2', text: 'Borrow a key statement piece from a friend who is your size.', score: 2 },
            { id: 'c3', text: 'Rent a designer outfit for a fraction of the retail price.', score: 3 },
            { id: 'c4', text: 'Buy a new outfit from a sustainable-focused online brand.', score: 4 },
            { id: 'c5', text: 'Get a great deal on a new suit from a fast-fashion retailer.', score: 5 },
          ],
        },
        {
          id: 's1-c-2',
          text: 'Your shoes need to be impeccable. How do you ensure they are?',
          choices: [
            { id: 'c1', text: 'Clean and polish the best pair you already have.', score: 1 },
            { id: 'c2', text: 'Resole and refresh your old reliable dress shoes.', score: 2 },
            { id: 'c3', text: 'Buy a like-new pair from a high-end consignment store.', score: 3 },
            { id: 'c4', text: 'Purchase new leather shoes from a heritage brand.', score: 4 },
            { id: 'c5', text: 'Buy a cheap, stylish pair that you can discard after.', score: 5 },
          ],
        },
        {
          id: 's1-c-3',
          text: 'Your shirt has a wrinkle. How do you handle it last minute?',
          choices: [
            { id: 'c1', text: 'Hang it in the bathroom during a hot shower for steam.', score: 1 },
            { id: 'c2', text: 'Quickly iron just the collar and cuffs for a focused look.', score: 2 },
            { id: 'c3', text: 'Use a compact travel steamer for a full refresh.', score: 3 },
            { id: 'c4', text: 'Do a full ironing session on medium heat.', score: 4 },
            { id: 'c5', text: 'Rewash the shirt and use the dryer\'s high-heat cycle.', score: 5 },
          ],
        },
        {
          id: 's1-c-4',
          text: 'After the interview, how do you care for your outfit?',
          choices: [
            { id: 'c1', text: 'Air it out and spot-clean any small marks.', score: 1 },
            { id: 'c2', text: 'Hand-wash delicate items and hang them to dry.', score: 2 },
            { id: 'c3', text: 'Machine wash on a cool, gentle cycle.', score: 3 },
            { id: 'c4', text: 'Machine wash with bleach and tumble dry to sterilize.', score: 4 },
            { id: 'c5', text: 'Send it all for professional dry cleaning to be perfect for next time.', score: 5 },
          ],
        },
        {
          id: 's1-c-5',
          text: 'You notice a small scuff on your shoe right before leaving. You:',
          choices: [
            { id: 'c1', text: 'Buff it quickly with the back of your sock; it\'s barely noticeable.', score: 1 },
            { id: 'c2', text: 'Use a natural wax pencil you have for such minor emergencies.', score: 2 },
            { id: 'c3', text: 'Pop into a cobbler for a quick, on-the-spot polish.', score: 3 },
            { id: 'c4', text: 'Buy a new shoe polish kit to do a proper job.', score: 4 },
            { id: 'c5', text: 'Decide it\'s a sign to buy a new pair on your way home.', score: 5 },
          ],
        },
        {
          id: 's1-c-6',
          text: 'You want to make a strong first impression with an accessory. You:',
          choices: [
            { id: 'c1', text: 'Wear your grandfather\'s classic watch, a timeless piece.', score: 1 },
            { id: 'c2', text: 'Borrow a tasteful silk tie from a roommate.', score: 2 },
            { id: 'c3', text: 'Buy a new tie from a department store\'s mid-range collection.', score: 3 },
            { id: 'c4', text: 'Order a trendy, statement-making belt online with express shipping.', score: 4 },
            { id: 'c5', text: 'Pick up a designer-branded accessory at the airport.', score: 5 },
          ],
        },
      ],
      "Digital Life, Tools and Devices": [
        {
          id: 's1-d-1',
          text: 'How do you ensure your phone battery lasts all day?',
          choices: [
            { id: 'c1', text: 'Charge to 80% overnight and keep it on power-saving mode.', score: 1 },
            { id: 'c2', text: 'Do a full charge and only use it for essential maps and calls.', score: 2 },
            { id: 'c3', text: 'Carry a compact, low-capacity power bank just in case.', score: 3 },
            { id: 'c4', text: 'Use a high-speed power bank to stream music and navigate.', score: 4 },
            { id: 'c5', text: 'Keep it plugged into a portable charger all day for 100% uptime.', score: 5 },
          ],
        },
        {
          id: 's1-d-2',
          text: 'How do you prepare your portfolio to share in the interview?',
          choices: [
            { id: 'c1', text: 'Print a single copy on recycled paper to leave behind.', score: 1 },
            { id: 'c2', text: 'Have it ready on your tablet to display smoothly.', score: 2 },
            { id: 'c3', text: 'Email a PDF to the interviewers beforehand as a preview.', score: 3 },
            { id: 'c4', text: 'Build an interactive online portfolio hosted on a server.', score: 4 },
            { id: 'c5', text: 'Use a high-resolution projector for an immersive presentation.', score: 5 },
          ],
        },
        {
          id: 's1-d-3',
          text: 'How will you navigate to the interview?',
          choices: [
            { id: 'c1', text: 'Study the route beforehand and rely on street signs.', score: 1 },
            { id: 'c2', text: 'Download an offline map to avoid using live data.', score: 2 },
            { id: 'c3', text: 'Use standard live GPS navigation on your phone.', score: 3 },
            { id: 'c4', text: 'Run two navigation apps simultaneously to compare ETAs.', score: 4 },
            { id: 'c5', text: 'Stream a video map live for the most visual, real-time guidance.', score: 5 },
          ],
        },
        {
          id: 's1-d-4',
          text: 'After the interview, how do you follow up?',
          choices: [
            { id: 'c1', text: 'Send a concise thank-you email the same day.', score: 1 },
            { id: 'c2', text: 'Email and send a personalized connection request on LinkedIn.', score: 2 },
            { id: 'c3', text: 'Send an email and a thank-you message via the company\'s portal.', score: 3 },
            { id: 'c4', text: 'Email and share a positive post about the company culture online.', score: 4 },
            { id: 'c5', text: 'Create a personalized video thank-you and share it on social media.', score: 5 },
          ],
        },
        {
          id: 's1-d-5',
          text: 'To make a strong impression, you prepare a digital portfolio. You:',
          choices: [
            { id: 'c1', text: 'Keep it simple: a one-page PDF resume on a USB drive.', score: 1 },
            { id: 'c2', text: 'Bring your own tablet to control the presentation smoothly.', score: 2 },
            { id: 'c3', text: 'Upload it to a cloud service for easy access from any device.', score: 3 },
            { id: 'c4', text: 'Create a video presentation and host it on a streaming platform.', score: 4 },
            { id: 'c5', text: 'Develop a complex interactive website for a fully immersive experience.', score: 5 },
          ],
        },
        {
          id: 's1-d-6',
          text: 'After the interview, you...:',
          choices: [
            { id: 'c1', text: 'Read a physical book or magazine to disconnect completely.', score: 1 },
            { id: 'c2', text: 'Listen to a podcast downloaded earlier over Wi-Fi.', score: 2 },
            { id: 'c3', text: 'Scroll through social media feeds to unwind.', score: 3 },
            { id: 'c4', text: 'Play a graphics-intensive online mobile game.', score: 4 },
            { id: 'c5', text: 'Stream a high-definition movie on your phone using mobile data.', score: 5 },
          ],
        },
      ]
    }
  },
  {
    id: 's2',
    title: 'Person Preparing for One Year Abroad',
    icon: 'volunteer',
    color: 'bg-emerald-500',
    description: "CHALLENGE: Making a difference... Thoughtfully. You've won a scholarship for a year of community service in a European country other than the one you live in. The paradox is clear: traveling to help local communities? It's your chance to make a difference, but every choice counts. How will you balance your contribution with the impact of your journey?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/volunteer.svg',
    questions: {
      Mobility: [
        {
          id: 's2-m-1',
          text: 'Your main luggage is ready. How will you travel the 1200 km to your volunteer site?',
          choices: [
            { id: 'c1', text: 'Take a direct overnight train, sharing a cabin to reduce costs.', score: 1 },
            { id: 'c2', text: 'Drive alone in your own car, splitting the journey into two shorter days.', score: 2 },
            { id: 'c3', text: 'Join a rideshare group to split the fuel cost for the two-day drive.', score: 3 },
            { id: 'c4', text: 'Fly with a budget airline for the long leg and use a local bus for the last stretch.', score: 4 },
            { id: 'c5', text: 'Book a direct flight for speed and check one large suitcase for convenience.', score: 5 },
          ],
        },
        {
          id: 's2-m-2',
          text: 'You need to transport several boxes of supplies for your project. What do you do?',
          choices: [
            { id: 'c1', text: 'Ask a friend who is driving later to bring them for you.', score: 1 },
            { id: 'c2', text: 'Ship them via standard ground freight well in advance of your arrival.', score: 2 },
            { id: 'c3', text: 'Fit what you can in your luggage and plan to buy the rest locally.', score: 3 },
            { id: 'c4', text: 'Rent a small van for the trip to have space for everything.', score: 4 },
            { id: 'c5', text: 'Pay for extra checked baggage on your flight to bring them with you.', score: 5 },
          ],
        },
        {
          id: 's2-m-3',
          text: 'A friend offers to take you to the airport or train station. How do you respond?',
          choices: [
            { id: 'c1', text: 'Accept gratefully, as it\'s on their way to work.', score: 1 },
            { id: 'c2', text: 'Suggest meeting at a central transit hub to minimize their detour.', score: 2 },
            { id: 'c3', text: 'Ask them to pick you up very early to avoid traffic.', score: 3 },
            { id: 'c4', text: 'Politely decline and order a ride-share for door-to-door ease.', score: 4 },
            { id: 'c5', text: 'Accept and also ask for a quick stop elsewhere on the way.', score: 5 },
          ],
        },
        {
          id: 's2-m-4',
          text: 'Your flight has a long layover. How will you pass the time?',
          choices: [
            { id: 'c1', text: 'Stay airside and read a book, avoiding extra movement.', score: 1 },
            { id: 'c2', text: 'Take a short train into the city for a quick walk alone.', score: 2 },
            { id: 'c3', text: 'Take a bus to the nearest mall to do some last-minute shopping.', score: 3 },
            { id: 'c4', text: 'Meet a local friend who drives to the airport for a coffee.', score: 4 },
            { id: 'c5', text: 'Book a private capsule at an airport hotel to nap and shower.', score: 5 },
          ],
        },
        {
          id: 's2-m-5',
          text: 'How will you ensure you have local currency upon arrival?',
          choices: [
            { id: 'c1', text: 'Use your credit card for all purchases to get the best rate.', score: 1 },
            { id: 'c2', text: 'Withdraw a small amount from an ATM at the airport to get you started.', score: 2 },
            { id: 'c3', text: 'Order currency from your home bank a week before you leave.', score: 3 },
            { id: 'c4', text: 'Have a family member who traveled recently give you their leftovers.', score: 1 },
            { id: 'c5', text: 'Exchange a large sum at the airport kiosk for full convenience.', score: 5 },
          ],
        },
        {
          id: 's2-m-6',
          text: 'Your final destination is 50km from the main train station. How do you get there?',
          choices: [
            { id: 'c1', text: 'Take a local bus that connects directly to the village.', score: 1 },
            { id: 'c2', text: 'Pre-book a seat on a shuttle bus service with other volunteers.', score: 2 },
            { id: 'c3', text: 'Wait for a project coordinator who is picking up several people.', score: 1 },
            { id: 'c4', text: 'Use a ride-hailing app for a direct, private trip.', score: 4 },
            { id: 'c5', text: 'Rent a car at the station for flexibility during your stay.', score: 5 },
          ],
        },
      ],
      Food: [
        {
          id: 's2-f-1',
          text: 'What will you pack to eat during your long journey to the site?',
          choices: [
            { id: 'c1', text: 'A homemade veggie wrap and nuts in a reusable container.', score: 1 },
            { id: 'c2', text: 'A packaged protein bar and a banana for quick energy.', score: 2 },
            { id: 'c3', text: 'A store-bought sandwich and bag of chips from the station kiosk.', score: 3 },
            { id: 'c4', text: 'I\'ll just buy a hot meal and coffee on the train or plane.', score: 4 },
            { id: 'c5', text: 'A fast-food burger and soda from the airport food court.', score: 5 },
          ],
        },
        {
          id: 's2-f-2',
          text: 'How will you handle your first few meals upon arrival?',
          choices: [
            { id: 'c1', text: 'I\'ll accept an invitation to eat with my host family or project lead.', score: 1 },
            { id: 'c2', text: 'I\'ve packed some familiar snacks to tide me over until I can shop.', score: 2 },
            { id: 'c3', text: 'I\'ll find a local supermarket and buy basics to cook a simple meal.', score: 3 },
            { id: 'c4', text: 'I\'ll walk around and grab a bite from a casual-looking local eatery.', score: 4 },
            { id: 'c5', text: 'I\'ll order a pizza delivery to my new room to unwind.', score: 5 },
          ],
        },
        {
          id: 's2-f-3',
          text: 'What\'s your strategy for staying hydrated while traveling?',
          choices: [
            { id: 'c1', text: 'I\'ll bring an empty reusable bottle and fill it after security.', score: 1 },
            { id: 'c2', text: 'I don\'t worry about it; I\'ll drink when I\'m thirsty wherever I am.', score: 2 },
            { id: 'c3', text: 'I\'ll buy one large bottled water at the start of the trip.', score: 3 },
            { id: 'c4', text: 'I\'ll have a couple of small bottled drinks to sip on.', score: 4 },
            { id: 'c5', text: 'I\'ll get drinks on the plane/train or at cafes along the way.', score: 5 },
          ],
        },
        {
          id: 's2-f-4',
          text: 'You want to bring a taste of home. What do you pack?',
          choices: [
            { id: 'c1', text: 'Some homemade cookies for my new hosts, packed in a tin.', score: 1 },
            { id: 'c2', text: 'A few small packets of my favorite spices or tea blends.', score: 2 },
            { id: 'c3', text: 'A jar of a specialty food item I can\'t live without.', score: 3 },
            { id: 'c4', text: 'Nothing, I\'m excited to fully embrace the local food.', score: 1 },
            { id: 'c5', text: 'Multiple bags of snacks and comfort foods to last a month.', score: 5 },
          ],
        },
        {
          id: 's2-f-5',
          text: 'How will you get your groceries for the first week?',
          choices: [
            { id: 'c1', text: 'Walk to the nearest small market and carry back what I can.', score: 1 },
            { id: 'c2', text: 'Take a bus to a larger supermarket to stock up in one big trip.', score: 2 },
            { id: 'c3', text: 'Go to the local farmers\' market and buy fresh produce.', score: 1 },
            { id: 'c4', text: 'Order a large online delivery for convenience.', score: 4 },
            { id: 'c5', text: 'Drive to a big-box store outside of town for the best prices.', score: 5 },
          ],
        },
        {
          id: 's2-f-6',
          text: 'You\'re invited to a welcome potluck. What will you contribute?',
          choices: [
            { id: 'c1', text: 'I\'ll buy ingredients at a local farm stand and make something new.', score: 1 },
            { id: 'c2', text: 'I\'ll prepare a simple dish from my home country.', score: 2 },
            { id: 'c3', text: 'I\'ll offer to help with setup or cleanup instead of bringing food.', score: 1 },
            { id: 'c4', text: 'I\'ll pick up a pre-made salad or dessert from a supermarket.', score: 4 },
            { id: 'c5', text: 'I\'ll bring imported beers or sodas that everyone might like.', score: 5 },
          ],
        },
      ],
      Fashion: [
        {
          id: 's2-c-1',
          text: 'How will you assemble your core wardrobe for the year?',
          choices: [
            { id: 'c1', text: 'I\'ll pack only versatile items I already own and love.', score: 1 },
            { id: 'c2', text: 'I\'ll pack very light and rely on second-hand shopping abroad.', score: 2 },
            { id: 'c3', text: 'I\'ll buy a full new wardrobe from sustainable brands online.', score: 3 },
            { id: 'c4', text: 'I\'ll bring my basics but plan to buy a few new trendy pieces there.', score: 4 },
            { id: 'c5', text: 'I\'ll ship a large box of clothes ahead of me to ensure I have options.', score: 5 },
          ],
        },
        {
          id: 's2-c-2',
          text: 'What is your strategy for shoes?',
          choices: [
            { id: 'c1', text: 'I\'ll bring two pairs: sturdy walking shoes and one smarter pair.', score: 1 },
            { id: 'c2', text: 'I\'ll pack three pairs to cover sports, walking, and formal events.', score: 2 },
            { id: 'c3', text: 'I\'ll bring four pairs, including a pair of boots just in case.', score: 3 },
            { id: 'c4', text: 'I\'ll bring old shoes and plan to buy new, fashionable ones there.', score: 4 },
            { id: 'c5', text: 'I\'ll pack my favorite six pairs to match all my outfits.', score: 5 },
          ],
        },
        {
          id: 's2-c-3',
          text: 'What will you do with clothes you don\'t want to bring back?',
          choices: [
            { id: 'c1', text: 'I\'ll try to sell them online to other volunteers or students.', score: 1 },
            { id: 'c2', text: 'I\'ll donate them to a local charity shop if they\'re still wearable.', score: 2 },
            { id: 'c3', text: 'I\'ll leave them in the accommodation for the next person.', score: 3 },
            { id: 'c4', text: 'I\'ll pack everything I brought, no matter what.', score: 4 },
            { id: 'c5', text: 'I\'ll throw them away if they are worn out or stained.', score: 5 },
          ],
        },
        {
          id: 's2-c-4',
          text: 'How will you handle laundry during your stay?',
          choices: [
            { id: 'c1', text: 'I\'ll hand-wash small items in my room and air-dry them.', score: 1 },
            { id: 'c2', text: 'I\'ll wear items multiple times to reduce washing frequency.', score: 2 },
            { id: 'c3', text: 'I\'ll use a local laundromat and run full loads on a cold wash.', score: 3 },
            { id: 'c4', text: 'I\'ll use a weekly drop-off service for convenience.', score: 4 },
            { id: 'c5', text: 'I\'ll wash clothes frequently in hot water to ensure they\'re clean.', score: 5 },
          ],
        },
        {
          id: 's2-c-5',
          text: 'You need a formal outfit for a special event. What do you do?',
          choices: [
            { id: 'c1', text: 'I\'ll restyle and dress up the smartest outfit I brought.', score: 1 },
            { id: 'c2', text: 'I\'ll borrow something from another volunteer or a host.', score: 1 },
            { id: 'c3', text: 'I\'ll rent an outfit from a local service for the night.', score: 3 },
            { id: 'c4', text: 'I\'ll buy a new outfit from a high-street fashion chain.', score: 4 },
            { id: 'c5', text: 'I\'ll order several options online and return what I don\'t like.', score: 5 },
          ],
        },
        {
          id: 's2-c-6',
          text: 'What type of fabrics will make up most of your packed clothes?',
          choices: [
            { id: 'c1', text: 'A mix of natural fibers like cotton and wool that I already own.', score: 2 },
            { id: 'c2', text: 'New clothes made from recycled polyester and organic cotton.', score: 3 },
            { id: 'c3', text: 'A capsule wardrobe of high-quality natural fabrics I bought new.', score: 3 },
            { id: 'c4', text: 'Mostly synthetic blends because they are lightweight and don\'t wrinkle.', score: 4 },
            { id: 'c5', text: 'Whatever is clean and in my closet, I\'m not fussy about fabric.', score: 5 },
          ],
        },
      ],
      Digital: [
        {
          id: 's2-d-1',
          text: 'How will you stay in touch with family and friends back home?',
          choices: [
            { id: 'c1', text: 'Rely mostly on texting and occasional voice messages.', score: 1 },
            { id: 'c2', text: 'Send a detailed email update every couple of weeks with photos.', score: 2 },
            { id: 'c3', text: 'Schedule a weekly video call and use messaging in between.', score: 3 },
            { id: 'c4', text: 'Have brief video calls multiple times a week to chat.', score: 4 },
            { id: 'c5', text: 'Post daily stories on social media so everyone can see.', score: 4 },
          ],
        },
        {
          id: 's2-d-2',
          text: 'How will you navigate your new city and country?',
          choices: [
            { id: 'c1', text: 'Buy a paper map and ask locals for directions.', score: 1 },
            { id: 'c2', text: 'Use offline downloaded maps on my phone to save data.', score: 2 },
            { id: 'c3', text: 'Use public transport apps that show live schedules.', score: 3 },
            { id: 'c4', text: 'Figure it out by exploring on foot and learning the routes.', score: 1 },
            { id: 'c5', text: 'Use real-time GPS navigation on my phone for every trip.', score: 5 },
          ],
        },
        {
          id: 's2-d-3',
          text: 'How will you back up the photos you take during your year?',
          choices: [
            { id: 'c1', text: 'I\'ll mostly just keep them on my phone\'s memory card.', score: 1 },
            { id: 'c2', text: 'I\'ll transfer photos to my laptop and an external hard drive monthly.', score: 2 },
            { id: 'c3', text: 'I\'ll upload selected photos to a cloud service once a week.', score: 3 },
            { id: 'c4', text: 'I\'ll use multiple cloud services for redundancy.', score: 4 },
            { id: 'c5', text: 'I\'ll set my phone to auto-upload all photos and videos to the cloud.', score: 5 },
          ],
        },
        {
          id: 's2-d-4',
          text: 'What will you do for entertainment in your downtime?',
          choices: [
            { id: 'c1', text: 'Read books, explore my surroundings, and talk to people.', score: 1 },
            { id: 'c2', text: 'Download movies and shows to watch offline.', score: 2 },
            { id: 'c3', text: 'Listen to downloaded podcasts or music playlists.', score: 2 },
            { id: 'c4', text: 'Stream movies and series online when I have good Wi-Fi.', score: 4 },
            { id: 'c5', text: 'Play online multiplayer games most evenings.', score: 5 },
          ],
        },
        {
          id: 's2-d-5',
          text: 'You need a local phone number. What\'s your plan?',
          choices: [
            { id: 'c1', text: 'I\'ll rely on Wi-Fi and use messaging apps instead.', score: 1 },
            { id: 'c2', text: 'I\'ll buy a local SIM card with a basic data plan.', score: 2 },
            { id: 'c3', text: 'I\'ll buy a cheap second-hand phone and a local SIM.', score: 3 },
            { id: 'c4', text: 'I\'ll use an eSIM with a flexible global data package.', score: 4 },
            { id: 'c5', text: 'I\'ll get an expensive international plan from my home provider.', score: 5 },
          ],
        },
        {
          id: 's2-d-6',
          text: 'How will you research and learn about local customs and events?',
          choices: [
            { id: 'c1', text: 'I\'ll talk to locals and my project coordinators.', score: 1 },
            { id: 'c2', text: 'I\'ll pick up a physical guidebook or local newspaper.', score: 1 },
            { id: 'c3', text: 'I\'ll join local community groups on social media.', score: 3 },
            { id: 'c4', text: 'I\'ll set up Google Alerts for the town name.', score: 4 },
            { id: 'c5', text: 'I\'ll spend time each day browsing relevant websites and blogs.', score: 3 },
          ],
        },
      ]
    }
  },
  {
    id: 's3',
    title: 'Dating',
    icon: 'heart',
    color: 'bg-rose-500',
    description: "CHALLENGE: Values-Based Romance Match! After weeks of chatting, it's time for the first date. You want to make an impression but also be consistent with your values. On this date, every choice counts: Charm or consciousness? Chemistry or considerate choices? Your chance to find someone who shares your principles!",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/date.svg',
    questions: {
      Mobility: [
        {
          id: 's3-m-1',
          text: 'How do you plan your travel to the date location?',
          choices: [
            { id: 'c1', text: 'Walk or cycle, checking the route on an offline map app.', score: 1 },
            { id: 'c2', text: 'Take a direct bus or tram line.', score: 2 },
            { id: 'c3', text: 'Coordinate a carpool if your date is driving that way.', score: 3 },
            { id: 'c4', text: 'Use a ride-hailing app just for yourself.', score: 4 },
            { id: 'c5', text: 'Drive your own car alone for maximum convenience.', score: 5 },
          ],
        },
        {
          id: 's3-m-2',
          text: 'The forecast predicts rain for your date. What\'s your plan?',
          choices: [
            { id: 'c1', text: 'Wear waterproof gear and cycle or walk anyway.', score: 1 },
            { id: 'c2', text: 'Take public transport with an umbrella or raincoat.', score: 2 },
            { id: 'c3', text: 'Politely ask your date if they could give you a lift.', score: 3 },
            { id: 'c4', text: 'Book a taxi or ride-hailing service to stay dry.', score: 4 },
            { id: 'c5', text: 'Borrow a car to avoid getting wet entirely.', score: 5 },
          ],
        },
        {
          id: 's3-m-3',
          text: 'The date location is across town. How do you get there?',
          choices: [
            { id: 'c1', text: 'Cycle or walk if the distance is reasonable.', score: 1 },
            { id: 'c2', text: 'Use a direct public transport route.', score: 2 },
            { id: 'c3', text: 'Share a ride with your date if they are driving.', score: 3 },
            { id: 'c4', text: 'Use a ride-hailing service for a solo trip.', score: 4 },
            { id: 'c5', text: 'Drive your own car, even for a short distance.', score: 5 },
          ],
        },
        {
          id: 's3-m-4',
          text: 'The date might run late. How will you get home safely?',
          choices: [
            { id: 'c1', text: 'Plan a safe walking/cycling route home with lights.', score: 1 },
            { id: 'c2', text: 'Check and use the last available night bus or tram.', score: 2 },
            { id: 'c3', text: 'Arrange to share a taxi or ride with your date.', score: 3 },
            { id: 'c4', text: 'Book a solo taxi for door-to-door convenience.', score: 4 },
            { id: 'c5', text: 'Drive yourself home alone, even if you\'re tired.', score: 5 },
          ],
        },
        {
          id: 's3-m-5',
          text: 'You want to bring a small gift. How do you acquire it?',
          choices: [
            { id: 'c1', text: 'Pick a local, low-impact gift on your way by foot/bike.', score: 1 },
            { id: 'c2', text: 'Buy it along your public transport route.', score: 2 },
            { id: 'c3', text: 'Order from a local vendor with standard delivery.', score: 3 },
            { id: 'c4', text: 'Make a special trip by car to a distant boutique.', score: 4 },
            { id: 'c5', text: 'Use express same-day shipping for a unique item.', score: 5 },
          ],
        },
        {
          id: 's3-m-6',
          text: 'Your date suggests an activity that requires going to another location. How do you travel?',
          choices: [
            { id: 'c1', text: 'Suggest a walking distance alternative to avoid extra travel.', score: 1 },
            { id: 'c2', text: 'Look up a direct public transport connection.', score: 2 },
            { id: 'c3', text: 'See if you can combine the trip with other errands.', score: 3 },
            { id: 'c4', text: 'Use a ride-hailing app for the quickest option.', score: 4 },
            { id: 'c5', text: 'Drive separately to the new location.', score: 5 },
          ],
        },
      ],
      Food: [
        {
          id: 's3-f-1',
          text: "You're planning a picnic date. What food do you bring?",
          choices: [
            { id: 'c1', text: 'Homemade snacks with local veggies and dips in reusable containers.', score: 1 },
            { id: 'c2', text: 'A homemade pie and baked muffins from market ingredients.', score: 2 },
            { id: 'c3', text: 'A pre-made pasta salad and drinks in cans from a supermarket.', score: 3 },
            { id: 'c4', text: 'Grab fast food and lay it out on napkins.', score: 4 },
            { id: 'c5', text: 'Individually packaged gas station snacks and plastic bottles.', score: 5 },
          ],
        },
        {
          id: 's3-f-2',
          text: 'You\'re cooking a surprise dinner. What\'s your ingredient plan?',
          choices: [
            { id: 'c1', text: 'Use foraged herbs and local, seasonal produce.', score: 1 },
            { id: 'c2', text: 'Buy a mix of fresh market and supermarket items.', score: 2 },
            { id: 'c3', text: 'Get ingredients for a classic lasagna from the closest store.', score: 3 },
            { id: 'c4', text: 'Use boxed mac-and-cheese and pre-made sauces.', score: 4 },
            { id: 'c5', text: 'Buy exotic, imported ingredients to impress.', score: 5 },
          ],
        },
        {
          id: 's3-f-3',
          text: 'Your date brings packaged snacks. How do you respond?',
          choices: [
            { id: 'c1', text: 'Challenge them to a homemade snack competition next time.', score: 1 },
            { id: 'c2', text: 'Suggest bringing unpackaged snacks like fruit next time.', score: 2 },
            { id: 'c3', text: 'Bring some fruit to balance it out and enjoy their offering.', score: 3 },
            { id: 'c4', text: 'Shrug and eat whatever they brought.', score: 4 },
            { id: 'c5', text: 'Match their energy with more packaged cookies.', score: 5 },
          ],
        },
        {
          id: 's3-f-4',
          text: 'You have leftovers from your meal. What do you do?',
          choices: [
            { id: 'c1', text: 'You brought a container; take them home for tomorrow.', score: 1 },
            { id: 'c2', text: 'Share the extra food with your housemates.', score: 2 },
            { id: 'c3', text: 'Try to find recycling bins for the packaging.', score: 3 },
            { id: 'c4', text: 'Box it up but probably forget it later.', score: 4 },
            { id: 'c5', text: 'Throw it away to avoid looking frugal.', score: 5 },
          ],
        },
        {
          id: 's3-f-5',
          text: 'What drinks do you serve with your home-cooked meal?',
          choices: [
            { id: 'c1', text: 'Tap water and homemade infused water or kombucha.', score: 1 },
            { id: 'c2', text: 'Homemade juice or punch in a large pitcher.', score: 2 },
            { id: 'c3', text: 'A mix of store-bought and homemade drinks.', score: 3 },
            { id: 'c4', text: 'Large plastic bottles of soda and juice.', score: 4 },
            { id: 'c5', text: 'Individual plastic bottles for everyone.', score: 5 },
          ],
        },
        {
          id: 's3-f-6',
          text: 'How do you handle your date\'s dietary preferences?',
          choices: [
            { id: 'c1', text: 'Create one amazing dish that suits all dietary needs.', score: 1 },
            { id: 'c2', text: 'Make a mixed snack tray based on their preferences.', score: 2 },
            { id: 'c3', text: 'Offer separate meat and vegetarian options.', score: 3 },
            { id: 'c4', text: 'Hope for the best and don\'t ask.', score: 4 },
            { id: 'c5', text: 'Ignore them; good food is for everyone.', score: 5 },
          ],
        },
      ],
      Fashion: [
        {
          id: 's3-c-1',
          text: 'Where do you look for an outfit for this important date?',
          choices: [
            { id: 'c1', text: 'Find something great you already own and love.', score: 1 },
            { id: 'c2', text: 'Borrow a special outfit from a close friend.', score: 2 },
            { id: 'c3', text: 'Hunt for a unique piece in local second-hand shops.', score: 3 },
            { id: 'c4', text: 'Buy a new organic cotton outfit online.', score: 4 },
            { id: 'c5', text: 'Buy a new, trendy outfit from a fast-fashion brand.', score: 5 },
          ],
        },
        {
          id: 's3-c-2',
          text: 'How do you choose what fabrics to wear?',
          choices: [
            { id: 'c1', text: 'Wear natural fibers from clothes already in your wardrobe.', score: 1 },
            { id: 'c2', text: 'Choose hemp or organic cotton from a local maker.', score: 2 },
            { id: 'c3', text: 'Opt for imported organic linen or cotton.', score: 3 },
            { id: 'c4', text: 'Pick a polyester blend with some recycled content.', score: 4 },
            { id: 'c5', text: 'Choose 100% synthetic for a wrinkle-free, sleek look.', score: 5 },
          ],
        },
        {
          id: 's3-c-3',
          text: 'Your date suggests an activity you\'re not dressed for. What now?',
          choices: [
            { id: 'c1', text: 'Adapt your outfit by layering versatile items you have.', score: 1 },
            { id: 'c2', text: 'Wear your high-quality, repairable jacket.', score: 2 },
            { id: 'c3', text: 'Buy a second-hand jacket locally if needed.', score: 3 },
            { id: 'c4', text: 'Quickly buy an eco-certified jacket online.', score: 4 },
            { id: 'c5', text: 'Buy a new, cheap jacket for this one occasion.', score: 5 },
          ],
        },
        {
          id: 's3-c-4',
          text: 'How do you accessorize your look?',
          choices: [
            { id: 'c1', text: 'Use accessories you already own.', score: 1 },
            { id: 'c2', text: 'Borrow jewelry from friends or family.', score: 2 },
            { id: 'c3', text: 'Choose locally made, natural-material accessories.', score: 3 },
            { id: 'c4', text: 'Buy recycled metal accessories shipped from abroad.', score: 4 },
            { id: 'c5', text: 'Buy new bracelets and earrings to complete the look.', score: 5 },
          ],
        },
        {
          id: 's3-c-5',
          text: 'How do you prepare your chosen outfit?',
          choices: [
            { id: 'c1', text: 'Air-dry clothes and use minimal energy for prep.', score: 1 },
            { id: 'c2', text: 'Air-dry and steam clothes instead of ironing.', score: 2 },
            { id: 'c3', text: 'Air-dry and iron only the necessary parts.', score: 3 },
            { id: 'c4', text: 'Air-dry but still iron everything meticulously.', score: 4 },
            { id: 'c5', text: 'Use a tumble dryer and iron everything twice.', score: 5 },
          ],
        },
        {
          id: 's3-c-6',
          text: 'You spill a drink on your shirt. What\'s the plan?',
          choices: [
            { id: 'c1', text: 'Spot clean it immediately and keep wearing it.', score: 1 },
            { id: 'c2', text: 'Hand wash it when you get home and air dry.', score: 2 },
            { id: 'c3', text: 'Take it to an eco-friendly dry cleaner.', score: 3 },
            { id: 'c4', text: 'Take it to a standard chemical dry cleaner.', score: 4 },
            { id: 'c5', text: 'Toss it and buy a new one.', score: 5 },
          ],
        },
      ],
      Digital: [
        {
          id: 's3-d-1',
          text: 'How do you research potential date ideas and locations?',
          choices: [
            { id: 'c1', text: 'Ask friends for recommendations and use a paper map.', score: 1 },
            { id: 'c2', text: 'Do a quick online search and download an offline guide.', score: 2 },
            { id: 'c3', text: 'Browse multiple websites and apps for ideas.', score: 3 },
            { id: 'c4', text: 'Watch extensive video reviews of every option.', score: 4 },
            { id: 'c5', text: 'Livestream from potential venues to get a real-time look.', score: 5 },
          ],
        },
        {
          id: 's3-d-2',
          text: 'How will you navigate to the date?',
          choices: [
            { id: 'c1', text: 'Memorize the route or write down directions beforehand.', score: 1 },
            { id: 'c2', text: 'Download an offline map to your phone the night before.', score: 2 },
            { id: 'c3', text: 'Use GPS navigation on your phone during the trip.', score: 3 },
            { id: 'c4', text: 'Run multiple navigation apps to compare routes and traffic.', score: 4 },
            { id: 'c5', text: 'Stream live traffic updates with GPS on all day.', score: 5 },
          ],
        },
        {
          id: 's3-d-3',
          text: 'How do you communicate before the date?',
          choices: [
            { id: 'c1', text: 'A brief call or text to confirm time and place.', score: 1 },
            { id: 'c2', text: 'Send a few thoughtful messages to build anticipation.', score: 2 },
            { id: 'c3', text: 'Text regularly with some photo sharing.', score: 3 },
            { id: 'c4', text: 'Constantly message throughout the day on multiple apps.', score: 4 },
            { id: 'c5', text: 'Maintain a continuous conversation with live video clips.', score: 5 },
          ],
        },
        {
          id: 's3-d-4',
          text: 'How do you handle photos about the date?',
          choices: [
            { id: 'c1', text: 'Be present; take one or two meaningful photos for memory.', score: 1 },
            { id: 'c2', text: 'Take a few nice photos to share later.', score: 2 },
            { id: 'c3', text: 'Take photos and videos throughout the evening.', score: 3 },
            { id: 'c4', text: 'Post stories on social media in real-time.', score: 4 },
            { id: 'c5', text: 'Vlog the entire experience for your followers.', score: 5 },
          ],
        },
        {
          id: 's3-d-5',
          text: 'How will you choose and play music at your place?',
          choices: [
            { id: 'c1', text: 'Play a playlist already stored on your device.', score: 1 },
            { id: 'c2', text: 'Use a Bluetooth speaker with a stored playlist.', score: 2 },
            { id: 'c3', text: 'Stream a pre-existing playlist from your account.', score: 3 },
            { id: 'c4', text: 'Create a new online playlist to stream.', score: 4 },
            { id: 'c5', text: 'Stream a continuous high-definition music video playlist.', score: 5 },
          ],
        },
        {
          id: 's3-d-6',
          text: 'How do you follow up after a great date?',
          choices: [
            { id: 'c1', text: 'Send a simple, genuine thank you text the next day.', score: 1 },
            { id: 'c2', text: 'Send a thank you message and connect on one social platform.', score: 2 },
            { id: 'c3', text: 'Message on a couple of platforms and share a photo.', score: 3 },
            { id: 'c4', text: 'Create and share a post about your nice evening.', score: 4 },
            { id: 'c5', text: 'Make a thank-you video and tag them extensively online.', score: 5 },
          ],
        },
      ]
    }
  },
   {
    id: 's4',
    title: 'Preparing a Birthday Party',
    icon: 'cake',
    color: 'bg-purple-500',
    description: "",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/party.svg',
    questions: {
      Mobility: [
        {
          id: 's4-m-1',
          text: "Choosing a venue for your friend's party. What's your priority for guest arrival?",
          choices: [
            { id: 'c1', text: 'A spot within walking or biking distance for almost everyone.', score: 1 },
            { id: 'c2', text: 'A local hall with excellent and frequent tram connections.', score: 2 },
            { id: 'c3', text: 'A space a bit further out, but right next to a major bus interchange.', score: 3 },
            { id: 'c4', text: 'A cool bar in the suburbs, easiest to reach by car.', score: 4 },
            { id: 'c5', text: 'A unique, upscale venue in the countryside for a special experience.', score: 5 },
          ],
        },
        {
          id: 's4-m-2',
          text: 'How do you encourage guests to share rides to the party?',
          choices: [
            { id: 'c1', text: 'Plan a fun group bike meet-up and map the route for everyone.', score: 1 },
            { id: 'c2', text: 'Include a one-day public transit pass with their invitation.', score: 2 },
            { id: 'c3', text: 'Start a shared list in the group chat for drivers and passengers to connect.', score: 3 },
            { id: 'c4', text: 'Just mention that parking will be very limited near the venue.', score: 4 },
            { id: 'c5', text: 'Reassure everyone there\'s ample free parking available on site.', score: 5 },
          ],
        },
        {
          id: 's4-m-3',
          text: 'You need to get party decorations and supplies. How do you handle it?',
          choices: [
            { id: 'c1', text: 'Borrow items from friends nearby and transport them by bike or foot.', score: 1 },
            { id: 'c2', text: 'Order from a low-waste local shop and use a bike courier for pickup.', score: 2 },
            { id: 'c3', text: 'Buy what you need from the corner store and carry it home yourself.', score: 3 },
            { id: 'c4', text: 'Take a single ride-share trip to a large party store for a big haul.', score: 4 },
            { id: 'c5', text: 'Drive to a huge out-of-town supermarket to get everything in one go.', score: 5 },
          ],
        },
        {
          id: 's4-m-4',
          text: 'How do you schedule the party\'s start time for guest convenience?',
          choices: [
            { id: 'c1', text: 'Saturday afternoon, during peak service frequency on main transit lines.', score: 1 },
            { id: 'c2', text: 'Friday evening, when evening buses are still running, though less often.', score: 2 },
            { id: 'c3', text: 'Saturday midday, some might need to arrange specific rides.', score: 3 },
            { id: 'c4', text: 'Late Sunday night, when direct public transport options are unavailable.', score: 4 },
            { id: 'c5', text: 'A unique weekday midnight timeslot, making driving the only option.', score: 5 },
          ],
        },
        {
          id: 's4-m-5',
          text: 'A guest uses a wheelchair. How do you ensure they can attend?',
          choices: [
            { id: 'c1', text: 'Book a dedicated accessible shuttle service for their round trip.', score: 1 },
            { id: 'c2', text: 'Reserve a shared accessible taxi and split the cost with the group.', score: 2 },
            { id: 'c3', text: 'Ask a friend with a suitable vehicle if they can provide a ride.', score: 3 },
            { id: 'c4', text: 'Suggest they book a standard taxi and hope it can accommodate them.', score: 4 },
            { id: 'c5', text: 'Assume they will make their own arrangements to get there.', score: 5 },
          ],
        },
        {
          id: 's4-m-6',
          text: 'The party is over. How do you handle cleanup and returning rentals?',
          choices: [
            { id: 'c1', text: 'Form teams to clean with reusable supplies, donate food, bike rentals back.', score: 1 },
            { id: 'c2', text: 'Return rentals together via tram and share leftovers with neighbours.', score: 2 },
            { id: 'c3', text: 'Drive rentals back the next day and bag leftovers for disposal.', score: 3 },
            { id: 'c4', text: 'Leave leftover food and rental items for the venue staff to handle.', score: 4 },
            { id: 'c5', text: 'Leave everything behind and let the venue charge a cleaning fee.', score: 5 },
          ],
        },
      ],
      Food: [
        {
          id: 's4-f-1',
          text: 'You\'re bringing the birthday cake. What kind do you choose?',
          choices: [
            { id: 'c1', text: 'Bake it yourself using ingredients from nearby farms.', score: 1 },
            { id: 'c2', text: 'Buy a fresh, simple cake from the bakery down the street.', score: 2 },
            { id: 'c3', text: 'Pick up a standard, pre-made cake from the supermarket.', score: 3 },
            { id: 'c4', text: 'Order an elaborate custom cake with imported specialty ingredients.', score: 4 },
            { id: 'c5', text: 'Get a huge, multi-tiered novelty cake shipped from afar overnight.', score: 5 },
          ],
        },
        {
          id: 's4-f-2',
          text: 'Friends are bringing food. How do you coordinate the dishes?',
          choices: [
            { id: 'c1', text: 'Create a detailed sign-up sheet to ensure a perfect balance.', score: 1 },
            { id: 'c2', text: 'Ask each person to make their signature homemade dish.', score: 2 },
            { id: 'c3', text: 'Suggest broad categories and let friends choose what to bring.', score: 3 },
            { id: 'c4', text: 'Tell everyone to bring whatever they want, hoping it works out.', score: 4 },
            { id: 'c5', text: 'Don\'t coordinate; let people bring whatever and however much they like.', score: 5 },
          ],
        },
        {
          id: 's4-f-3',
          text: 'How will you serve the food and drinks at the party?',
          choices: [
            { id: 'c1', text: 'Use your own regular plates, glasses, and cloth napkins.', score: 1 },
            { id: 'c2', text: 'Rent nice dishware and return it the next day using public transport.', score: 2 },
            { id: 'c3', text: 'Use a mix of your bowls and compostable paper cups for drinks.', score: 3 },
            { id: 'c4', text: 'Buy a pack of disposable plastic plates and cups for easy cleanup.', score: 4 },
            { id: 'c5', text: 'Grab cheap, single-use everything and throw it all away after.', score: 5 },
          ],
        },
        {
          id: 's4-f-4',
          text: 'You\'re providing drinks. How do you source and serve them?',
          choices: [
            { id: 'c1', text: 'Make large pitchers of homemade iced tea and lemonade.', score: 1 },
            { id: 'c2', text: 'Get a keg of beer and ask guests to bring their own cups.', score: 2 },
            { id: 'c3', text: 'Buy bottled drinks in glass and provide reusable cups.', score: 3 },
            { id: 'c4', text: 'Purchase large plastic bottles of soda and stack of disposable cups.', score: 4 },
            { id: 'c5', text: 'Offer individual cans and small plastic water bottles.', score: 5 },
          ],
        },
        {
          id: 's4-f-5',
          text: 'There\'s a lot of food left over. What\'s your plan?',
          choices: [
            { id: 'c1', text: 'Have containers ready so guests can take portions home.', score: 1 },
            { id: 'c2', text: 'Arrange to donate the untouched leftovers to a community fridge.', score: 2 },
            { id: 'c3', text: 'Compost what you can and dispose of the rest.', score: 3 },
            { id: 'c4', text: 'Throw all the leftover food into the general trash bin.', score: 4 },
            { id: 'c5', text: 'Leave it all for the cleaning crew to deal with.', score: 5 },
          ],
        },
        {
          id: 's4-f-6',
          text: 'Several guests have dietary restrictions. How do you prepare?',
          choices: [
            { id: 'c1', text: 'Ask for allergies beforehand and clearly label all dishes.', score: 1 },
            { id: 'c2', text: 'Focus on making simple dishes that are naturally allergen-free.', score: 2 },
            { id: 'c3', text: 'Order a few special diet-friendly items from a caterer.', score: 3 },
            { id: 'c4', text: 'Mention the restrictions but let guests navigate the food themselves.', score: 4 },
            { id: 'c5', text: 'Proceed normally and assume they\'ll find something to eat.', score: 5 },
          ],
        },
      ],
      Fashion: [
        {
          id: 's4-c-1',
          text: 'You want a new outfit for the party. Where do you get it?',
          choices: [
            { id: 'c1', text: 'Host a clothing swap with friends to find something "new".', score: 1 },
            { id: 'c2', text: 'Spend an afternoon hunting for a unique piece at a vintage store.', score: 2 },
            { id: 'c3', text: 'Rent a stylish outfit from a local rental service for the night.', score: 3 },
            { id: 'c4', text: 'Order a new shirt from a sustainable brand with fast shipping.', score: 4 },
            { id: 'c5', text: 'Buy a cheap, trendy top from a fast-fashion retailer.', score: 5 },
          ],
        },
        {
          id: 's4-c-2',
          text: 'You want to gift a wearable item. Where do you shop?',
          choices: [
            { id: 'c1', text: 'Find a one-of-a-kind handmade accessory at a local craft market.', score: 1 },
            { id: 'c2', text: 'Hunt for a high-quality second-hand jacket from a curated boutique.', score: 2 },
            { id: 'c3', text: 'Order a piece from a small, independent designer online.', score: 3 },
            { id: 'c4', text: 'Buy a new accessory from a popular fast-fashion website.', score: 4 },
            { id: 'c5', text: 'Grab a mass-produced item from a big-box store.', score: 5 },
          ],
        },
        {
          id: 's4-c-3',
          text: 'The party has a theme. How do you make your outfit match?',
          choices: [
            { id: 'c1', text: 'Get creative and style existing clothes to fit the theme.', score: 1 },
            { id: 'c2', text: 'Borrow a key accessory or item from a friend\'s closet.', score: 2 },
            { id: 'c3', text: 'Rent a specific themed piece from a costume shop.', score: 3 },
            { id: 'c4', text: 'Order a new costume online with express delivery.', score: 4 },
            { id: 'c5', text: 'Buy a cheap plastic costume set to wear once.', score: 5 },
          ],
        },
        {
          id: 's4-c-4',
          text: 'How do you choose your makeup and accessories for the party?',
          choices: [
            { id: 'c1', text: 'Use your favourite long-lasting products you already own.', score: 1 },
            { id: 'c2', text: 'Borrow a friend\'s glitter palette and use a sample-size fragrance.', score: 2 },
            { id: 'c3', text: 'Buy a new, reusable headband from a local maker.', score: 3 },
            { id: 'c4', text: 'Purchase a new eyeshadow palette and single-use false lashes.', score: 4 },
            { id: 'c5', text: 'Use heavy glitter sprays and disposable applicators.', score: 5 },
          ],
        },
        {
          id: 's4-c-5',
          text: 'You get a food stain on your clothes during the party. What now?',
          choices: [
            { id: 'c1', text: 'Gently blot it and do a proper spot-clean when you get home.', score: 1 },
            { id: 'c2', text: 'Hand-wash the item that night and let it air-dry.', score: 2 },
            { id: 'c3', text: 'Take it to a green-certified dry cleaner next week.', score: 3 },
            { id: 'c4', text: 'Use a drive-thru dry-cleaner with harsh chemical solvents.', score: 4 },
            { id: 'c5', text: 'Decide the outfit is ruined and throw it away.', score: 5 },
          ],
        },
        {
          id: 's4-c-6',
          text: 'After the party, what do you do with your outfit?',
          choices: [
            { id: 'c1', text: 'Integrate it into your regular wardrobe for future events.', score: 1 },
            { id: 'c2', text: 'Store it carefully for potential reuse at another themed party.', score: 2 },
            { id: 'c3', text: 'Donate it so someone else can get use out of it.', score: 3 },
            { id: 'c4', text: 'Try to sell it online to recoup some of the cost.', score: 4 },
            { id: 'c5', text: 'Discard it after one wear because it\'s no longer novel.', score: 5 },
          ],
        },
      ],
      Digital: [
        {
          id: 's4-d-1',
          text: 'You want to give a digital gift. How do you deliver it?',
          choices: [
            { id: 'c1', text: 'Email a gift card for their favourite local cafe with a personal note.', score: 1 },
            { id: 'c2', text: 'Gift them an e-book or album from your digital library.', score: 2 },
            { id: 'c3', text: 'Send a subscription voucher for a music or movie streaming service.', score: 3 },
            { id: 'c4', text: 'Order a new physical gadget to be delivered to their door.', score: 4 },
            { id: 'c5', text: 'Get a smart device that requires constant cloud updates and energy.', score: 5 },
          ],
        },
        {
          id: 's4-d-2',
          text: 'How will you coordinate the party plans with the group?',
          choices: [
            { id: 'c1', text: 'Make a quick group phone call to decide on key details.', score: 1 },
            { id: 'c2', text: 'Use one existing group chat on your primary messaging app.', score: 2 },
            { id: 'c3', text: 'Start an email chain and check it a couple of times a day.', score: 3 },
            { id: 'c4', text: 'Create a new event on a social media platform with many notifications.', score: 4 },
            { id: 'c5', text: 'Message everyone individually across 3-4 different apps all day.', score: 5 },
          ],
        },
        {
          id: 's4-d-3',
          text: 'You need custom decorations like banners. How do you make them?',
          choices: [
            { id: 'c1', text: 'Hand-draw and paint signs on the back of old cardboard boxes.', score: 1 },
            { id: 'c2', text: 'Design them yourself and print at a local shop on recycled paper.', score: 2 },
            { id: 'c3', text: 'Get basic prints from the nearest copy shop on standard paper.', score: 3 },
            { id: 'c4', text: 'Order high-quality, large-format prints for next-day delivery.', score: 4 },
            { id: 'c5', text: 'Set up digital screens to display animated graphics all night.', score: 5 },
          ],
        },
        {
          id: 's4-d-4',
          text: 'It\'s time to send the invitations. What\'s your method?',
          choices: [
            { id: 'c1', text: 'Drop a handwritten note in the mail or deliver it in person.', score: 1 },
            { id: 'c2', text: 'Send one simple message to the existing group chat.', score: 2 },
            { id: 'c3', text: 'Email a nice digital invitation to each guest individually.', score: 3 },
            { id: 'c4', text: 'Use a specialized online service with fancy designs and RSVP tracking.', score: 4 },
            { id: 'c5', text: 'Create and post a video invitation on all your social networks.', score: 5 },
          ],
        },
        {
          id: 's4-d-5',
          text: 'How will you provide music for the party?',
          choices: [
            { id: 'c1', text: 'Play a downloaded playlist from your phone on a small speaker.', score: 1 },
            { id: 'c2', text: 'Stream a playlist from a standard account over Wi-Fi.', score: 2 },
            { id: 'c3', text: 'Stream high-quality audio to multiple speakers via Bluetooth.', score: 3 },
            { id: 'c4', text: 'Use a live streaming service that constantly updates the playlist.', score: 4 },
            { id: 'c5', text: 'Run synchronized video playlists on multiple large smart displays.', score: 5 },
          ],
        },
        {
          id: 's4-d-6',
          text: 'How do you share the party photos with everyone afterwards?',
          choices: [
            { id: 'c1', text: 'Collect photos on a USB drive and pass it around to friends.', score: 1 },
            { id: 'c2', text: 'Upload them to one shared cloud folder and send the link.', score: 2 },
            { id: 'c3', text: 'Post them in the private group chat for everyone to save.', score: 3 },
            { id: 'c4', text: 'Set photos to auto-sync to multiple social media accounts.', score: 4 },
            { id: 'c5', text: 'Live-stream a highlight reel on public social platforms.', score: 5 },
          ],
        },
      ]
    }
  },
  {
    id: 's5',
    title: 'Discovering a New Place to Travel',
    icon: 'planet',
    color: 'bg-amber-500',
    description: "CHALLENGE: The conscious adventure. Two weeks of freedom, a world to explore. Overtourism is overwhelming local communities, but you want your chance to discover new places. How do you experience an authentic adventure that is curious but not careless, that creates memories without exploiting destinations?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/travel.svg',
    questions: {
      Mobility: [
        {
          id: 's5-m-1',
          text: 'Your dream destination is 500 km away. How do you get there?',
          choices: [
            { id: 'c1', text: 'Take a direct train or coach journey.', score: 1 },
            { id: 'c2', text: 'Organise a carpool with friends to drive there together.', score: 2 },
            { id: 'c3', text: 'Drive alone in your own car for maximum flexibility.', score: 3 },
            { id: 'c4', text: 'Book a flight with one layover to save a little money.', score: 4 },
            { id: 'c5', text: 'Book the fastest, most direct flight available.', score: 5 },
          ],
        },
        {
          id: 's5-m-2',
          text: 'How will you explore your destination once you arrive?',
          choices: [
            { id: 'c1', text: 'Walk or cycle to most places within the city.', score: 1 },
            { id: 'c2', text: 'Buy a pass for local trams and buses.', score: 2 },
            { id: 'c3', text: 'Use ride-share apps for longer trips across town.', score: 3 },
            { id: 'c4', text: 'Rent an e-scooter for quick and fun point-to-point travel.', score: 4 },
            { id: 'c5', text: 'Rent a car for the entire two weeks for total freedom.', score: 5 },
          ],
        },
        {
          id: 's5-m-3',
          text: 'A must-see natural site is 50 km from your hotel. How do you visit?',
          choices: [
            { id: 'c1', text: 'Join a guided group tour that uses a small bus.', score: 1 },
            { id: 'c2', text: 'Take a local train or bus to the nearest town and walk.', score: 2 },
            { id: 'c3', text: 'Rent a car for just that day to see more sights.', score: 3 },
            { id: 'c4', text: 'Book a private taxi for a comfortable door-to-door trip.', score: 4 },
            { id: 'c5', text: 'Hire a helicopter tour for a unique aerial view.', score: 5 },
          ],
        },
        {
          id: 's5-m-4',
          text: 'You realise you forgot to pack sunscreen. How do you get it?',
          choices: [
            { id: 'c1', text: 'Buy a locally produced, plastic-free brand from a shop you walk past.', score: 1 },
            { id: 'c2', text: 'Go to a pharmacy near your hotel during your next outing.', score: 2 },
            { id: 'c3', text: 'Order it online with standard delivery to your accommodation.', score: 3 },
            { id: 'c4', text: 'Take a taxi to a specific large supermarket to get your favourite brand.', score: 4 },
            { id: 'c5', text: 'Use a ride-share app to have it delivered express within the hour.', score: 5 },
          ],
        },
        {
          id: 's5-m-5',
          text: 'How do you ensure you never get lost in the new city?',
          choices: [
            { id: 'c1', text: 'Use a paper map and ask locals for directions.', score: 1 },
            { id: 'c2', text: 'Download offline maps on your phone to use without data.', score: 2 },
            { id: 'c3', text: 'Use your phone\'s GPS navigation sparingly for key journeys.', score: 3 },
            { id: 'c4', text: 'Keep your mobile data and GPS on constantly to track your route.', score: 4 },
            { id: 'c5', text: 'Rent a portable Wi-Fi hotspot to stream maps and info all day.', score: 5 },
          ],
        },
        {
          id: 's5-m-6',
          text: 'You want to visit three cities in two weeks. How do you plan the route?',
          choices: [
            { id: 'c1', text: 'Choose cities connected by direct train lines.', score: 1 },
            { id: 'c2', text: 'Take overnight trains or buses to save on accommodation.', score: 2 },
            { id: 'c3', text: 'Book regional flights between the cities for speed.', score: 3 },
            { id: 'c4', text: 'Rent a car and drive the entire itinerary yourself.', score: 4 },
            { id: 'c5', text: 'Book last-minute domestic flights as you decide to move on.', score: 5 },
          ],
        },
      ],
      Food: [
        {
          id: 's5-f-1',
          text: "What's your strategy for eating during your two-week trip?",
          choices: [
            { id: 'c1', text: 'Cook most meals with local ingredients from markets.', score: 1 },
            { id: 'c2', text: 'Eat at small, family-run cafes and street food stalls.', score: 2 },
            { id: 'c3', text: 'Mix street food with meals at standard restaurants.', score: 3 },
            { id: 'c4', text: 'Dine at popular international chain restaurants for familiarity.', score: 4 },
            { id: 'c5', text: 'Seek out high-end restaurants with imported luxury ingredients.', score: 5 },
          ],
        },
        {
          id: 's5-f-2',
          text: 'How do you stay hydrated while out sightseeing?',
          choices: [
            { id: 'c1', text: 'Carry a reusable bottle and refill from public fountains.', score: 1 },
            { id: 'c2', text: 'Buy one large bottle of water and refill it throughout the day.', score: 2 },
            { id: 'c3', text: 'Buy multiple medium-sized bottled waters as needed.', score: 3 },
            { id: 'c4', text: 'Buy individual small plastic bottles for convenience.', score: 4 },
            { id: 'c5', text: 'Drink only canned soft drinks and single-use juices.', score: 5 },
          ],
        },
        {
          id: 's5-f-3',
          text: 'You want to try the local specialty. How do you choose where to go?',
          choices: [
            { id: 'c1', text: 'Ask your local host or a shopkeeper for a personal recommendation.', score: 1 },
            { id: 'c2', text: 'Find a busy place where locals are eating.', score: 2 },
            { id: 'c3', text: 'Check a reputable travel guidebook for listed restaurants.', score: 3 },
            { id: 'c4', text: 'Use a food app to find the top-rated "local cuisine" spot.', score: 4 },
            { id: 'c5', text: 'Book a table at a famous chef\'s fine-dining fusion restaurant.', score: 5 },
          ],
        },
        {
          id: 's5-f-4',
          text: 'What will you do with leftovers from a large restaurant meal?',
          choices: [
            { id: 'c1', text: 'Politely decline portions that are too big before ordering.', score: 1 },
            { id: 'c2', text: 'Share dishes with your travel companions to avoid waste.', score: 2 },
            { id: 'c3', text: 'Ask for a container and take the leftovers for lunch tomorrow.', score: 3 },
            { id: 'c4', text: 'Leave them; it\'s awkward to carry food around.', score: 4 },
            { id: 'c5', text: 'Order multiple dishes to try everything, expecting to leave most.', score: 5 },
          ],
        },
        {
          id: 's5-f-5',
          text: 'How will you handle snacks during long day trips?',
          choices: [
            { id: 'c1', text: 'Pack nuts and fruit from a local market in a reusable bag.', score: 1 },
            { id: 'c2', text: 'Buy a single bag of local snacks to share.', score: 2 },
            { id: 'c3', text: 'Grab a packaged granola bar from your backpack.', score: 3 },
            { id: 'c4', text: 'Buy individual packaged snacks at every stop.', score: 4 },
            { id: 'c5', text: 'Rely on fast-food stops or vending machines for snacks.', score: 5 },
          ],
        },
        {
          id: 's5-f-6',
          text: 'What kind of food souvenir do you bring home?',
          choices: [
            { id: 'c1', text: 'A new recipe you learned and made with local ingredients.', score: 1 },
            { id: 'c2', text: 'Spices or tea from a local market, packed in paper.', score: 2 },
            { id: 'c3', text: 'Pre-packaged local sweets from the airport duty-free.', score: 3 },
            { id: 'c4', text: 'Fragile, exotic fruits requiring special packaging.', score: 4 },
            { id: 'c5', text: 'Vacuum-packed luxury foods flown in from elsewhere.', score: 5 },
          ],
        },
      ],
      Fashion: [
        {
          id: 's5-c-1',
          text: 'How do you plan your holiday wardrobe?',
          choices: [
            { id: 'c1', text: 'Build a capsule wardrobe from clothes you already own.', score: 1 },
            { id: 'c2', text: 'Borrow a key versatile item, like a jacket, from a friend.', score: 2 },
            { id: 'c3', text: 'Buy one new, versatile piece that you\'ll wear often.', score: 3 },
            { id: 'c4', text: 'Buy a few new trendy items specifically for the trip.', score: 4 },
            { id: 'c5', text: 'Buy a full new holiday wardrobe from fast-fashion stores.', score: 5 },
          ],
        },
        {
          id: 's5-c-2',
          text: 'You encounter unexpected cold weather. What do you do?',
          choices: [
            { id: 'c1', text: 'Layer the clothes you already brought with you.', score: 1 },
            { id: 'c2', text: 'Buy a second-hand sweater from a local charity shop.', score: 2 },
            { id: 'c3', text: 'Rent a coat for the duration of your stay.', score: 3 },
            { id: 'c4', text: 'Buy a cheap sweater from a global chain store.', score: 4 },
            { id: 'c5', text: 'Buy a new high-tech jacket and discard it before flying home.', score: 5 },
          ],
        },
        {
          id: 's5-c-3',
          text: 'What is your footwear strategy?',
          choices: [
            { id: 'c1', text: 'Take one comfortable, repaired pair for all activities.', score: 1 },
            { id: 'c2', text: 'Take two versatile pairs you already own (e.g., walkers + sandals).', score: 2 },
            { id: 'c3', text: 'Buy new walking shoes specifically for the trip.', score: 3 },
            { id: 'c4', text: 'Pack shoes for every possible occasion (e.g., hiking, evening, beach).', score: 4 },
            { id: 'c5', text: 'Buy cheap "disposable" shoes there and throw them away after.', score: 5 },
          ],
        },
        {
          id: 's5-c-4',
          text: 'How many outfits do you pack for two weeks?',
          choices: [
            { id: 'c1', text: 'Enough for 5-7 days, planning to do laundry.', score: 1 },
            { id: 'c2', text: 'Enough for 10 days, with some re-wearing.', score: 2 },
            { id: 'c3', text: 'A unique outfit for each day of the trip.', score: 3 },
            { id: 'c4', text: 'Multiple options per day, "just in case".', score: 4 },
            { id: 'c5', text: 'Overpack, leading to a very heavy suitcase.', score: 5 },
          ],
        },
        {
          id: 's5-c-5',
          text: 'How will you handle laundry during your trip?',
          choices: [
            { id: 'c1', text: 'Hand-wash essentials in the sink and air-dry.', score: 1 },
            { id: 'c2', text: 'Use a local laundromat and wash a full load at once.', score: 2 },
            { id: 'c3', text: 'Use the hotel\'s laundry service for convenience.', score: 3 },
            { id: 'c4', text: 'Pack enough clothes to avoid doing any laundry.', score: 4 },
            { id: 'c5', text: 'Wear clothes once and then buy new ones if needed.', score: 5 },
          ],
        },
        {
          id: 's5-c-6',
          text: 'What do you look for in a new item if you must buy something?',
          choices: [
            { id: 'c1', text: 'Natural, durable materials from a local artisan.', score: 1 },
            { id: 'c2', text: 'A classic style from a brand with a repair policy.', score: 2 },
            { id: 'c3', text: 'A synthetic blend that\'s practical and cheap.', score: 3 },
            { id: 'c4', text: 'Whatever is trendy and looks good in photos.', score: 4 },
            { id: 'c5', text: 'The cheapest option available.', score: 5 },
          ],
        },
      ],
      Digital: [
        {
          id: 's5-d-1',
          text: 'How will you navigate the new city?',
          choices: [
            { id: 'c1', text: 'Use a paper map and ask for directions from people.', score: 1 },
            { id: 'c2', text: 'Download offline maps to your phone before you go.', score: 2 },
            { id: 'c3', text: 'Use GPS navigation on your phone for key journeys.', score: 3 },
            { id: 'c4', text: 'Keep data and GPS on constantly to track your route live.', score: 4 },
            { id: 'c5', text: 'Live-stream your location for friends to follow along.', score: 5 },
          ],
        },
        {
          id: 's5-d-2',
          text: 'How do you plan to share your travel photos?',
          choices: [
            { id: 'c1', text: 'Select a few best photos to upload when you get home.', score: 1 },
            { id: 'c2', text: 'Upload a daily photo to a shared album with family.', score: 2 },
            { id: 'c3', text: 'Post a few updates to social media during the trip.', score: 3 },
            { id: 'c4', text: 'Post multiple stories and photos daily across platforms.', score: 4 },
            { id: 'c5', text: 'Livestream parts of your sightseeing in high definition.', score: 5 },
          ],
        },
        {
          id: 's5-d-3',
          text: 'How will you research activities and book tickets?',
          choices: [
            { id: 'c1', text: 'Use guidebooks and book in person at the venue.', score: 1 },
            { id: 'c2', text: 'Use free hotel Wi-Fi to research and book a day in advance.', score: 2 },
            { id: 'c3', text: 'Use mobile data to check reviews and book on the go.', score: 3 },
            { id: 'c4', text: 'Constantly compare prices and reviews across multiple apps.', score: 4 },
            { id: 'c5', text: 'Use data-heavy AR apps to preview every attraction.', score: 5 },
          ],
        },
        {
          id: 's5-d-4',
          text: 'How will you stay in touch with people back home?',
          choices: [
            { id: 'c1', text: 'Send a few text messages and one weekly call on Wi-Fi.', score: 1 },
            { id: 'c2', text: 'Message daily and have a short video call every few days.', score: 2 },
            { id: 'c3', text: 'Message regularly and have several video calls a week.', score: 3 },
            { id: 'c4', text: 'Message constantly and have daily video calls.', score: 4 },
            { id: 'c5', text: 'Maintain a near-constant video call connection throughout the day.', score: 5 },
          ],
        },
        {
          id: 's5-d-5',
          text: 'How will you entertain yourself during downtime?',
          choices: [
            { id: 'c1', text: 'Read a physical book or people-watch.', score: 1 },
            { id: 'c2', text: 'Listen to downloaded podcasts or music.', score: 2 },
            { id: 'c3', text: 'Watch videos you downloaded before the trip.', score: 3 },
            { id: 'c4', text: 'Stream music and standard-definition videos.', score: 4 },
            { id: 'c5', text: 'Stream HD movies and play online multiplayer games.', score: 5 },
          ],
        },
        {
          id: 's5-d-6',
          text: 'How will you manage your connectivity?',
          choices: [
            { id: 'c1', text: 'Disconnect completely, using Wi-Fi only in emergencies.', score: 1 },
            { id: 'c2', text: 'Buy a local SIM card with a basic data plan for essentials.', score: 2 },
            { id: 'c3', text: 'Use your home provider\'s roaming plan for simplicity.', score: 3 },
            { id: 'c4', text: 'Rent a portable Wi-Fi hotspot for constant multi-device access.', score: 4 },
            { id: 'c5', text: 'Use your home data plan extensively, incurring high roaming fees.', score: 5 },
          ],
        },
      ]
    }
  }
];
