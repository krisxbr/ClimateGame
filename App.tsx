import React, { useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { GameState, Team, Scenario, Action, Choice, Answer, GameStatus, Achievement, Fact } from './gameData';
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
      const shuffledScenarios = shuffleArray(state.scenarios).slice(0, action.payload.length);
      return {
        ...state,
        teams: action.payload.map((t, i) => {
            const teamScenario = shuffledScenarios[i] || state.scenarios[i % state.scenarios.length]; // Fallback
            const themes = shuffleArray(Object.keys(teamScenario.questions));
            const selectedQuestions = themes.slice(0, 3).map(theme => {
                const questionsInTheme = teamScenario.questions[theme];
                const question = questionsInTheme[Math.floor(Math.random() * questionsInTheme.length)];
                const shuffledChoices = shuffleArray(question.choices);
                return { ...question, theme, choices: shuffledChoices };
            });

            return {
              id: crypto.randomUUID(),
              name: t.name,
              avatar: t.avatar,
              players: t.players,
              score: 0,
              tokens: 10,
              cLevel: '',
              answers: [],
              achievements: [],
              newAchievements: [],
              scenario: teamScenario,
              questions: selectedQuestions,
            }
        }),
        status: GameStatus.SCENARIO_ASSIGNMENT,
        currentQuestionIndex: 0,
        currentTeamIndex: 0,
      };
    case 'PROCEED_TO_PLAY':
        return { ...state, status: GameStatus.PLAYING };
    case 'ANSWER_QUESTION':
      const { teamId, questionId, choice } = action.payload;
      const newTeams = state.teams.map(t => {
        if (t.id === teamId) {
          const newAnswers = [...t.answers, { questionId, choice }];
          return { ...t, answers: newAnswers };
        }
        return t;
      });

      const nextTeamIndex = state.currentTeamIndex + 1;

      if (nextTeamIndex < state.teams.length) {
          // Next team's turn for the same question
          return { ...state, teams: newTeams, currentTeamIndex: nextTeamIndex };
      }

      // All teams answered, move to next question
      const nextQuestionIndex = state.currentQuestionIndex + 1;
      const anyTeam = state.teams[0]; // All teams have same number of questions

      if (nextQuestionIndex < (anyTeam.questions?.length || 0)) {
          return { ...state, teams: newTeams, currentTeamIndex: 0, currentQuestionIndex: nextQuestionIndex };
      }

      // Game over
      return { ...state, teams: newTeams, status: GameStatus.SUMMARY };

    case 'CALCULATE_RESULTS': {
        let totalScore = 0;
        const updatedTeams = state.teams.map(team => {
            const newTeam = { ...team, newAchievements: [] as Achievement[] };
            const teamScore = newTeam.answers.reduce((sum, ans) => sum + ans.choice.score, 0);
            newTeam.score = teamScore;
            totalScore += teamScore;

            const scoringRules = INDIVIDUAL_SCORING[3];
            const result = scoringRules.find(r => teamScore >= r.range[0] && teamScore <= r.range[1]);
            if (result) {
                newTeam.cLevel = result.level;
                newTeam.tokens += result.tokenChange;
            }

            // Achievement check
            if (teamScore === 3 && !newTeam.achievements.includes('eco-hero')) {
              const achievement = ACHIEVEMENTS['eco-hero'];
              newTeam.achievements.push(achievement.id);
              newTeam.newAchievements.push(achievement);
            }
            if (newTeam.cLevel === 'Climate Champion' && !newTeam.achievements.includes('champion')) {
               const achievement = ACHIEVEMENTS['champion'];
              newTeam.achievements.push(achievement.id);
              newTeam.newAchievements.push(achievement);
            }

            return newTeam;
        });
        
        const tempRules = TEMP_SCORING[state.teams.length]['3'];
        const tempResult = tempRules.find(r => totalScore >= r.range[0] && totalScore <= r.range[1]);
        const tempChange = tempResult ? tempResult.change : 0;
      
      return { 
        ...state, 
        teams: updatedTeams, 
        temperature: state.temperature + tempChange,
        lastTempChange: tempChange
      };
    }
    case 'RESHUFFLE_SCENARIOS': {
        const shuffledScenarios = shuffleArray(state.scenarios).slice(0, state.teams.length);
        const updatedTeams = state.teams.map((team, index) => ({
            ...team,
            scenario: shuffledScenarios[index] || state.scenarios[index % state.scenarios.length], // Fallback for safety
        }));
        return {
            ...state,
            teams: updatedTeams,
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

const TeamSetupCard: React.FC<{
    team: { name: string, avatar: string, players: string[] },
    index: number,
    onTeamChange: (team: { name: string, avatar: string, players: string[] }) => void,
}> = ({ team, index, onTeamChange }) => {
    const avatarIndex = AVATARS.indexOf(team.avatar);
    
    const nextAvatar = () => {
        const nextIndex = (avatarIndex + 1) % AVATARS.length;
        onTeamChange({ ...team, avatar: AVATARS[nextIndex] });
    };

    const handlePlayerNameChange = (playerIndex: number, newName: string) => {
        const newPlayers = [...team.players];
        newPlayers[playerIndex] = newName;
        onTeamChange({ ...team, players: newPlayers });
    };

    const handleAddPlayer = () => {
        onTeamChange({ ...team, players: [...team.players, `Player ${team.players.length + 1}`] });
    };

    const handleRemovePlayer = (playerIndex: number) => {
        if (team.players.length <= 1) return; // Must have at least one player
        const newPlayers = team.players.filter((_, i) => i !== playerIndex);
        onTeamChange({ ...team, players: newPlayers });
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-4 animate-enter" style={{animationDelay: `${index * 100}ms`}}>
            <div className="flex items-center gap-4">
                <button onClick={nextAvatar} className="text-6xl hover:scale-110 transition-transform">{team.avatar}</button>
                <input type="text" value={team.name} onChange={e => onTeamChange({...team, name: e.target.value})} placeholder={`Team ${index + 1}`} className="w-full bg-slate-100 text-slate-800 p-3 rounded-lg text-xl font-semibold border-2 border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none" />
            </div>
            <div className="pl-20 space-y-2">
                <label className="block text-lg font-bold text-slate-500">Players</label>
                {team.players.map((player, pIndex) => (
                    <div key={pIndex} className="flex items-center gap-2">
                         <input type="text" value={player} onChange={e => handlePlayerNameChange(pIndex, e.target.value)} placeholder={`Player ${pIndex + 1}`} className="w-full bg-slate-100 text-slate-700 p-2 rounded-md text-md font-medium border-2 border-transparent focus:ring-2 focus:ring-violet-400 focus:outline-none" />
                         <button onClick={() => handleRemovePlayer(pIndex)} disabled={team.players.length <= 1} className="text-red-500 hover:text-red-700 font-bold text-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"> &times; </button>
                    </div>
                ))}
                 <button onClick={handleAddPlayer} className="w-full text-left font-semibold text-violet-600 hover:text-violet-800 p-2 rounded-md transition-colors text-md mt-1">+ Add Player</button>
            </div>
        </div>
    );
};

const Lobby: React.FC<{ dispatch: React.Dispatch<Action> }> = ({ dispatch }) => {
  const [teams, setTeams] = useState([
      {name: 'Team 1', avatar: AVATARS[0], players: ['Player 1']}, 
      {name: 'Team 2', avatar: AVATARS[1], players: ['Player 1']}
    ]);

  const handleCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    const newTeams = Array.from({ length: count }, (_, i) => teams[i] || {name: `Team ${i + 1}`, avatar: AVATARS[i % AVATARS.length], players: ['Player 1']});
    setTeams(newTeams);
  };

  const handleTeamChange = (index: number, newTeam: {name: string, avatar: string, players: string[]}) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = newTeam;
    setTeams(updatedTeams);
  };
  
  const handleStart = () => {
      const areTeamsValid = teams.every(t => t.name.trim() !== '' && t.players.every(p => p.trim() !== ''));
      if(areTeamsValid) {
          dispatch({ type: 'START_GAME', payload: teams });
      }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/50">
        <div className="text-center mb-8">
            <h1 className="text-6xl font-extrabold text-slate-800 mb-2">Game Lobby</h1>
            <p className="text-slate-500 text-xl">Assemble your teams!</p>
        </div>
        <div className="mb-6">
          <label htmlFor="team-count" className="block text-xl font-bold text-slate-600 mb-2">How many teams?</label>
          <select id="team-count" value={teams.length} onChange={handleCountChange} className="w-full bg-white text-slate-800 p-3 rounded-lg text-xl font-semibold border-2 border-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none">
            {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="space-y-4 mb-8">
          {teams.map((p, i) => (
            <TeamSetupCard key={i} index={i} team={p} onTeamChange={(newTeam) => handleTeamChange(i, newTeam)} />
          ))}
        </div>
        <button onClick={handleStart} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-4 rounded-xl text-3xl transition-all duration-300 shadow-lg hover:shadow-xl transform animate-pulse-glow">Let's Go!</button>
    </div>
  );
};

const ScenarioAssignmentScreen: React.FC<{ teams: Team[]; dispatch: React.Dispatch<Action> }> = ({ teams, dispatch }) => {
    const placeholderScenario = { title: 'Assigning...', icon: 'planet' as const, color: 'bg-slate-400' };
    const [displayedScenarios, setDisplayedScenarios] = useState<(Partial<Scenario>)[]>(teams.map(() => placeholderScenario));
    const [isRevealing, setIsRevealing] = useState(true);

    useEffect(() => {
        setIsRevealing(true); // Reset revealing state on each shuffle

        const revealTimers: NodeJS.Timeout[] = [];
        let completedAnimations = 0;

        teams.forEach((team, index) => {
            const animationDuration = 1000 + index * 400; // Total spin time for this card
            const spinInterval = 75; // How fast the text changes
            let spinTimer: NodeJS.Timeout;

            const startTime = Date.now();

            spinTimer = setInterval(() => {
                if (Date.now() - startTime > animationDuration) {
                    clearInterval(spinTimer);
                    setDisplayedScenarios(prev => {
                        const newScenarios = [...prev];
                        newScenarios[index] = team.scenario;
                        return newScenarios;
                    });
                    completedAnimations++;
                    if (completedAnimations === teams.length) {
                        setIsRevealing(false);
                    }
                } else {
                    setDisplayedScenarios(prev => {
                        const newScenarios = [...prev];
                        const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
                        newScenarios[index] = randomScenario;
                        return newScenarios;
                    });
                }
            }, spinInterval);
            revealTimers.push(spinTimer);
        });

        // Cleanup function to clear all intervals if the component unmounts
        return () => {
            revealTimers.forEach(timer => clearInterval(timer));
        };
    }, [teams]); // Effect runs once when component mounts with the initial teams

    return (
        <div className="w-full max-w-4xl text-center">
            <h2 className="text-6xl font-extrabold text-slate-800 mb-12 animate-enter">Your Adventures Await!</h2>
            <div className="space-y-8">
                {teams.map((team, i) => {
                    const scenario = displayedScenarios[i];
                    return (
                        <div key={team.id} className="animate-pop-in bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-lg flex items-center justify-between gap-6" style={{ animationDelay: `${i * 150}ms` }}>
                            <div className="flex items-center gap-6">
                                <div className="text-7xl">{team.avatar}</div>
                                <div className="text-left">
                                    <h3 className="text-4xl font-bold text-slate-800">{team.name}</h3>
                                    <p className="text-slate-500 font-medium text-md max-w-md">{team.players.join(', ')}</p>
                                </div>
                            </div>
                            <div className={`p-6 rounded-2xl text-white flex items-center gap-4 text-left min-w-[400px] transition-colors duration-200 ${scenario.color}`}>
                                <div className="text-6xl drop-shadow-lg transition-transform duration-300 ease-out">{scenario.icon ? ICONS[scenario.icon] : '❓'}</div>
                                <div>
                                    <p className="text-lg opacity-80">Your challenge is...</p>
                                    <h4 className="text-3xl font-bold">{scenario.title}</h4>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-12 flex justify-center items-center gap-4 flex-wrap">
                <button
                    onClick={() => dispatch({ type: 'RESHUFFLE_SCENARIOS' })}
                    disabled={isRevealing}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl text-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3"
                >
                    <span className="text-3xl">🎲</span>
                    Reshuffle
                </button>
                <button
                    onClick={() => dispatch({ type: 'PROCEED_TO_PLAY' })}
                    disabled={isRevealing}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-12 rounded-xl text-3xl transition-all duration-300 shadow-lg hover:shadow-xl transform disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 animate-pulse-glow"
                >
                    {isRevealing ? 'Revealing...' : 'Start Playing!'}
                </button>
            </div>
        </div>
    );
};


const GameScreen: React.FC<{ state: GameState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const { teams, currentTeamIndex, currentQuestionIndex } = state;
  const currentTeam = teams[currentTeamIndex];
  const currentQuestion = currentTeam.questions?.[currentQuestionIndex];

  if (!currentTeam || !currentQuestion) {
    return <div>Loading...</div>;
  }
  
  const handleAnswer = (choice: Choice) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { teamId: currentTeam.id, questionId: currentQuestion.id, choice } });
  };
  
  return (
    <div className="w-full max-w-5xl flex flex-col h-full">
      <div className="w-full bg-white/60 backdrop-blur-md p-3 rounded-full mb-6 shadow-lg">
        <div className="flex justify-around items-center">
            {teams.map((p, index) => (
                <div key={p.id} className={`text-center transition-all duration-500 flex items-center gap-3 p-2 rounded-full ${index === currentTeamIndex ? 'scale-110' : 'opacity-60'}`}>
                    <div className={`text-5xl rounded-full transition-all duration-300 ${index === currentTeamIndex ? 'animate-bounce-subtle' : ''}`}>{p.avatar}</div>
                    <div>
                        <p className={`font-bold text-lg ${index === currentTeamIndex ? 'text-violet-600' : 'text-slate-700'}`}>{p.name}</p>
                        <p className="text-xs text-slate-500 max-w-40" title={p.players.join(', ')}>{p.players.join(', ')}</p>
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
      
      <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-slate-700">Round {currentQuestionIndex + 1} of {currentTeam.questions?.length}</h2>
          <p className="text-xl text-slate-500">It's <span className="font-bold text-violet-600">{currentTeam.name}'s</span> turn!</p>
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

const TeamResultCard: React.FC<{ team: Team, index: number }> = ({ team, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-lg flex flex-col animate-enter" style={{animationDelay: `${400 + index * 100}ms`}}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-6xl">{team.avatar}</span>
                    <div>
                        <h4 className="text-2xl font-bold text-slate-800">{team.name}</h4>
                        <p className="text-slate-500 font-medium text-sm mb-1 max-w-md">{team.players.join(', ')}</p>
                        <CLevelBadge level={team.cLevel} />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-md text-slate-500 font-semibold">Round Score</p>
                    <p className="font-bold text-3xl text-slate-700 mb-1">{team.score}</p>
                    <p className="font-bold text-2xl text-amber-500 flex items-center justify-end gap-1.5">{ICONS.token} {team.tokens}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
                 <button onClick={() => setIsExpanded(!isExpanded)} className="font-bold text-lg text-violet-600 hover:underline flex items-center gap-2">
                    💡 Why it Matters {isExpanded ? '▲' : '▼'}
                </button>
                {isExpanded && (
                    <div className="mt-4 space-y-4">
                        {team.answers.map((answer, i) => {
                            const question = team.questions?.find(q => q.id === answer.questionId);
                            if (!question || !question.fact) return null;
                            return (
                                <div key={i} className="bg-slate-100/70 p-4 rounded-lg">
                                    <p className="font-semibold text-slate-600">You chose: <span className="font-normal">"{answer.choice.text}"</span></p>
                                    <p className="mt-2 text-slate-800"><span className="font-bold">Fact:</span> {question.fact.text}</p>
                                    <a href={question.fact.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">Source →</a>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

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
    
    // Effect to handle body scroll lock when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Cleanup function to reset scroll on component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const allTeamChoices = useMemo(() => state.teams.flatMap(t => 
        t.answers.map(ans => ({
            teamName: t.name,
            scenarioTitle: t.scenario.title,
            questionText: t.questions?.find(q => q.id === ans.questionId)?.text || 'Unknown',
            choiceText: ans.choice.text,
            score: ans.choice.score
        }))
    ), [state.teams]);

    useEffect(() => {
        if (state.status === GameStatus.SUMMARY && allTeamChoices.length > 0) {
            const fetchConsequences = async () => {
                setIsLoading(true); setError('');
                try {
                    const result = await generateConsequences(allTeamChoices);
                    setReport(result);
                } catch (err) {
                    setError('Oh no! The AI reporter is on a coffee break.');
                    setReport("Based on your choices, you've definitely made an impact! Reflect on the balance between convenience and what's best for our planet. Every small choice helps write a better future story.");
                } finally { setIsLoading(false); }
            };
            fetchConsequences();
        }
    }, [state.status, allTeamChoices]);
    
    const newAchievements = useMemo(() => state.teams.flatMap(p => p.newAchievements || []), [state.teams]);

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
                    {state.teams.map((team, i) => (
                        <TeamResultCard key={team.id} team={team} index={i} />
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
      case GameStatus.SCENARIO_ASSIGNMENT:
        return <ScenarioAssignmentScreen teams={state.teams} dispatch={dispatch} />;
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

      <main className={`flex-grow flex justify-center py-4 overflow-y-auto ${state.status === GameStatus.SUMMARY ? 'items-start' : 'items-center'}`}>
        {renderGameState()}
      </main>
    </div>
  );
}