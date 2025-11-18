// --- TYPES ---

export enum GameStatus {
  LOBBY = 'LOBBY',
  SCENARIO_ASSIGNMENT = 'SCENARIO_ASSIGNMENT',
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
  originalId?: string;
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

export const THEME_ICONS: { [key: string]: string } = {
  "Personal Mobility": '🚗',
  "Food and Dietary Habits": '🍎',
  "Fashion and Clothing Habits": '👕',
  "Digital Life, Tools and Devices": '📱',
};

export const AVATARS = ['😊', '😎', '🚀', '🦄', '🤖', '🦊', '🐼', '🐸', '🦁', '🐯', '🐙', '🦖'];


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
    },
     6: {
        3: [
            { range: [18, 24], change: 0 },
            { range: [25, 42], change: 1 },
            { range: [43, 60], change: 2 },
            { range: [61, 78], change: 3 },
            { range: [79, 90], change: 5 }
        ],
        4: [
            { range: [24, 33], change: 0 },
            { range: [34, 56], change: 1 },
            { range: [57, 80], change: 2 },
            { range: [81, 104], change: 3 },
            { range: [105, 120], change: 5 }
        ],
        6: [
            { range: [36, 49], change: 0 },
            { range: [50, 84], change: 1 },
            { range: [85, 120], change: 2 },
            { range: [121, 156], change: 3 },
            { range: [157, 180], change: 5 }
        ]
    }
};

// --- GAME DATA ---

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'The Life-Changing Interview',
    icon: 'briefcase',
    color: 'bg-blue-500',
    description: 'The most innovative tech company in town is waiting for you. You have one chance to impress. Every choice you make - from your pre-interview lunch to how you arrive - says something about who you are. The future starts today: which path will you choose? Mindful decisions or immediate convenience?',
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/interview.svg',
    questions: {
      "Personal Mobility": [
        {
          id: 's1-m-1',
          text: 'Your interview is across town. How do you ensure you arrive looking neat and on time?',
          fact: { text: "In the EU, transport is responsible for 25% of greenhouse gas emissions, with passenger cars contributing 44% of that total. Cycling produces zero.", url: "https://www.eea.europa.eu/en/analysis/indicators/greenhouse-gas-emissions-from-transport"},
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
          text: 'Heavy rain is forecast for your commute time. How do you plan to manage?',
          fact: { text: "Urban stormwater runoff from roads is a major source of water pollution, carrying oil, heavy metals, and tire wear particles into waterways.", url: "https://www.epa.gov/npdes/stormwater-discharges-municipal-sources"},
          choices: [
            { id: 'c1', text: 'Trust your waterproof gear and stick with your bike or walk plan.', score: 1 },
            { id: 'c2', text: 'Switch to the bus system to stay dry without extra cost.', score: 2 },
            { id: 'c3', text: 'Use a rideshare app, accepting the potential higher prices.', score: 3 },
            { id: 'c4', text: 'Rent a car for the day to have a dry shelter ready to use.', score: 4 },
            { id: 'c5', text: 'Call a taxi last minute to avoid any contact with the weather.', score: 5 },
          ],
        },
        {
          id: 's1-m-3',
          text: 'The location is in a remote business park with limited transit. How do you get there?',
          fact: { text: "Converting natural land for business parks and associated infrastructure like parking lots contributes to habitat loss and soil sealing, increasing flood risks.", url: "https://www.eea.europa.eu/en/topics/in-depth/land-use?activeTab=fa515f0c-9ab0-493c-b4cd-58a32dfaae0a"},
          choices: [
            { id: 'c1', text: 'Take transit to the closest point and walk the final 20 minutes.', score: 1 },
            { id: 'c2', text: 'Coordinate with another applicant to share a taxi from the station.', score: 2 },
            { id: 'c3', text: 'Rent a car for flexibility to explore the area afterwards.', score: 3 },
            { id: 'c4', text: 'Drive your own car for maximum reliability and comfort.', score: 4 },
            { id: 'c5', text: 'Use a door-to-door shuttle service for a premium, direct ride.', score: 5 },
          ],
        },
        {
          id: 's1-m-4',
          text: 'You are late. How do you save time while traveling?',
           fact: { text: "Idling in traffic congestion significantly increases fuel consumption and local air pollution. A study found congestion costs in the EU are nearly €100 billion annually.", url: "https://www.europeandatajournalism.eu/cp_data_news/road-traffic-pollution-costs-billions-in-lost-wellbeing-in-european-cities/"},
          choices: [
            { id: 'c1', text: 'Pedal faster on your bike; you will just be more warmed up.', score: 1 },
            { id: 'c2', text: 'Check the app for a faster transit route with more transfers.', score: 2 },
            { id: 'c3', text: 'Get an e-scooter to move through traffic faster than a car.', score: 3 },
            { id: 'c4', text: 'Book a priority rideshare that minimizes stops for others.', score: 4 },
            { id: 'c5', text: 'Order a private taxi that takes the fastest toll road.', score: 5 },
          ],
        },
        {
          id: 's1-m-5',
          text: 'There is a major transit delay on your planned route. What is your backup plan?',
          fact: { text: "Public transport is far more efficient. A full bus can take 50 cars off the road, reducing congestion, CO2, and particulate matter (PM2.5) emissions.", url: "https://www.uitp.org/news/public-transport-mobility-for-yeu-and-benefits-for-all/"},
          choices: [
            { id: 'c1', text: 'Check the app for any alternative bus or train lines, accepting a longer trip.', score: 1 },
            { id: 'c2', text: 'Quickly walk to a different transit stop to avoid the problem.', score: 2 },
            { id: 'c3', text: 'Use a rideshare to get to a functioning part of the transit network.', score: 3 },
            { id: 'c4', text: 'Immediately rent an e-scooter to navigate around the congestion.', score: 4 },
            { id: 'c5', text: 'Get the first available taxi to take you the entire way without delays.', score: 5 },
          ],
        },
        {
          id: 's1-m-6',
          text: 'The interview is a multi-day process. How will you handle the commute tomorrow?',
          fact: { text: "The average petrol car in the EU emits about 2.2 tonnes of CO2 per year. Avoiding that commute for a year has a massive impact.", url: "https://www.europarl.europa.eu/topics/en/article/20190313STO31218/co2-emissions-from-cars-facts-and-figures-infographics"},
          choices: [
            { id: 'c1', text: 'Check the route today and commit to cycling again for consistency.', score: 1 },
            { id: 'c2', text: 'Pre-purchase a transit pass for the week to simplify your journey.', score: 2 },
            { id: 'c3', text: 'Book the same rideshare service to repeat today\'s stress-free arrival.', score: 3 },
            { id: 'c4', text: 'Extend your rental car agreement for ultimate convenience.', score: 4 },
            { id: 'c5', text: 'Drive your own car again, now that you know the route and parking.', score: 5 },
          ],
        },
      ],
      "Food and Dietary Habits": [
        {
          id: 's1-f-1',
          text: 'You need a quick breakfast that will keep you focused until the interview. You choose?',
          fact: { text: "Producing 1 kg of beef requires approximately 15,000 liters of water, mostly for growing animal feed, compared to 250 liters for 1 kg of oats.", url: "https://waterfootprint.org/en/water-footprint/product-water-footprint/water-footprint-crop-and-animal-products/"},
          choices: [
            { id: 'c1', text: 'Oatmeal with nuts and seeds prepared at home.', score: 1 },
            { id: 'c2', text: 'A fresh piece of fruit and a coffee from the local bakery.', score: 2 },
            { id: 'c3', text: 'A protein bar and a bottled juice for on-the-go efficiency.', score: 3 },
            { id: 'c4', text: 'A breakfast sandwich and smoothie from a fast-food restaurant.', score: 4 },
            { id: 'c5', text: 'A heated pastry and large flavored coffee from a drive-in restaurant.', score: 5 },
          ],
        },
        {
          id: 's1-f-2',
          text: 'To maintain energy, you bring a drink for the commute. It is:',
          fact: { text: "The production of one aluminum can requires a significant amount of energy, but it is one of the most recycled materials globally, with over 75% of all aluminum ever produced still in use.", url: "https://international-aluminium.org/international-aluminium-institute-publishes-global-recycling-data/"},
          choices: [
            { id: 'c1', text: 'Water from your tap in a container you already own.', score: 1 },
            { id: 'c2', text: 'Home-brewed coffee or tea in your thermal mug.', score: 2 },
            { id: 'c3', text: 'A freshly squeezed juice in a glass bottle from a cafe.', score: 3 },
            { id: 'c4', text: 'A branded energy drink from a convenience store.', score: 4 },
            { id: 'c5', text: 'A large soft drink from a dispenser in a disposable cup.', score: 5 },
          ],
        },
        {
          id: 's1-f-3',
          text: 'Lunch is with the team. How do you choose your meal?',
          fact: { text: "Ruminant animals like cows produce methane, a potent GHG (GreenHouse Gases) ~28x stronger than CO2 over 100 years. A plant-based diet can reduce food-related emissions by up to 73%.", url: "https://www.eea.europa.eu/en/analysis/maps-and-charts/methane-emission-trend-eu"},
          choices: [
            { id: 'c1', text: 'Suggest a place known for simple, local ingredient-based dishes.', score: 1 },
            { id: 'c2', text: 'Order a vegetarian dish from the menu they recommend.', score: 2 },
            { id: 'c3', text: 'Choose the popular fish or chicken dish everyone else is having.', score: 3 },
            { id: 'c4', text: 'Go for the imported steak, a symbol of success and taste.', score: 4 },
            { id: 'c5', text: 'Insist on a famous burger chain for a casual, predictable meal.', score: 5 },
          ],
        },
        {
          id: 's1-f-4',
          text: 'After the interview, you celebrate. Your treat of choice is:',
          fact: { text: "Imported goods often have a high 'food-mile' footprint due to air or refrigerated freight transport, significantly increasing their overall CO2 emissions.", url: "https://environment.ec.europa.eu/news/field-fork-global-food-miles-generate-nearly-20-all-co2-emissions-food-2023-01-25_en"},
          choices: [
            { id: 'c1', text: 'A piece of high-quality, locally made dark chocolate.', score: 1 },
            { id: 'c2', text: 'A craft beer or cocktail at a nearby independent bar.', score: 2 },
            { id: 'c3', text: 'A slice of cake from a well-known bakery chain.', score: 3 },
            { id: 'c4', text: 'A shareable platter of imported snacks and drinks.', score: 4 },
            { id: 'c5', text: 'A large, rich dessert from a delivery app.', score: 5 },
          ],
        },
        {
          id: 's1-f-5',
          text: 'You want a pre-interview snack to calm your nerves. You grab:',
          fact: { text: "Almond farming is highly water-intensive. It takes about 12 liters of water to grow a single almond, primarily in regions prone to drought like California.", url: "https://www.theguardian.com/environment/2020/jan/28/what-plant-milk-should-i-drink-almond-killing-bees-aoe"},
          choices: [
            { id: 'c1', text: 'A handful of almonds from your bulk food supply.', score: 1 },
            { id: 'c2', text: 'A piece of fruit sold individually at a nearby store.', score: 2 },
            { id: 'c3', text: 'A single-serving bag of pretzels from a vending machine.', score: 3 },
            { id: 'c4', text: 'A plastic tub of protein pudding for a quick boost.', score: 4 },
            { id: 'c5', text: 'A small bag of individually wrapped chocolates.', score: 5 },
          ],
        },
        {
          id: 's1-f-6',
          text: 'The company offers you a bottled drink while you wait. You accept:',
          fact: { text: "The bottled water industry generates millions of tons of plastic waste annually. In Europe, only about 50% of plastic bottles are collected for recycling.", url: "https://www.investigate-europe.eu/posts/in-numbers-europes-mounting-plastic-waste-problem-unpacked"},
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
          text: 'You need to look professional. How do you source your interview outfit?',
          fact: { text: "The fashion industry is responsible for ~10% of global carbon emissions—more than international flights and maritime shipping combined.", url: "https://unece.org/forestry/news/fashion-environmental-and-social-emergency-can-also-drive-progress-towards"},
          choices: [
            { id: 'c1', text: 'Wear a trusted, classic combination you already own.', score: 1 },
            { id: 'c2', text: 'Borrow a key special piece from a friend who is your size.', score: 2 },
            { id: 'c3', text: 'Rent a designer outfit for a fraction of the retail price.', score: 3 },
            { id: 'c4', text: 'Buy a new outfit from a sustainable-focused online brand.', score: 4 },
            { id: 'c5', text: 'Get a great deal on a new suit from a cheap fashion store.', score: 5 },
          ],
        },
        {
          id: 's1-c-2',
          text: 'Your shoes need to be perfect. How do you ensure they are?',
          fact: { text: "The production of synthetic materials like polyester is energy-intensive and relies on fossil fuels. It also sheds microplastics with every wash.", url: "https://www.pbs.org/newshour/science/laundry-is-a-top-source-of-microplastic-pollution-heres-how-to-clean-your-clothes-more-sustainably"},
          choices: [
            { id: 'c1', text: 'Clean and polish the best pair you already have.', score: 1 },
            { id: 'c2', text: 'Repair the soles and refresh your old reliable dress shoes.', score: 2 },
            { id: 'c3', text: 'Buy a like-new pair from a high-end second-hand store.', score: 3 },
            { id: 'c4', text: 'Purchase new leather shoes from a traditional brand.', score: 4 },
            { id: 'c5', text: 'Buy a cheap, stylish pair that you can discard after.', score: 5 },
          ],
        },
        {
          id: 's1-c-3',
          text: 'Your shirt has a wrinkle. How do you handle it last minute?',
          fact: { text: "Irons are energy-hungry appliances. A typical iron uses 1000-3000 watts, compared to a 40-watt LED bulb. Air-drying reduces energy consumption.", url: "https://www.crompton.co.in/blogs/home-appliances-guide/iron-wattage"},
          choices: [
            { id: 'c1', text: 'Hang it in the bathroom during a hot shower for steam.', score: 1 },
            { id: 'c2', text: 'Quickly iron just the collar and cuffs for a focused look.', score: 2 },
            { id: 'c3', text: 'Use a compact travel steamer for a full refresh.', score: 3 },
            { id: 'c4', text: 'Do a full ironing session on medium heat.', score: 4 },
            { id: 'c5', text: "Rewash the shirt and use the dryer's high-heat cycle.", score: 5 },
          ],
        },
        {
          id: 's1-c-4',
          text: 'After the interview, how do you care for your outfit?',
          fact: { text: "Washing clothes in hot water (60°C) uses up to 90% more energy than a 30°C wash. Using cooler water saves significant energy and reduces microplastic release.", url: "https://www.cleaninginstitute.org/industry-priorities/outreach/cold-water-saves"},
          choices: [
            { id: 'c1', text: 'Let it air and clean small marks with a cloth.', score: 1 },
            { id: 'c2', text: 'Hand-wash delicate items and hang them to dry.', score: 2 },
            { id: 'c3', text: 'Machine wash on a cool, gentle cycle.', score: 3 },
            { id: 'c4', text: 'Machine wash with bleach and machine dry to sanitize.', score: 4 },
            { id: 'c5', text: 'Send it all for professional dry cleaning to be perfect for next time.', score: 5 },
          ],
        },
        {
          id: 's1-c-5',
          text: 'You notice a small scratch on your shoe right before leaving. You:',
          fact: { text: "Shoe production has a high environmental cost. A typical pair of running shoes generates ~13 kg of CO2 emissions due to complex manufacturing processes.", url: "https://news.mit.edu/2013/footwear-carbon-footprint-0522"},
          choices: [
            { id: 'c1', text: 'Polish it quickly with the back of your sock; it\'s barely noticeable.', score: 1 },
            { id: 'c2', text: 'Use a natural wax pencil you have for such minor emergencies.', score: 2 },
            { id: 'c3', text: 'Pop into a shoe repair shop for a quick, immediate polish.', score: 3 },
            { id: 'c4', text: 'Buy a new shoe polish kit to do a proper job.', score: 4 },
            { id: 'c5', text: 'Decide it\'s a sign to buy a new pair on your way home.', score: 5 },
          ],
        },
        {
          id: 's1-c-6',
          text: 'You want to make a strong first impression with an accessory. You:',
          fact: { text: '"Fast fashion" relies on cheap, low-quality materials designed for short lifespans, creating enormous textile waste. The EU discards about 5.8 million tonnes of textiles yearly.', url: "https://www.eea.europa.eu/publications/textiles-in-europes-circular-economy"},
          choices: [
            { id: 'c1', text: 'Wear your grandfather\'s classic watch, a traditional piece.', score: 1 },
            { id: 'c2', text: 'Borrow an elegant silk tie from a roommate.', score: 2 },
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
          fact: { text: "The ICT sector (data centers, networks, devices) is estimated to account for 2-4% of global carbon emissions.", url: "https://documents1.worldbank.org/curated/en/099121223165540890/pdf/P17859712a98880541a4b71d57876048abb.pdf"},
          choices: [
            { id: 'c1', text: 'Charge to 80% overnight and keep it on power-saving mode.', score: 1 },
            { id: 'c2', text: 'Do a full charge and only use it for essential maps and calls.', score: 2 },
            { id: 'c3', text: 'Carry a compact, low-capacity power bank just in case.', score: 3 },
            { id: 'c4', text: 'Use a high-speed power bank to stream music and navigate.', score: 4 },
            { id: 'c5', text: 'Keep it plugged into a portable charger all day for full battery.', score: 5 },
          ],
        },
        {
          id: 's1-d-2',
          text: 'How do you prepare your portfolio to share in the interview?',
          fact: { text: "The paper industry is a major consumer of water and energy. Recycling one tonne of paper can save about 26,500 liters of water and 17 trees.", url: "https://www.epa.gov/recycle/recycling-basics"},
          choices: [
            { id: 'c1', text: 'Print a single copy on recycled paper to leave behind.', score: 1 },
            { id: 'c2', text: 'Have it ready on your tablet to display smoothly.', score: 2 },
            { id: 'c3', text: 'Email a PDF to the interviewers beforehand as a preview.', score: 3 },
            { id: 'c4', text: 'Build an interactive online portfolio available on the web.', score: 4 },
            { id: 'c5', text: 'Use a high-resolution projector for an engaging presentation.', score: 5 },
          ],
        },
        {
          id: 's1-d-3',
          text: 'How will you navigate to the interview?',
          fact: { text: "Streaming video in high definition (HD) uses significantly more data and energy than standard definition (SD), increasing the carbon footprint of your digital navigation.", url: "https://theshiftproject.org/en/article/unsustainable-use-online-video/"},
          choices: [
            { id: 'c1', text: 'Study the route beforehand and rely on street signs.', score: 1 },
            { id: 'c2', text: 'Download an offline map to avoid using live data.', score: 2 },
            { id: 'c3', text: 'Use standard live GPS navigation on your phone.', score: 3 },
            { id: 'c4', text: 'Run two navigation apps simultaneously to compare arrival times.', score: 4 },
            { id: 'c5', text: 'Stream a video map live for the most visual, real-time guidance.', score: 5 },
          ],
        },
        {
          id: 's1-d-4',
          text: 'After the interview, how do you follow up?',
          fact: { text: "An average email has a carbon footprint of about 4g CO2e. This adds up to over 150 million tonnes of CO2 annually from emails alone.", url: "https://www.theguardian.com/environment/2024/oct/31/concerned-about-your-data-use-here-is-the-carbon-footprint-of-an-average-day-of-emails-whatsapps-and-more"},
          choices: [
            { id: 'c1', text: 'Send a short thank-you email the same day.', score: 1 },
            { id: 'c2', text: 'Email and send a personalized connection request on LinkedIn.', score: 2 },
            { id: 'c3', text: 'Send an email and a thank-you message via the company\'s portal.', score: 3 },
            { id: 'c4', text: 'Email and share a positive post about the company culture online.', score: 4 },
            { id: 'c5', text: 'Create a personalized video thank-you and share it on social media.', score: 5 },
          ],
        },
        {
          id: 's1-d-5',
          text: 'To make a strong impression, you prepare a digital portfolio. You:',
          fact: { text: "Data centers, which host cloud services, consumed about 2% of global electricity demand in 2024 and this is expected to double by 2026.", url: "https://www.datacenterdynamics.com/en/news/global-data-center-electricity-use-to-double-by-2026-report/"},
          choices: [
            { id: 'c1', text: 'Keep it simple: a one-page PDF resume on a USB drive.', score: 1 },
            { id: 'c2', text: 'Bring your own tablet to control the presentation smoothly.', score: 2 },
            { id: 'c3', text: 'Upload it to a cloud service for easy access from any device.', score: 3 },
            { id: 'c4', text: 'Create a video presentation and host it on a streaming platform.', score: 4 },
            { id: 'c5', text: 'Develop a complex interactive website for a complete experience.', score: 5 },
          ],
        },
        {
          id: 's1-d-6',
          text: 'After the interview, you...:',
          fact: { text: "Streaming video on a mobile network can be up to 4x more energy-intensive than using a fixed Wi-Fi network due to the energy needed to power cell towers.", url: "https://ehtrust.org/science/reports-on-power-consumption-and-increasing-energy-use-of-wireless-systems-and-digital-ecosystem/"},
          choices: [
            { id: 'c1', text: 'Read a physical book or magazine to disconnect completely.', score: 1 },
            { id: 'c2', text: 'Listen to a podcast downloaded earlier over Wi-Fi.', score: 2 },
            { id: 'c3', text: 'Scroll through social media feeds to relax.', score: 3 },
            { id: 'c4', text: 'Play a high-quality graphics game on your phone.', score: 4 },
            { id: 'c5', text: 'Stream a high-definition movie on your phone using mobile data.', score: 5 },
          ],
        },
      ]
    }
  },
  {
    id: 's2',
    title: 'A Year of Service Abroad',
    icon: 'volunteer',
    color: 'bg-emerald-500',
    description: "Making a difference... Thoughtfully. You've won a scholarship for a year of community service in a European country other than the one you live in. The paradox is clear: traveling to help local communities? It's your chance to make a difference, but every choice counts. How will you balance your contribution with the impact of your journey?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/volunteer.svg',
    questions: {
      "Personal Mobility": [
        {
          id: 's2-m-1',
          text: 'Your main luggage is ready. How will you travel the 1200 km to your volunteer site?',
          fact: { text: "Aviation is one of the fastest-growing sources of GHG (GreenHouse Gases) emissions. A single long-haul flight can emit more CO2 per passenger than the average person in many countries produces in a year.", url: "https://www.transportenvironment.org/challenges/planes/"},
          choices: [
            { id: 'c1', text: 'Take a direct overnight train, sharing a cabin to reduce costs.', score: 1 },
            { id: 'c2', text: 'Drive alone in your own car, splitting the journey into two shorter days.', score: 2 },
            { id: 'c3', text: 'Join a rideshare group to split the fuel cost for the two-day drive.', score: 3 },
            { id: 'c4', text: 'Fly with a budget airline for the main part and use a local bus for the last part.', score: 4 },
            { id: 'c5', text: 'Book a direct flight for speed and check one large suitcase for convenience.', score: 5 },
          ],
        },
        {
          id: 's2-m-2',
          text: 'You need to transport several boxes of supplies for your project. What do you do?',
          fact: { text: "Air freight is highly carbon-intensive. Shipping 1 ton of cargo by plane emits over 50 times more CO2 than shipping it by container ship.", url: "https://ourworldindata.org/travel-carbon-footprint"},
          choices: [
            { id: 'c1', text: 'Ask a friend who is driving later to bring them for you.', score: 1 },
            { id: 'c2', text: 'Ship them via standard ground delivery well in advance of your arrival.', score: 2 },
            { id: 'c3', text: 'Fit what you can in your luggage and plan to buy the rest locally.', score: 3 },
            { id: 'c4', text: 'Rent a small van for the trip to have space for everything.', score: 4 },
            { id: 'c5', text: 'Pay for extra checked baggage on your flight to bring them with you.', score: 5 },
          ],
        },
        {
          id: 's2-m-3',
          text: 'A friend offers to take you to the airport or train station. How do you respond?',
          fact: { text: 'Empty "deadhead" miles, where a vehicle travels without a passenger, are a significant source of inefficiency and unnecessary emissions in personal transport.', url: "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle"},
          choices: [
            { id: 'c1', text: 'Accept gratefully, as it\'s on their way to work.', score: 1 },
            { id: 'c2', text: 'Suggest meeting at a central transport stop to minimize their detour.', score: 2 },
            { id: 'c3', text: 'Ask them to pick you up very early to avoid traffic.', score: 3 },
            { id: 'c4', text: 'Politely decline and order a ride-share for door-to-door ease.', score: 4 },
            { id: 'c5', text: 'Accept and also ask for a quick stop elsewhere on the way.', score: 5 },
          ],
        },
        {
          id: 's2-m-4',
          text: 'Your flight has a long wait. How will you pass the time?',
          fact: { text: "Airport operations, including ground support equipment and energy for terminals, contribute significantly to local air pollution and CO2 emissions.", url: "https://www.easa.europa.eu/eco/airport-carbon-accreditation"},
          choices: [
            { id: 'c1', text: 'Stay in the airport area and read a book, avoiding extra movement.', score: 1 },
            { id: 'c2', text: 'Take a short train into the city for a quick walk alone.', score: 2 },
            { id: 'c3', text: 'Take a bus to the nearest mall to do some last-minute shopping.', score: 3 },
            { id: 'c4', text: 'Meet a local friend who drives to the airport for a coffee.', score: 4 },
            { id: 'c5', text: 'Book a private sleeping room at an airport hotel to nap and shower.', score: 5 },
          ],
        },
        {
          id: 's2-m-5',
          text: 'How will you ensure you have local currency upon arrival?',
          fact: { text: "Currency production (minting coins and printing notes) has an environmental cost, including energy use, metal mining, and water consumption.", url: "https://www.bundesbank.de/en/tasks/topics/cash-management-has-an-ecological-footprint-621968"},
          choices: [
            { id: 'c1', text: 'Use your credit card for all purchases to get the best rate.', score: 1 },
            { id: 'c2', text: 'Withdraw a small amount from an ATM at the airport to get you started.', score: 2 },
            { id: 'c3', text: 'Order currency from your home bank a week before you leave.', score: 3 },
            { id: 'c4', text: 'Have a family member who traveled recently give you their remaining currency.', score: 1 },
            { id: 'c5', text: 'Exchange a large sum at the airport desk for full convenience.', score: 5 },
          ],
        },
        {
          id: 's2-m-6',
          text: 'Your final destination is 50km from the main train station. How do you get there?',
          fact: { text: "In the EU, cars are the main mode of transport for urban mobility, accounting for 83% of passenger kilometers, contributing heavily to urban air pollution.", url: "https://www.eea.europa.eu/publications/urban-mobility"},
          choices: [
            { id: 'c1', text: 'Take a local bus that connects directly to the village.', score: 1 },
            { id: 'c2', text: 'Pre-book a seat on a shuttle bus service with other volunteers.', score: 2 },
            { id: 'c3', text: 'Wait for a project coordinator who is picking up several people.', score: 1 },
            { id: 'c4', text: 'Use a taxi app for a direct, private trip.', score: 4 },
            { id: 'c5', text: 'Rent a car at the station for flexibility during your stay.', score: 5 },
          ],
        },
      ],
      "Food and Dietary Habits": [
        {
          id: 's2-f-1',
          text: 'What will you pack to eat during your long journey to the site?',
          fact: { text: "Food packaging accounts for about 5% of the energy used in the life cycle of a food product. Making the packaging often consumes more energy than producing the food itself.", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/food-packaging-materials"},
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
          fact: { text: "Food miles matter. The global food system is responsible for about 30% of total energy consumption and contributes over 20% of global greenhouse gas emissions.", url: "https://www.nature.com/articles/s43016-020-0093-y"},
          choices: [
            { id: 'c1', text: 'I\'ll accept an invitation to eat with my host family or project lead.', score: 1 },
            { id: 'c2', text: 'I\'ve packed some familiar snacks to help me until I can shop.', score: 2 },
            { id: 'c3', text: 'I\'ll find a local supermarket and buy basics to cook a simple meal.', score: 3 },
            { id: 'c4', text: 'I\'ll walk around and grab a bite from a casual-looking local eatery.', score: 4 },
            { id: 'c5', text: 'I\'ll order a pizza delivery to my new room to unwind.', score: 5 },
          ],
        },
        {
          id: 's2-f-3',
          text: 'What is your strategy for staying hydrated while traveling?',
          fact: { text: "The production of a 1-liter plastic water bottle requires ~3 liters of water and ~250ml of oil, and generates 100g of CO2.", url: "https://pacinst.org/publication/bottled-water-fact-sheet/"},
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
          fact: { text: "The global trade of food products can lead to the spread of invasive alien species, which is a major cause of biodiversity loss and ecosystem disruption.", url: "https://www.eea.europa.eu/publications/invasive-alien-species-a-threat"},
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
          fact: { text: "Large supermarkets have a high energy footprint due to refrigeration, lighting, and customer travel, often located in car-dependent areas.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0959652615000073"},
          choices: [
            { id: 'c1', text: 'Walk to the nearest small market and carry back what I can.', score: 1 },
            { id: 'c2', text: 'Take a bus to a larger supermarket to stock up in one big trip.', score: 2 },
            { id: 'c3', text: 'Go to the local farmers\' market and buy fresh produce.', score: 1 },
            { id: 'c4', text: 'Order a large online delivery for convenience.', score: 4 },
            { id: 'c5', text: 'Drive to a large supermarket outside of town for the best prices.', score: 5 },
          ],
        },
        {
          id: 's2-f-6',
          text: 'You are invited to a welcome dinner where everyone brings food. What will you contribute?',
          fact: { text: "Industrial agriculture relies heavily on nitrogen-based fertilizers, which are energy-intensive to produce and a major source of nitrous oxide, a potent GHG (GreenHouse Gases).", url: "https://www.ipcc.ch/report/ar6/wg3/"},
          choices: [
            { id: 'c1', text: 'I\'ll buy ingredients at a local farmers\' market and make something new.', score: 1 },
            { id: 'c2', text: 'I\'ll prepare a simple dish from my home country.', score: 2 },
            { id: 'c3', text: 'I\'ll offer to help with setup or cleanup instead of bringing food.', score: 1 },
            { id: 'c4', text: 'I\'ll pick up a ready-made salad or dessert from a supermarket.', score: 4 },
            { id: 'c5', text: 'I\'ll bring imported beers or sodas that everyone might like.', score: 5 },
          ],
        },
      ],
      "Fashion and Clothing Habits": [
        {
          id: 's2-c-1',
          text: 'How will you assemble your core wardrobe for the year?',
          fact: { text: "The average European buys 15kg of textiles annually and discards about 11kg. Extending the life of clothes by 9 months can reduce their carbon footprint by 30%.", url: "https://www.wrap.org.uk/resources/guide/extending-life-clothes"},
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
          fact: { text: "The footwear industry accounts for 1.4% of global GHG (GreenHouse Gases) emissions. Manufacturing one pair of shoes is a complex process involving ~65 individual steps.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0959652616305735"},
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
          text: 'What will you do with clothes you are not going to bring back?',
          fact: { text: "Textile waste in landfills decomposes anaerobically, producing methane. Synthetic fibers like polyester can take hundreds of years to break down.", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/textiles-material-specific-data"},
          choices: [
            { id: 'c1', text: 'I\'ll try to sell them online to other volunteers or students.', score: 1 },
            { id: 'c2', text: 'I\'ll donate them to a local charity if they\'re still wearable.', score: 2 },
            { id: 'c3', text: 'I\'ll leave them in the accommodation for the next person.', score: 3 },
            { id: 'c4', text: 'I\'ll pack everything I brought, no matter what.', score: 4 },
            { id: 'c5', text: 'I\'ll throw them away if they are worn out or stained.', score: 5 },
          ],
        },
        {
          id: 's2-c-4',
          text: 'How will you handle laundry during your stay?',
          fact: { text: "Washing and drying clothes is responsible for 60-80% of a garment's total energy footprint during its lifecycle. Air-drying is a huge energy saver.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0959652611005333"},
          choices: [
            { id: 'c1', text: 'I\'ll hand-wash small items in my room and air-dry them.', score: 1 },
            { id: 'c2', text: 'I\'ll wear items multiple times to reduce washing frequency.', score: 2 },
            { id: 'c3', text: 'I\'ll use a local laundromat and run full loads on a cold cycle.', score: 3 },
            { id: 'c4', text: 'I\'ll use a weekly drop-off service for convenience.', score: 4 },
            { id: 'c5', text: 'I\'ll wash clothes frequently in hot water to ensure they\'re clean.', score: 5 },
          ],
        },
        {
          id: 's2-c-5',
          text: 'You need a formal outfit for a special event. What do you do?',
          fact: { text: "The dyeing and finishing process in textile production is highly polluting, accounting for 20% of global industrial water pollution.", url: "https://www.worldbank.org/en/topic/water/brief/water-in-textiles"},
          choices: [
            { id: 'c1', text: 'I\'ll restyle and dress up the smartest outfit I brought.', score: 1 },
            { id: 'c2', text: 'I\'ll borrow something from another volunteer or a host.', score: 1 },
            { id: 'c3', text: 'I\'ll rent an outfit from a local service for the night.', score: 3 },
            { id: 'c4', text: 'I\'ll buy a new outfit from a regular fashion store.', score: 4 },
            { id: 'c5', text: 'I\'ll order several options online and return what I don\'t like.', score: 5 },
          ],
        },
        {
          id: 's2-c-6',
          text: 'What type of fabrics will make up most of your packed clothes?',
          fact: { text: "Synthetic fibers like polyester are derived from petroleum. Their production releases ethylene oxide and benzene, which are hazardous air pollutants.", url: "https://www.epa.gov/haps/ethylene-oxide"},
          choices: [
            { id: 'c1', text: 'A mix of natural materials like cotton and wool that I already own.', score: 2 },
            { id: 'c2', text: 'New clothes made from recycled polyester and organic cotton.', score: 3 },
            { id: 'c3', text: 'A minimal wardrobe of high-quality natural materials I bought new.', score: 3 },
            { id: 'c4', text: 'Mostly synthetic blends because they are lightweight and don\'t wrinkle.', score: 4 },
            { id: 'c5', text: 'Whatever is clean and in my closet, I\'m not fussy about fabric.', score: 5 },
          ],
        },
      ],
      "Digital Life, Tools and Devices": [
        {
          id: 's2-d-1',
          text: 'How will you stay in touch with family and friends back home?',
          fact: { text: "A one-hour video call can emit between 150-1000 grams of CO2, depending on the service and device used. Turning off video can reduce this footprint by 96%.", url: "https://www.bbc.com/future/article/20200310-why-and-how-to-cut-your-digital-carbon-footprint"},
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
          text: 'How will you find your way around your new city and country?',
          fact: { text: "GPS navigation requires constant data exchange with satellites and ground networks. Using it for every short trip uses more energy than pre-planning a route.", url: "https://www.sciencedirect.com/science/article/abs/pii/S1361920916304553"},
          choices: [
            { id: 'c1', text: 'Buy a paper map and ask locals for directions.', score: 1 },
            { id: 'c2', text: 'Use offline downloaded maps on my phone to save data.', score: 2 },
            { id: 'c3', text: 'Use public transport apps that show live schedules.', score: 3 },
            { id: 'c4', text: 'Learn by exploring on foot and discovering the routes.', score: 1 },
            { id: 'c5', text: 'Use real-time GPS navigation on my phone for every trip.', score: 5 },
          ],
        },
        {
          id: 's2-d-3',
          text: 'How will you back up the photos you take during your year?',
          fact: { text: "Data storage in the cloud is physical. The world's data centers consume ~200 TWh of electricity per year, more than the national energy consumption of some countries.", url: "https://www.iea.org/reports/data-centres-and-data-transmission-networks"},
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
          fact: { text: "Online gaming is energy-intensive. If global gamers were a country, their energy use would rank in the top 25 globally.", url: "https://www.researchgate.net/publication/336909570_The_carbon_footprint_of_gaming"},
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
          text: 'You need a local phone number. What is your plan?',
          fact: { text: "E-waste is the fastest-growing waste stream in the EU. In 2019, only 42% of e-waste was officially collected and recycled.", url: "https://www.eea.europa.eu/publications/waste-electronics-and-electrical-equipment"},
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
          fact: { text: "The energy required to train a single large AI model can emit over 284,000 kg of CO2eq, nearly 5x the lifetime emissions of an average American car.", url: "https://www.technologyreview.com/2019/06/06/239031/training-a-single-ai-model-can-emit-as-much-carbon-as-five-cars-in-their-lifetimes/"},
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
    title: 'Values-Based Romance Match!',
    icon: 'heart',
    color: 'bg-rose-500',
    description: "After weeks of chatting, it's time for the first date. You want to make an impression but also be consistent with your values. On this date, every choice counts: Charm or consciousness? Chemistry or considerate choices? Your chance to find someone who shares your principles!",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/date.svg',
    questions: {
      "Personal Mobility": [
        {
          id: 's3-m-1',
          text: 'How do you plan your travel to the date location?',
          fact: { text: "Active mobility like walking and cycling not only produces zero emissions but also reduces noise pollution, a major environmental stressor in urban areas.", url: "https://www.eea.europa.eu/publications/noise-in-europe"},
          choices: [
            { id: 'c1', text: 'Walk or cycle, checking the route on an offline map app.', score: 1 },
            { id: 'c2', text: 'Take a direct bus or tram line.', score: 2 },
            { id: 'c3', text: 'Coordinate a carpool if your date is driving that way.', score: 3 },
            { id: 'c4', text: 'Use a taxi app just for yourself.', score: 4 },
            { id: 'c5', text: 'Drive your own car alone for maximum convenience.', score: 5 },
          ],
        },
        {
          id: 's3-m-2',
          text: 'The forecast predicts rain for your date. What\'s your plan?',
          fact: { text: "Urban stormwater runoff from roads carries pollutants like tire wear particles (a major source of microplastics), heavy metals, and oil into waterways.", url: "https://www.nature.com/articles/s41893-019-0453-5"},
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
          fact: { text: "Short car trips are especially inefficient as cold engines consume more fuel and produce higher levels of pollutants per kilometer than warmed-up engines.", url: "https://www.acea.auto/files/ACEA_Report_Vehicle_emissions_and_air_quality.pdf"},
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
          fact: { text: "Particulate Matter (PM2.5) from vehicle brake and tire wear is a significant and growing contributor to urban air pollution, harmful to human health.", url: "https://www.eea.europa.eu/publications/air-quality-in-europe-2022"},
          choices: [
            { id: 'c1', text: 'Plan a safe walking/cycling route home with lights.', score: 1 },
            { id: 'c2', text: 'Check and use the last available night bus or tram.', score: 2 },
            { id: 'c3', text: 'Arrange to share a taxi or ride with your date.', score: 3 },
            { id: 'c4', text: 'Book a solo taxi for door-to-door service.', score: 4 },
            { id: 'c5', text: 'Drive yourself home alone, even if you\'re tired.', score: 5 },
          ],
        },
        {
          id: 's3-m-5',
          text: 'You want to bring a small gift. How do you acquire it?',
          fact: { text: "Express shipping often relies on air freight, which is the most carbon-intensive mode of transport, emitting over 500g of CO2 per tonne-kilometer.", url: "https://ourworldindata.org/travel-carbon-footprint"},
          choices: [
            { id: 'c1', text: 'Pick a local, low-impact gift on your way by foot/bike.', score: 1 },
            { id: 'c2', text: 'Buy it along your public transport route.', score: 2 },
            { id: 'c3', text: 'Order from a local vendor with standard delivery.', score: 3 },
            { id: 'c4', text: 'Make a special trip by car to a distant specialist shop.', score: 4 },
            { id: 'c5', text: 'Use express same-day shipping for a unique item.', score: 5 },
          ],
        },
        {
          id: 's3-m-6',
          text: 'Your date suggests an activity that requires going to another location. How do you travel?',
          fact: { text: "Combining trips (trip chaining) can significantly reduce total vehicle miles traveled, lowering fuel consumption and emissions from cold starts.", url: "https://www.energy.gov/energysaver/drive-efficiently"},
          choices: [
            { id: 'c1', text: 'Suggest a walking distance alternative to avoid extra travel.', score: 1 },
            { id: 'c2', text: 'Look up a direct public transport connection.', score: 2 },
            { id: 'c3', text: 'See if you can combine the trip with other errands.', score: 3 },
            { id: 'c4', text: 'Use a taxi app for the quickest option.', score: 4 },
            { id: 'c5', text: 'Drive separately to the new location.', score: 5 },
          ],
        },
      ],
      "Food and Dietary Habits": [
        {
          id: 's3-f-1',
          text: "You're planning a picnic date. What food do you bring?",
          fact: { text: "Food waste is a major emitter of methane in landfills. If global food waste were a country, it would be the third-largest emitter of GHG (GreenHouse Gases)s after China and the USA.", url: "https://www.fao.org/3/bb144e/bb144e.pdf"},
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
          text: 'You are cooking a surprise dinner. What is your ingredient plan?',
          fact: { text: 'Imported ingredients often have a large "virtual water" footprint, meaning the water used to produce them was extracted from often water-stressed regions.', url: "https://waterfootprint.org/en/water-footprint/national-water-footprint/"},
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
          fact: { text: "The production of packaged snacks involves significant energy for processing, packaging (often plastic), and transportation, compared to whole foods.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0959652618322980"},
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
          fact: { text: "In the EU, nearly 57 million tonnes of food waste (127 kg/inhabitant) are generated annually, with households contributing over half.", url: "https://www.eea.europa.eu/publications/food-waste"},
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
          fact: { text: "The production of sugary drinks is water-intensive. It can take up to 300 liters of water to produce half a liter of soda, mostly for growing sugar crops.", url: "https://iopscience.iop.org/article/10.1088/1748-9326/ab3f8c"},
          choices: [
            { id: 'c1', text: 'Tap water and homemade infused water.', score: 1 },
            { id: 'c2', text: 'Homemade juice or punch in a large pitcher.', score: 2 },
            { id: 'c3', text: 'A mix of store-bought and homemade drinks.', score: 3 },
            { id: 'c4', text: 'Large plastic bottles of soda and juice.', score: 4 },
            { id: 'c5', text: 'Individual plastic bottles for everyone.', score: 5 },
          ],
        },
        {
          id: 's3-f-6',
          text: 'How do you handle your date\'s dietary preferences?',
          fact: { text: "Livestock farming uses 83% of the world's farmland but provides only 18% of our calories. A dietary shift is key to reducing agricultural land use.", url: "https://science.sciencemag.org/content/360/6392/987"},
          choices: [
            { id: 'c1', text: 'Create one amazing dish that suits all dietary needs.', score: 1 },
            { id: 'c2', text: 'Make a mixed snack tray based on their preferences.', score: 2 },
            { id: 'c3', text: 'Offer separate meat and vegetarian options.', score: 3 },
            { id: 'c4', text: 'Hope for the best and don\'t ask.', score: 4 },
            { id: 'c5', text: 'Ignore them; good food is for everyone.', score: 5 },
          ],
        },
      ],
      "Fashion and Clothing Habits": [
        {
          id: 's3-c-1',
          text: 'Where do you look for an outfit for this important date?',
          fact: { text: "The second-hand clothing market helps combat textile waste. Buying one used item reduces its carbon footprint by 82% compared to a new one.", url: "https://www.wrap.org.uk/content/new-report-shows-potential-circular-economy-fashion"},
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
          fact: { text: "Conventional cotton farming uses about 16% of the world's insecticides and 4% of its nitrogen and phosphorous fertilizers, polluting waterways.", url: "https://www.worldwildlife.org/industries/cotton"},
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
          text: 'Your date suggests an activity you are not dressed for. What now?',
          fact: { text: 'The "fast fashion" model encourages buying items for one-off use. Europeans use nearly 26 kg of textiles annually and discard about 11 kg.', url: "https://www.eea.europa.eu/publications/textiles-in-europes-circular-economy"},
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
          fact: { text: "Jewelry mining, especially for gold, is extremely destructive, causing deforestation, soil erosion, and contamination of water with mercury and cyanide.", url: "https://www.unep.org/news-and-stories/story/illicit-gold-mining-wreaks-havoc-amazon"},
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
          fact: { text: "Tumble dryers are one of the most energy-intensive household appliances. One dryer cycle can use twice as much electricity as a washing machine cycle.", url: "https://www.energy.gov/energysaver/articles/how-much-energy-do-your-appliances-use"},
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
          text: 'You spill a drink on your shirt. How do you manage?',
          fact: { text: "The textile industry uses over 15,000 different chemicals in dyeing and finishing processes, many of which are toxic and end up in waterways.", url: "https://www.worldbank.org/en/topic/water/brief/water-in-textiles"},
          choices: [
            { id: 'c1', text: 'Spot clean it immediately and keep wearing it.', score: 1 },
            { id: 'c2', text: 'Hand wash it when you get home and air dry.', score: 2 },
            { id: 'c3', text: 'Take it to an eco-friendly dry cleaner.', score: 3 },
            { id: 'c4', text: 'Take it to a standard chemical dry cleaner.', score: 4 },
            { id: 'c5', text: 'Toss it and buy a new one.', score: 5 },
          ],
        },
      ],
      "Digital Life, Tools and Devices": [
        {
          id: 's3-d-1',
          text: 'How do you research potential date ideas and locations?',
          fact: { text: "The constant demand for new digital content drives energy use in data centers. Global data center electricity use could reach 4% of global total by 2030.", url: "https://www.iea.org/reports/data-centres-and-data-transmission-networks"},
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
          fact: { text: "Running multiple apps simultaneously increases the processing load on your device, draining the battery faster and requiring more frequent charging.", url: "https://www.energy.gov/energysaver/products/mobile-phones"},
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
          fact: { text: "Sending a photo via messaging app has a smaller carbon footprint than email (~0.2g CO2e for a compressed image vs ~4g for a standard email).", url: "https://www.bbc.com/future/article/20200310-why-and-how-to-cut-your-digital-carbon-footprint"},
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
          fact: { text: "Uploading one photo to a social media platform may seem small, but with billions of users, the energy for storage and transmission is immense.", url: "https://www.greenpeace.org/usa/reports/clicking-clean/"},
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
          fact: { text: "Streaming music uses less energy than video, but high-quality audio streaming (e.g., lossless) can use up to 5x more data than standard quality.", url: "https://www.bbc.com/future/article/20200305-why-your-internet-habits-are-not-as-clean-as-you-think"},
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
          fact: { text: "A single social media post's footprint is tiny (~0.02g CO2e), but the scale is vast. The data centers supporting these platforms have a massive collective footprint.", url: "https://www.academia.edu/44900488/Carbon_footprint_of_social_media"},
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
    title: 'The Sustainable Celebration',
    icon: 'cake',
    color: 'bg-purple-500',
    description: "It's your best friend's birthday, and you're in charge of the party. The goal: create an unforgettable celebration that’s as kind to the planet as it is fun for your guests. From eco-friendly invites to zero-waste snacks, every detail is a chance to party responsibly. Can you throw a bash that leaves nothing behind but great memories?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/party.svg',
    questions: {
      "Personal Mobility": [
        {
          id: 's4-m-1',
          text: "Choosing a venue for your friend's party. What's your priority for guest arrival?",
          fact: { text: "Urban sprawl, driven by car-centric development, leads to habitat fragmentation and loss of agricultural land, increasing flood risks through soil sealing.", url: "https://www.eea.europa.eu/publications/urban-sprawl-in-europe"},
          choices: [
            { id: 'c1', text: 'A spot within walking or biking distance for almost everyone.', score: 1 },
            { id: 'c2', text: 'A local hall with excellent and frequent tram connections.', score: 2 },
            { id: 'c3', text: 'A space a bit further out, but right next to a main bus station.', score: 3 },
            { id: 'c4', text: 'A cool bar in the suburbs, easiest to reach by car.', score: 4 },
            { id: 'c5', text: 'A unique, expensive venue in the countryside for a special experience.', score: 5 },
          ],
        },
        {
          id: 's4-m-2',
          text: 'How do you encourage guests to share rides to the party?',
          fact: { text: "Carpooling can significantly reduce per capita emissions. Filling the empty seats in cars is one of the most immediate ways to cut transport emissions.", url: "https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle"},
          choices: [
            { id: 'c1', text: 'Plan a fun group bike meet-up and map the route for everyone.', score: 1 },
            { id: 'c2', text: 'Include a one-day public transit pass with their invitation.', score: 2 },
            { id: 'c3', text: 'Start a shared list in the group chat for drivers and passengers to meet.', score: 3 },
            { id: 'c4', text: 'Just mention that parking will be very limited near the venue.', score: 4 },
            { id: 'c5', text: "Reassure everyone there's ample free parking available on site.", score: 5 },
          ],
        },
        {
          id: 's4-m-3',
          text: 'You need to get party decorations and supplies. How do you handle it?',
          fact: { text: 'Large "big-box" stores are often located on the urban periphery, encouraging car travel and contributing to higher emissions for shopping trips.', url: "https://www.sciencedirect.com/science/article/abs/pii/S1361920915000196"},
          choices: [
            { id: 'c1', text: 'Borrow items from friends nearby and transport them by bike or foot.', score: 1 },
            { id: 'c2', text: 'Order from a low-waste local shop and use a bicycle delivery for pickup.', score: 2 },
            { id: 'c3', text: 'Buy what you need from the corner store and carry it home yourself.', score: 3 },
            { id: 'c4', text: 'Take a single taxi trip to a large party store for a big shopping.', score: 4 },
            { id: 'c5', text: 'Drive to a huge out-of-town supermarket to get everything in one go.', score: 5 },
          ],
        },
        {
          id: 's4-m-4',
          text: 'How do you schedule the party start time for guest convenience?',
          fact: { text: "Public transport services are often reduced at night, increasing reliance on high-emission taxis and private cars for social activities.", url: "https://www.uitp.org/publications/night-time-mobility/"},
          choices: [
            { id: 'c1', text: 'Saturday afternoon, during regular service times on main transit lines.', score: 1 },
            { id: 'c2', text: 'Friday evening, when evening buses are still running, though less often.', score: 2 },
            { id: 'c3', text: 'Saturday midday, some might need to arrange specific rides.', score: 3 },
            { id: 'c4', text: 'Late Sunday night, when direct public transport is not available.', score: 4 },
            { id: 'c5', text: 'A unique weekday midnight timeslot, making driving the only option.', score: 5 },
          ],
        },
        {
          id: 's4-m-5',
          text: 'A guest uses a wheelchair. How do you ensure they can attend?',
          fact: { text: "Accessible and reliable public transport is crucial for social inclusion, allowing people with reduced mobility to participate fully in community life.", url: "https://www.eea.europa.eu/publications/transport-and-mobility"},
          choices: [
            { id: 'c1', text: 'Book a dedicated accessible shuttle service for their round trip.', score: 1 },
            { id: 'c2', text: 'Reserve a shared accessible taxi and split the cost with the group.', score: 2 },
            { id: 'c3', text: 'Ask a friend with a suitable vehicle if they can provide a ride.', score: 3 },
            { id: 'c4', text: 'Suggest they book a standard taxi and hope it has space for them.', score: 4 },
            { id: 'c5', text: 'Assume they will make their own arrangements to get there.', score: 5 },
          ],
        },
        {
          id: 's4-m-6',
          text: 'The party is over. How do you handle cleanup and returning rentals?',
          fact: { text: "Food waste in landfills decomposes without oxygen, producing methane, a greenhouse gas over 28 times more potent than CO2 over a 100-year period.", url: "https://www.epa.gov/ghgemissions/overview-greenhouse-gases"},
          choices: [
            { id: 'c1', text: 'Form teams to clean with reusable supplies, donate food, bike rentals back together.', score: 1 },
            { id: 'c2', text: 'Return rentals together via tram and share leftovers with neighbours.', score: 2 },
            { id: 'c3', text: 'Drive rentals back the next day and bag leftovers for disposal.', score: 3 },
            { id: 'c4', text: 'Leave leftover food and rental items for the venue staff to handle.', score: 4 },
            { id: 'c5', text: 'Leave everything behind and let the venue charge a cleaning fee.', score: 5 },
          ],
        },
      ],
      "Food and Dietary Habits": [
        {
          id: 's4-f-1',
          text: 'You are bringing the birthday cake. What kind do you choose?',
          fact: { text: 'Local food systems shorten supply chains, reducing "food miles" and the associated CO2 emissions from transportation and refrigeration.', url: "https://www.nature.com/articles/s43016-020-0093-y"},
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
          fact: { text: "Food waste has a huge hidden water footprint. Wasting one kg of beef represents a waste of approximately 15,000 liters of water used in its production.", url: "https://waterfootprint.org/en/water-footprint/product-water-footprint/water-footprint-crop-and-animal-products/"},
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
          fact: { text: "Single-use plastics like plates and cups are a major source of pollution. Less than 30% of plastic waste in the EU is collected for recycling.", url: "https://www.eea.europa.eu/publications/plastics-the-circular-economy-and"},
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
          text: 'You are providing drinks. How do you source and serve them?',
          fact: { text: "The production of aluminum cans is extremely energy-intensive, but recycling them saves 95% of the energy required to make a new one from raw materials.", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/aluminum-material-specific-data"},
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
          text: 'There is a lot of food left over. How do you handle?',
          fact: { text: "In the EU, an estimated 20% of all food produced is wasted. Preventing this waste is a key climate strategy, as it avoids all emissions from production.", url: "https://www.eea.europa.eu/publications/food-waste"},
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
          fact: { text: "Industrial food production often relies on monocultures, which reduce biodiversity and make crops more vulnerable to pests, increasing pesticide use.", url: "https://www.ipbes.net/global-assessment"},
          choices: [
            { id: 'c1', text: 'Ask for allergies beforehand and clearly label all dishes.', score: 1 },
            { id: 'c2', text: 'Focus on making simple dishes that are naturally allergen-free.', score: 2 },
            { id: 'c3', text: 'Order a few special diet-friendly items from a caterer.', score: 3 },
            { id: 'c4', text: 'Mention the restrictions but let guests navigate the food themselves.', score: 4 },
            { id: 'c5', text: 'Proceed normally and assume they\'ll find something to eat.', score: 5 },
          ],
        },
      ],
      "Fashion and Clothing Habits": [
        {
          id: 's4-c-1',
          text: 'You want a new outfit for the party. Where do you get it?',
          fact: { text: "Clothing swaps are a prime example of the circular economy, keeping resources in use for longer and reducing the demand for new, resource-intensive production.", url: "https://www.ellenmacarthurfoundation.org/assets/downloads/publications/A-New-Textiles-Economy_Full-Report.pdf"},
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
          fact: { text: "The production of new clothing, even from sustainable brands, has an environmental cost. The most sustainable garment is the one that already exists.", url: "https://www.eea.europa.eu/publications/textiles-in-europes-circular-economy"},
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
          fact: { text: "Costumes made from cheap plastic materials (like PVC) are often used once and discarded. They are not recyclable and release toxins if incinerated.", url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/textiles-material-specific-data"},
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
          fact: { text: "The beauty industry produces over 120 billion units of packaging annually, much of which is complex multi-material packaging that is difficult to recycle.", url: "https://www.greenpeace.org/international/publication/22369/throwaway-plastic-beauty-industry/"},
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
          fact: { text: 'Dry cleaning traditionally uses perchloroethylene ("perc"), a toxic chemical that is a likely human carcinogen and a groundwater contaminant.', url: "https://www.epa.gov/assessing-and-managing-chemicals-under-tsca/risk-management-perchloroethylene-perc"},
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
          fact: { text: 'The linear "take-make-waste" model of fast fashion means that a truckload of textiles is landfilled or incinerated every second somewhere in the world.', url: "https://www.ellenmacarthurfoundation.org/assets/downloads/publications/A-New-Textiles-Economy_Full-Report.pdf"},
          choices: [
            { id: 'c1', text: 'Integrate it into your regular wardrobe for future events.', score: 1 },
            { id: 'c2', text: 'Store it carefully for potential reuse at another themed party.', score: 2 },
            { id: 'c3', text: 'Donate it so someone else can get use out of it.', score: 3 },
            { id: 'c4', text: 'Try to sell it online to recoup some of the cost.', score: 4 },
            { id: 'c5', text: 'Discard it after one wear because it\'s no longer novel.', score: 5 },
          ],
        },
      ],
      "Digital Life, Tools and Devices": [
        {
          id: 's4-d-1',
          text: 'You want to give a digital gift. How do you deliver it?',
          fact: { text: "The production of new electronic gadgets is resource-intensive, requiring mining for rare earth minerals and generating significant e-waste.", url: "https://www.eea.europa.eu/publications/waste-electronics-and-electrical-equipment"},
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
          fact: { text: "The constant pinging of notifications and messages from multiple apps keeps your phone's connection active, using background data and draining battery life.", url: "https://www.energy.gov/energysaver/products/mobile-phones"},
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
          fact: { text: "Large-format printing uses solvent-based inks that can release volatile organic compounds (VOCs), contributing to indoor air pollution.", url: "https://www.epa.gov/indoor-air-quality-iaq/volatile-organic-compounds-impact-indoor-air-quality"},
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
          text: 'How will you invite participants to the party?',
          fact: { text: "Online invitation services with complex tracking and RSVP features run on data centers, which have a continuous and growing energy demand.", url: "https://www.iea.org/reports/data-centres-and-data-transmission-networks"},
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
          fact: { text: "Bluetooth connectivity, especially for multiple speakers, consumes energy on both the transmitting device and the receiving speakers.", url: "https://www.bluetooth.com/blog/bluetooth-technology-and-the-path-to-energy-efficient-wireless-connectivity/"},
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
          fact: { text: "Constantly syncing and backing up high-resolution photos to the cloud consumes energy both on your device and in the data centers that store them.", url: "https://www.greenpeace.org/usa/reports/clicking-clean/"},
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
    title: 'The Conscious Adventure',
    icon: 'planet',
    color: 'bg-amber-500',
    description: "Two weeks of freedom, a world to explore. Overtourism is overwhelming local communities, but you want your chance to discover new places. How do you experience an authentic adventure that is curious but not careless, that creates memories without exploiting destinations?",
    imageUrl: 'https://storage.googleapis.com/aistudio-bucket/google-codelab-assets/climate-game/travel.svg',
    questions: {
      "Personal Mobility": [
        {
          id: 's5-m-1',
          text: 'Your dream destination is 500 km away. How do you get there?',
          fact: { text: "Aviation's non-CO2 effects (like contrails and nitrous oxide emissions) may double its warming impact compared to CO2 emissions alone.", url: "https://www.eea.europa.eu/publications/aviation-and-shipping"},
          choices: [
            { id: 'c1', text: 'Take a direct train or bus journey.', score: 1 },
            { id: 'c2', text: 'Organize a carpool with friends to drive there together.', score: 2 },
            { id: 'c3', text: 'Drive alone in your own car for maximum flexibility.', score: 3 },
            { id: 'c4', text: 'Book a flight with one connection to save a little money.', score: 4 },
            { id: 'c5', text: 'Book the fastest, most direct flight available.', score: 5 },
          ],
        },
        {
          id: 's5-m-2',
          text: 'How will you explore your destination once you arrive?',
          fact: { text: "Cruise tourism has a severe environmental impact. One large cruise ship can have a carbon footprint greater than 12,000 cars.", url: "https://www.transportenvironment.org/challenges/ships/"},
          choices: [
            { id: 'c1', text: 'Walk or cycle to most places within the city.', score: 1 },
            { id: 'c2', text: 'Buy a pass for local trams and buses.', score: 2 },
            { id: 'c3', text: 'Use ride-share apps for longer trips across town.', score: 3 },
            { id: 'c4', text: 'Rent an e-scooter for quick and fun direct travel.', score: 4 },
            { id: 'c5', text: 'Rent a car for the entire two weeks for total freedom.', score: 5 },
          ],
        },
        {
          id: 's5-m-3',
          text: 'A must-see natural site is 50 km from your hotel. How do you visit?',
          fact: { text: "Helicopter tours are extremely fuel-intensive per passenger. One hour of flight can burn hundreds of liters of jet fuel, emitting large amounts of CO2 and NOx.", url: "https://theicct.org/publications/co2-emissions-commercial-aviation-2018"},
          choices: [
            { id: 'c1', text: 'Join a guided group tour that uses a small bus.', score: 1 },
            { id: 'c2', text: 'Take a local train or bus to the nearest town and walk.', score: 2 },
            { id: 'c3', text: 'Rent a car for just that day to see more sights.', score: 3 },
            { id: 'c4', text: 'Book a private taxi for a comfortable door-to-door trip.', score: 4 },
            { id: 'c5', text: 'An amazing opportunity: a friend offers you the possibility of a helicopter tour for a unique view from above.', score: 5 },
          ],
        },
        {
          id: 's5-m-4',
          text: 'You realise you forgot to pack sunscreen. How do you get it?',
          fact: { text: "Express delivery services are optimized for speed, not environmental efficiency, often leading to partially empty vans and increased last-mile delivery emissions.", url: "https://www.itf-oecd.org/delivering-tomorrow"},
          choices: [
            { id: 'c1', text: 'Buy a locally produced, plastic-free brand from a shop you walk past.', score: 1 },
            { id: 'c2', text: 'Go to a pharmacy near your hotel during your next outing.', score: 2 },
            { id: 'c3', text: 'Order it online with standard delivery to your accommodation.', score: 3 },
            { id: 'c4', text: 'Take a taxi to a specific large supermarket to get your favourite brand.', score: 4 },
            { id: 'c5', text: 'Use a taxi app to have it delivered express within the hour.', score: 5 },
          ],
        },
        {
          id: 's5-m-5',
          text: 'How do you ensure you never get lost in the new city?',
          fact: { text: "Portable Wi-Fi hotspots (MiFis) require constant energy to maintain a connection and stream data, draining their batteries quickly and requiring frequent charging.", url: "https://www.energy.gov/energysaver/products/mobile-phones"},
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
          fact: { text: '"Last-minute" domestic flights are the least efficient way to travel between cities, as planes often fly with empty seats, increasing the per-passenger footprint.', url: "https://www.icao.int/environmental-protection/pages/aircraft-engine-emissions.aspx"},
          choices: [
            { id: 'c1', text: 'Choose cities connected by direct train lines.', score: 1 },
            { id: 'c2', text: 'Take overnight trains or buses to save on accommodation.', score: 2 },
            { id: 'c3', text: 'Book flights between the cities for speed.', score: 3 },
            { id: 'c4', text: 'Rent a car and drive the entire itinerary yourself.', score: 4 },
            { id: 'c5', text: 'Book last-minute domestic flights as you decide to move on.', score: 5 },
          ],
        },
      ],
      "Food and Dietary Habits": [
        {
          id: 's5-f-1',
          text: "What's your strategy for eating during your two-week trip?",
          fact: { text: "Street food and local eateries often have a smaller carbon footprint than large, air-conditioned international chain restaurants.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0959652616316037"},
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
          fact: { text: "The production of single-use plastic bottles is energy-intensive and a major source of plastic pollution. Over 1 million plastic bottles are sold every minute globally.", url: "https://www.unep.org/interactives/beat-plastic-pollution/"},
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
          fact: { text: "Overtourism can push local restaurants to import ingredients to cater to foreign tastes, increasing their carbon footprint and disrupting local food systems.", url: "https://www.unwto.org/global-and-regional-tourism-performance"},
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
          fact: { text: "Food waste in the tourism sector is a major issue. All-inclusive resorts, in particular, are associated with high levels of plate waste.", url: "https://www.fao.org/3/bb144e/bb144e.pdf"},
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
          fact: { text: "Vending machines are energy-intensive, running 24/7 for refrigeration and lighting, and are a source of single-use packaging waste.", url: "https://www.energy.gov/energysaver/articles/how-much-energy-do-your-appliances-use"},
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
          fact: { text: "Transporting fragile, exotic fruits often requires air freight (for speed) and extensive plastic packaging to prevent bruising, creating a large carbon footprint.", url: "https://ourworldindata.org/food-transport-by-mode"},
          choices: [
            { id: 'c1', text: 'A new recipe you learned and made with local ingredients.', score: 1 },
            { id: 'c2', text: 'Spices or tea from a local market, packed in paper.', score: 2 },
            { id: 'c3', text: 'Pre-packaged local sweets from the airport duty-free.', score: 3 },
            { id: 'c4', text: 'Fragile, exotic fruits requiring special packaging.', score: 4 },
            { id: 'c5', text: 'Vacuum-packed luxury foods flown in from elsewhere.', score: 5 },
          ],
        },
      ],
      "Fashion and Clothing Habits": [
        {
          id: 's5-c-1',
          text: 'How do you plan your holiday wardrobe?',
          fact: { text: 'A "capsule wardrobe" of versatile, mix-and-match items is the most sustainable travel option, reducing the weight you carry and the need for new purchases.', url: "https://www.wrap.org.uk/sites/default/files/2021-04/VoC%20FINAL%20REPORT.pdf"},
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
          fact: { text: "The production of synthetic fibers for cheap clothing is a major source of microplastic pollution, which is now found from the Arctic to the deep sea.", url: "https://www.iucn.org/resources/issues-brief/marine-plastics"},
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
          fact: { text: '"Disposable" products, including shoes, are designed for the linear economy. Their low quality means they cannot be donated or recycled, destined for landfill.', url: "https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling/textiles-material-specific-data"},
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
          fact: { text: "Overpacking increases the weight of your luggage. On a flight, increased weight leads to increased fuel burn and higher CO2 emissions.", url: "https://www.icao.int/environmental-protection/pages/aircraft-engine-emissions.aspx"},
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
          fact: { text: "Hotel laundry services often wash each guest's clothes separately in hot water and use chemical detergents, leading to high energy and water use per item.", url: "https://www.carbonbrief.org/qa-how-can-tourists-help-reduce-their-carbon-footprint-on-holiday"},
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
          fact: { text: "Buying from a local artisan supports the local economy and often means the product has a much lower transportation footprint than an imported mass-produced item.", url: "https://www.unwto.org/sustainable-development"},
          choices: [
            { id: 'c1', text: 'Natural, durable materials from a local artisan.', score: 1 },
            { id: 'c2', text: 'A classic style from a brand with a repair policy.', score: 2 },
            { id: 'c3', text: 'A synthetic blend that\'s practical and cheap.', score: 3 },
            { id: 'c4', text: 'Whatever is trendy and looks good in photos.', score: 4 },
            { id: 'c5', text: 'The cheapest option available.', score: 5 },
          ],
        },
      ],
      "Digital Life, Tools and Devices": [
        {
          id: 's5-d-1',
          text: 'How will you navigate the new city?',
          fact: { text: "Using Augmented Reality (AR) apps for navigation or sightseeing previews is extremely data- and energy-intensive, requiring constant video processing and GPS.", url: "https://www.sciencedirect.com/science/article/abs/pii/S1361920916304553"},
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
          fact: { text: "Livestreaming video is the most data- and energy-intensive online activity. One hour of streaming can emit up to 1 kg of CO2, depending on the device and network.", url: "https://theshiftproject.org/en/article/unsustainable-use-online-video/"},
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
          fact: { text: "Using mobile data abroad (roaming) often has a higher energy footprint than using Wi-Fi, as your phone searches for and connects to less familiar networks.", url: "https://www.cell.com/joule/fulltext/S2542-4351(18)30005-6"},
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
          fact: { text: "Near-constant video calling requires a stable, high-bandwidth connection, driving energy use in data centers and on transmission networks.", url: "https://www.iea.org/reports/data-centres-and-data-transmission-networks"},
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
          fact: { text: "Online multiplayer gaming keeps servers running 24/7 and requires constant data exchange between your device and the server, consuming significant energy.", url: "https://www.researchgate.net/publication/336909570_The_carbon_footprint_of_gaming"},
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
          fact: { text: "High roaming fees are a commercial cost, but the environmental cost is the high energy use from relying on your home network's international infrastructure.", url: "https://www.sciencedirect.com/science/article/abs/pii/S0301421516303404"},
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