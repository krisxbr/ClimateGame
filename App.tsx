import React, { useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { GameState, Player, Scenario, Action, Choice, Answer, GameStatus, Achievement } from './gameData';
import { SCENARIOS, INITIAL_STATE, ICONS, C_LEVEL_STYLES, ACHIEVEMENTS, AVATARS, INDIVIDUAL_SCORING, TEMP_SCORING } from './gameData';
import { generateConsequences } from './services/geminiService';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Reducer for game state management
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        players: action.payload.map(p => ({
          id: crypto.randomUUID(),
          name: p.name,
          avatar: p.avatar,
          score: 0,
          tokens: 10,
          cLevel: '',
          answers: [],
          achievements: [],
          newAchievements: [],
        })),
        status: GameStatus.SCENARIO_SELECTION,
      };
    case 'SELECT_SCENARIO':
        const selectedScenario = action.payload;
        const playersWithQuestions = state.players.map(player => {
            const themes = shuffleArray(Object.keys(selectedScenario.questions));
            const selectedQuestions = themes.slice(0, 3).map(theme => {
                const questionsInTheme = selectedScenario.questions[theme];
                const question = questionsInTheme[Math.floor(Math.random() * questionsInTheme.length)];
                const shuffledChoices = shuffleArray(question.choices);
                return { ...question, theme, choices: shuffledChoices }; 
            });
            return { ...player, questions: selectedQuestions, answers: [], newAchievements: [] };
        });
        return {
            ...state,
            status: GameStatus.PLAYING,
            scenario: selectedScenario,
            players: playersWithQuestions,
            currentPlayerIndex: 0,
            currentQuestionIndex: 0,
        };
    case 'ANSWER_QUESTION':
      const { playerId, questionId, choice } = action.payload;
      const newPlayers = state.players.map(p => {
        if (p.id === playerId) {
          const newAnswers = [...p.answers, { questionId, choice }];
          return { ...p, answers: newAnswers };
        }
        return p;
      });

      const currentPlayer = newPlayers[state.currentPlayerIndex];
      const nextQuestionIndex = state.currentQuestionIndex + 1;

      if (nextQuestionIndex < (currentPlayer.questions?.length || 0)) {
        return { ...state, players: newPlayers, currentQuestionIndex: nextQuestionIndex };
      }

      const nextPlayerIndex = state.currentPlayerIndex + 1;
      if (nextPlayerIndex < state.players.length) {
        return { ...state, players: newPlayers, currentPlayerIndex: nextPlayerIndex, currentQuestionIndex: 0 };
      }

      return { ...state, players: newPlayers, status: GameStatus.SUMMARY };

    case 'CALCULATE_RESULTS': {
        let totalScore = 0;
        const updatedPlayers = state.players.map(player => {
            const newPlayer = { ...player, newAchievements: [] as Achievement[] };
            const playerScore = newPlayer.answers.reduce((sum, ans) => sum + ans.choice.score, 0);
            newPlayer.score = playerScore;
            totalScore += playerScore;

            const scoringRules = INDIVIDUAL_SCORING[3];
            const result = scoringRules.find(r => playerScore >= r.range[0] && playerScore <= r.range[1]);
            if (result) {
                newPlayer.cLevel = result.level;
                newPlayer.tokens += result.tokenChange;
            }

            // Achievement check
            if (playerScore === 3 && !newPlayer.achievements.includes('eco-hero')) {
              const achievement = ACHIEVEMENTS['eco-hero'];
              newPlayer.achievements.push(achievement.id);
              newPlayer.newAchievements.push(achievement);
            }
            if (newPlayer.cLevel === 'Climate Champion' && !newPlayer.achievements.includes('champion')) {
               const achievement = ACHIEVEMENTS['champion'];
              newPlayer.achievements.push(achievement.id);
              newPlayer.newAchievements.push(achievement);
            }

            return newPlayer;
        });
        
        const tempRules = TEMP_SCORING[state.players.length]['3'];
        const tempResult = tempRules.find(r => totalScore >= r.range[0] && totalScore <= r.range[1]);
        const tempChange = tempResult ? tempResult.change : 0;
      
      return { 
        ...state, 
        players: updatedPlayers, 
        temperature: state.temperature + tempChange,
        lastTempChange: tempChange
      };
    }
    case 'RESTART':
      return { ...INITIAL_STATE, scenarios: shuffleArray(SCENARIOS) };

    default:
      return state;
  }
};

// --- UI COMPONENTS ---

const getTemperatureFeedback = (temp: number) => {
    if (temp <= 15) return { text: "Very cold! Ecosystems are struggling.", color: "bg-blue-500" };
    if (temp <= 21) return { text: "A bit cool. The climate is sensitive.", color: "bg-sky-500" };
    if (temp <= 24) return { text: "Perfectly balanced! This is the ideal zone.", color: "bg-emerald-500" };
    if (temp <= 32) return { text: "Getting warm! Some systems are under stress.", color: "bg-amber-500" };
    if (temp <= 38) return { text: "It's hot in here! Major environmental strain.", color: "bg-orange-500" };
    return { text: "Crisis! Extreme weather events are common.", color: "bg-red-500" };
};

const VerticalPillThermometer: React.FC<{ temperature: number }> = ({ temperature }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const minTemp = 10;
    const maxTemp = 40;
    const range = maxTemp - minTemp;

    const value = Math.max(minTemp, Math.min(maxTemp, temperature));
    const percentage = Math.max(0, Math.min(100, ((value - minTemp) / range) * 100));
    
    const feedback = getTemperatureFeedback(temperature);

    return (
        <div className="flex items-center justify-center gap-6">
            <div 
                className="relative cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {showTooltip && (
                    <div className={`absolute -top-16 w-56 text-center p-3 rounded-lg text-white text-md font-semibold shadow-xl z-10 transition-opacity duration-300 ${feedback.color}`}>
                        {feedback.text}
                        <div className={`w-3 h-3 absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-45 ${feedback.color}`}></div>
                    </div>
                )}
                <div className="w-20 h-72 bg-slate-200 rounded-full flex items-end p-2 overflow-hidden border-4 border-white shadow-inner">
                     <div
                        className="w-full rounded-full bg-gradient-to-t from-blue-500 to-red-500"
                        style={{ height: `${percentage}%`, transition: 'height 1s ease-in-out' }}
                    />
                </div>
            </div>
            <div className="text-7xl font-extrabold text-slate-700 drop-shadow-lg">
                {Math.round(temperature)}°C
            </div>
        </div>
    );
};

const PlayerSetupCard: React.FC<{
    player: { name: string, avatar: string },
    index: number,
    onNameChange: (name: string) => void,
    onAvatarChange: (avatar: string) => void
}> = ({ player, index, onNameChange, onAvatarChange }) => {
    const avatarIndex = AVATARS.indexOf(player.avatar);
    const nextAvatar = () => {
        const nextIndex = (avatarIndex + 1) % AVATARS.length;
        onAvatarChange(AVATARS[nextIndex]);
    };
    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4 animate-enter" style={{animationDelay: `${index * 100}ms`}}>
            <button onClick={nextAvatar} className="text-6xl hover:scale-110 transition-transform">{player.avatar}</button>
            <input type="text" value={player.name} onChange={e => onNameChange(e.target.value)} placeholder={`Player ${index + 1}`} className="w-full bg-slate-100 text-slate-800 p-3 rounded-lg text-xl font-semibold border-2 border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none" />
        </div>
    );
};

const Lobby: React.FC<{ dispatch: React.Dispatch<Action> }> = ({ dispatch }) => {
  const [players, setPlayers] = useState([{name: 'Player 1', avatar: AVATARS[0]}, {name: 'Player 2', avatar: AVATARS[1]}]);

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    const newPlayers = Array.from({ length: count }, (_, i) => players[i] || {name: `Player ${i + 1}`, avatar: AVATARS[i % AVATARS.length]});
    setPlayers(newPlayers);
  };

  const handlePlayerChange = (index: number, newPlayer: {name: string, avatar: string}) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = newPlayer;
    setPlayers(updatedPlayers);
  };
  
  const handleStart = () => {
      if(players.every(p => p.name.trim() !== '')) {
          dispatch({ type: 'START_GAME', payload: players });
      }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/50">
        <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold text-slate-800 mb-2">Game Lobby</h1>
            <p className="text-slate-500 text-xl">Assemble your team!</p>
        </div>
        <div className="mb-6">
          <label htmlFor="player-count" className="block text-xl font-bold text-slate-600 mb-2">How many players?</label>
          <select id="player-count" value={players.length} onChange={handleCountChange} className="w-full bg-white text-slate-800 p-3 rounded-lg text-xl font-semibold border-2 border-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none">
            {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="space-y-4 mb-8">
          {players.map((p, i) => (
            <PlayerSetupCard key={i} index={i} player={p} onNameChange={(name) => handlePlayerChange(i, {...p, name})} onAvatarChange={(avatar) => handlePlayerChange(i, {...p, avatar})} />
          ))}
        </div>
        <button onClick={handleStart} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-4 rounded-xl text-3xl transition-all duration-300 shadow-lg hover:shadow-xl transform animate-pulse-glow">Let's Go!</button>
    </div>
  );
};

const ScenarioSelection: React.FC<{ scenarios: Scenario[]; dispatch: React.Dispatch<Action> }> = ({ scenarios, dispatch }) => (
    <div className="w-full max-w-6xl text-center">
        <h2 className="text-6xl font-extrabold text-slate-800 mb-3">Choose a Challenge</h2>
        <p className="text-slate-500 text-xl mb-12">Your next adventure awaits. What will it be?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scenarios.map((scenario, i) => (
                <div key={scenario.id} onClick={() => dispatch({ type: 'SELECT_SCENARIO', payload: scenario })} className={`animate-pop-in rounded-3xl p-8 text-white cursor-pointer transition-all duration-300 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:scale-105 hover:-rotate-2 transform ${scenario.color}`} style={{animationDelay: `${i*100}ms`}}>
                    <div className="text-8xl mb-4 drop-shadow-lg">{ICONS[scenario.icon]}</div>
                    <h3 className="text-3xl font-bold mb-2">{scenario.title}</h3>
                    <p className="text-white/80 text-md font-medium">{scenario.description}</p>
                </div>
            ))}
        </div>
    </div>
);


const GameScreen: React.FC<{ state: GameState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const { players, currentPlayerIndex, currentQuestionIndex, scenario } = state;
  const currentPlayer = players[currentPlayerIndex];
  const currentQuestion = currentPlayer.questions?.[currentQuestionIndex];

  if (!currentPlayer || !currentQuestion || !scenario) {
    return <div>Loading...</div>;
  }
  
  const handleAnswer = (choice: Choice) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { playerId: currentPlayer.id, questionId: currentQuestion.id, choice } });
  };
  
  return (
    <div className="w-full max-w-5xl flex flex-col h-full">
      <div className="w-full bg-white/60 backdrop-blur-md p-3 rounded-full mb-8 shadow-lg">
        <div className="flex justify-around items-center">
            {players.map((p, index) => (
                <div key={p.id} className={`text-center transition-all duration-500 flex items-center gap-3 p-2 rounded-full ${index === currentPlayerIndex ? 'scale-110' : 'opacity-60'}`}>
                    <div className={`text-5xl rounded-full transition-all duration-300 ${index === currentPlayerIndex ? 'animate-bounce-subtle' : ''}`}>{p.avatar}</div>
                    <div>
                        <p className={`font-bold text-lg ${index === currentPlayerIndex ? 'text-violet-600' : 'text-slate-700'}`}>{p.name}</p>
                        <div className="flex justify-center gap-1.5 mt-1">
                            {[...Array(p.questions?.length || 0)].map((_, i) => (
                                <div key={i} className={`w-6 h-2.5 rounded-full ${i < p.answers.length ? 'bg-violet-500' : 'bg-slate-300'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex-grow bg-white p-10 rounded-3xl shadow-2xl flex flex-col justify-center animate-enter">
          <div>
            {currentQuestion.theme && (
                <span className="bg-teal-100 text-teal-800 text-md font-bold px-5 py-2 rounded-full mb-5 inline-block">{currentQuestion.theme}</span>
            )}
            <h3 className="text-4xl font-bold text-slate-800 mb-10 leading-tight">{currentQuestion.text}</h3>
            <div className="space-y-4">
              {currentQuestion.choices.map((choice) => (
                <button key={choice.id} onClick={() => handleAnswer(choice)} className="w-full text-left bg-slate-100 hover:bg-violet-100 hover:ring-4 hover:ring-violet-300 p-6 rounded-xl transition duration-200 text-slate-700 hover:text-slate-900 font-semibold text-xl active:scale-95">
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};

const CLevelBadge: React.FC<{ level: string }> = ({ level }) => {
    const style = C_LEVEL_STYLES[level] || C_LEVEL_STYLES['Casual Consumer'];
    return (
        <div className={`inline-flex items-center gap-2 font-bold px-4 py-2 rounded-full text-lg ${style.className}`}>
            <span className="text-2xl">{style.emoji}</span>
            <span>{level}</span>
        </div>
    );
};

const AchievementBadge: React.FC<{ achievement: Achievement, delay: number }> = ({ achievement, delay }) => (
    <div className="bg-yellow-100 border-2 border-yellow-300 p-4 rounded-xl flex items-center gap-4 animate-pop-in" style={{animationDelay: `${delay}ms`}}>
        <span className="text-5xl">{achievement.icon}</span>
        <div>
            <h5 className="font-bold text-lg text-yellow-900">{achievement.name}</h5>
            <p className="text-md text-yellow-700">{achievement.description}</p>
        </div>
    </div>
);

const ReportModal: React.FC<{ report: string; onClose: () => void }> = ({ report, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-pop-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-4xl font-extrabold text-violet-600 mb-4">Eco-Report!</h3>
            <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-xl">
                {report.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </div>
            <button onClick={onClose} className="mt-8 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-lg w-full text-xl">Close</button>
        </div>
    </div>
);

const RoundSummary: React.FC<{ state: GameState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    
    useEffect(() => {
        dispatch({ type: 'CALCULATE_RESULTS' });
    }, [dispatch]);

    const allPlayerChoices = useMemo(() => state.players.flatMap(p => 
        p.answers.map(ans => ({
            playerName: p.name,
            questionText: p.questions?.find(q => q.id === ans.questionId)?.text || 'Unknown',
            choiceText: ans.choice.text,
            score: ans.choice.score
        }))
    ), [state.players]);

    useEffect(() => {
        if (state.status === GameStatus.SUMMARY && allPlayerChoices.length > 0) {
            const fetchConsequences = async () => {
                setIsLoading(true); setError('');
                try {
                    const result = await generateConsequences(state.scenario?.title || 'a situation', allPlayerChoices);
                    setReport(result);
                } catch (err) {
                    setError('Oh no! The AI reporter is on a coffee break.');
                    setReport("Based on your choices, you've definitely made an impact! Reflect on the balance between convenience and what's best for our planet. Every small choice helps write a better future story.");
                } finally { setIsLoading(false); }
            };
            fetchConsequences();
        }
    }, [state.status, state.scenario, allPlayerChoices]);
    
    const newAchievements = useMemo(() => state.players.flatMap(p => p.newAchievements || []), [state.players]);

    return (
        <div className="w-full max-w-7xl mx-auto">
            {showModal && <ReportModal report={report} onClose={() => setShowModal(false)} />}
            <h2 className="text-6xl font-extrabold text-slate-800 mb-8 text-center animate-enter">Round Summary!</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 bg-white/70 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl flex flex-col justify-center items-center border border-white/50 animate-enter" style={{animationDelay: '100ms'}}>
                    <h3 className="text-3xl font-bold text-slate-700 mb-6">Global Temperature</h3>
                    <VerticalPillThermometer temperature={state.temperature} />
                    <p className={`text-5xl font-bold mt-6 transition-colors duration-500 animate-pop-in ${state.lastTempChange > 0 ? 'text-red-500' : state.lastTempChange < 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                        {state.lastTempChange >= 0 ? '+' : ''}{state.lastTempChange}°C
                    </p>
                     <div className="text-center text-md text-slate-500 mt-6 p-4 bg-slate-100/70 rounded-xl">
                        <p className="font-semibold text-slate-600">22°C is the temperature that science considers ideal for optimal living conditions.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-5">
                    {newAchievements.length > 0 && (
                        <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/50 animate-enter" style={{animationDelay: '200ms'}}>
                             <h3 className="text-3xl font-bold text-yellow-600 mb-4 flex items-center justify-center gap-3">🏆 Achievements Unlocked! 🏆</h3>
                             <div className="space-y-4">
                                {newAchievements.map((ach, i) => <AchievementBadge key={ach.id} achievement={ach} delay={i * 150} />)}
                             </div>
                        </div>
                    )}
                    {state.players.map((player, i) => (
                        <div key={player.id} className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg flex justify-between items-center animate-enter" style={{animationDelay: `${400 + i * 100}ms`}}>
                            <div className="flex items-center gap-4">
                                <span className="text-6xl">{player.avatar}</span>
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-800">{player.name}</h4>
                                    <CLevelBadge level={player.cLevel} />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-md text-slate-500 font-semibold">Round Score</p>
                                <p className="font-bold text-3xl text-slate-700 mb-1">{player.score}</p>
                                <p className="font-bold text-2xl text-amber-500 flex items-center justify-end gap-1.5">{ICONS.token} {player.tokens}</p>
                            </div>
                        </div>
                    ))}
                     <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl animate-enter" style={{animationDelay: '800ms'}}>
                        <h3 className="text-2xl font-bold text-violet-600 mb-3">AI Eco-Report</h3>
                        {isLoading ? (
                            <div className="flex items-center space-x-3 text-slate-500"><div className="w-8 h-8 border-4 border-t-violet-500 rounded-full animate-spin"></div><span className="font-semibold text-lg">Our AI is writing your climate story...</span></div>
                        ) : (
                            <>
                                <p className="text-slate-600 text-lg line-clamp-3">{report}</p>
                                <button onClick={() => setShowModal(true)} className="text-violet-600 font-bold text-lg mt-2 hover:underline">Read The Full Story →</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="text-center mt-12 animate-enter" style={{animationDelay: '900ms'}}>
                <button onClick={() => dispatch({ type: 'RESTART' })} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-12 rounded-xl text-3xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse-glow">Play Again!</button>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [initialState] = useState(() => ({...INITIAL_STATE, scenarios: shuffleArray(SCENARIOS)}));
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const renderGameState = () => {
    switch (state.status) {
      case GameStatus.LOBBY:
        return <Lobby dispatch={dispatch} />;
      case GameStatus.SCENARIO_SELECTION:
        return <ScenarioSelection scenarios={state.scenarios} dispatch={dispatch} />;
      case GameStatus.PLAYING:
        return <GameScreen state={state} dispatch={dispatch} />;
      case GameStatus.SUMMARY:
        return <RoundSummary state={state} dispatch={dispatch} />;
      default:
        return <Lobby dispatch={dispatch} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-100 via-cyan-100 to-emerald-100 text-slate-800 h-screen w-screen p-4 sm:p-6 flex flex-col font-sans overflow-hidden">
       <header className="w-full max-w-7xl mx-auto flex justify-between items-center shrink-0">
          <div className="text-4xl font-extrabold">CLIMATE <span className="text-emerald-500">CHAN</span><span className="text-violet-500">CE</span></div>
          {state.status !== GameStatus.LOBBY && <button onClick={() => dispatch({type: 'RESTART'})} className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 px-5 rounded-lg transition duration-300 border border-slate-200 shadow-md hover:shadow-lg text-lg">New Game</button>}
       </header>

      <main className="flex-grow flex items-center justify-center py-4">
        {renderGameState()}
      </main>
    </div>
  );
}