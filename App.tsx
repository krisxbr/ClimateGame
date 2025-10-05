import React, { useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { GameState, Team, Scenario, Action, Choice, GameStatus, Achievement, Question, Answer } from './gameData.ts';
import { SCENARIOS, INITIAL_STATE, ICONS, C_LEVEL_STYLES, ACHIEVEMENTS, AVATARS, INDIVIDUAL_SCORING, TEMP_SCORING } from './gameData.ts';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Reducer for game state management
const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      const { teams: newTeamsPayload, questionsPerRound, totalRounds } = action.payload;
      const shuffledScenarios = shuffleArray(state.scenarios).slice(0, newTeamsPayload.length);
      return {
        ...state,
        questionsPerRound,
        totalRounds,
        teams: newTeamsPayload.map((t, i) => {
            const teamScenario = shuffledScenarios[i] || state.scenarios[i % state.scenarios.length]; // Fallback
            
            const allQuestionsWithTheme = Object.entries(teamScenario.questions).flatMap(([theme, questions]) =>
                questions.map(q => ({ ...q, theme }))
            );
            const shuffledUniqueQuestions = shuffleArray(allQuestionsWithTheme);
            let selectedPool = [...shuffledUniqueQuestions];
            while(selectedPool.length < questionsPerRound) {
                selectedPool.push(...shuffledUniqueQuestions);
            }
            const selectedQuestions = selectedPool.slice(0, questionsPerRound).map((q, i) => ({
                ...q,
                id: `${q.id}-${i}`,
                choices: shuffleArray(q.choices)
            }));

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
        currentRound: 1,
      };
    case 'PROCEED_TO_PLAY':
        return { ...state, status: GameStatus.PLAYING };
    case 'ANSWER_QUESTION': {
      const { teamId, questionId, choice } = action.payload;
      const newTeams = state.teams.map(t => {
        if (t.id === teamId) {
          const newAnswers = [...t.answers, { questionId, choice }];
          return { ...t, answers: newAnswers };
        }
        return t;
      });

      // Advance turn logic merged here
      const nextTeamIndex = state.currentTeamIndex + 1;
      if (nextTeamIndex < state.teams.length) {
          return { ...state, teams: newTeams, currentTeamIndex: nextTeamIndex, status: GameStatus.PLAYING };
      }

      const nextQuestionIndex = state.currentQuestionIndex + 1;
      if (nextQuestionIndex < state.questionsPerRound) {
          return { ...state, teams: newTeams, currentTeamIndex: 0, currentQuestionIndex: nextQuestionIndex, status: GameStatus.PLAYING };
      }
      
      // End of round
      return { ...state, teams: newTeams, status: GameStatus.SUMMARY };
    }
    
    case 'CALCULATE_RESULTS': {
        let totalScore = 0;
        const updatedTeams = state.teams.map(team => {
            const newTeam = { ...team, newAchievements: [] as Achievement[] };
            // Note: We are calculating score for the CURRENT round's answers only.
            const currentRoundAnswers = team.answers.slice(-state.questionsPerRound);
            const teamScore = currentRoundAnswers.reduce((sum, ans) => sum + ans.choice.score, 0);
            
            newTeam.score += teamScore; // Accumulate score across rounds
            totalScore += teamScore;

            const scoringRules = INDIVIDUAL_SCORING[state.questionsPerRound];
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
        
        const tempRules = TEMP_SCORING[state.teams.length][state.questionsPerRound];
        const tempResult = tempRules.find(r => totalScore >= r.range[0] && totalScore <= r.range[1]);
        const tempChange = tempResult ? tempResult.change : 0;
      
      return { 
        ...state, 
        teams: updatedTeams, 
        temperature: state.temperature + tempChange,
        lastTempChange: tempChange,
      };
    }
     case 'START_NEXT_ROUND': {
        if (state.currentRound >= state.totalRounds) {
            return { ...INITIAL_STATE, scenarios: shuffleArray(SCENARIOS) };
        }

        const nextRoundScenarios = shuffleArray(state.scenarios).slice(0, state.teams.length);
        const updatedTeams = state.teams.map((team, i) => {
            const teamScenario = nextRoundScenarios[i] || state.scenarios[i % state.scenarios.length];
            
            const allQuestionsWithTheme = Object.entries(teamScenario.questions).flatMap(([theme, questions]) =>
                questions.map(q => ({ ...q, theme }))
            );
            const shuffledUniqueQuestions = shuffleArray(allQuestionsWithTheme);
            let selectedPool = [...shuffledUniqueQuestions];
            while(selectedPool.length < state.questionsPerRound) {
                selectedPool.push(...shuffledUniqueQuestions);
            }
            const selectedQuestions = selectedPool.slice(0, state.questionsPerRound).map((q, i) => ({
                ...q,
                id: `${q.id}-${i}`,
                choices: shuffleArray(q.choices)
            }));

            return {
                ...team,
                answers: [], // Clear answers for the new round
                newAchievements: [],
                scenario: teamScenario,
                questions: selectedQuestions,
            };
        });

        return {
            ...state,
            teams: updatedTeams,
            status: GameStatus.SCENARIO_ASSIGNMENT,
            currentQuestionIndex: 0,
            currentTeamIndex: 0,
            lastTempChange: 0,
            currentRound: state.currentRound + 1,
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

const Modal: React.FC<{ title: React.ReactNode; children: React.ReactNode; onClose: () => void, show: boolean }> = ({ title, children, onClose, show }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white/90 backdrop-blur-2xl border border-white/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6 text-center">{title}</div>
                <div className="space-y-5 text-slate-600 text-lg sm:text-xl leading-relaxed">
                    {children}
                </div>
                <button onClick={onClose} className="mt-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl w-full text-xl sm:text-2xl transition-all shadow-lg hover:shadow-xl">Got it!</button>
            </div>
        </div>
    );
};

const MissionModal: React.FC<{ scenario: Scenario | null; onClose: () => void }> = ({ scenario, onClose }) => {
    if (!scenario) return null;
    return (
        <Modal 
            show={!!scenario}
            onClose={onClose}
            title={
                <div className="flex items-center justify-center gap-4">
                    <span className="text-5xl">{ICONS[scenario.icon]}</span>
                    <span>{scenario.title}</span>
                </div>
            }
        >
           <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">{scenario.description}</p>
        </Modal>
    );
};

const ScoringHelp: React.FC<{ onClose: () => void, show: boolean }> = ({ onClose, show }) => (
    <Modal title="How Scoring Works 🎯" onClose={onClose} show={show}>
        <div className="space-y-5 text-slate-600 text-base sm:text-lg leading-relaxed">
            <div>
                <h4 className="font-bold text-lg sm:text-xl text-violet-600 mb-2">The Goal: Small Choices, Big Impact</h4>
                <p>The game shows how everyday choices add up to affect our planet. Your team's actions are directly linked to the global temperature!</p>
            </div>
            <div>
                <h4 className="font-bold text-lg sm:text-xl text-violet-600 mb-2">1. Your Individual Choices (Lower is Better! ⬇️)</h4>
                <p>Each answer has a hidden score from <span className="font-bold">1 (most eco-friendly)</span> to <span className="font-bold">5 (least eco-friendly)</span>. Your team's goal is to get the <span className="font-bold">lowest score possible</span> by making sustainable choices.</p>
            </div>
            <div>
                <h4 className="font-bold text-lg sm:text-xl text-violet-600 mb-2">2. Your Team's "C-Level" (Climate Report Card 🌟)</h4>
                <p>At the end, your team's total score determines your "C-Level" (e.g., 'Climate Champion'). A better C-Level earns your team more Tokens 🪙 for the next round!</p>
            </div>
            <div>
                <h4 className="font-bold text-lg sm:text-xl text-violet-600 mb-2">3. The Global Temperature (We're All In This Together! 🌍)</h4>
                <p>This is key! We add up the scores from <span className="font-bold">all teams</span>. This combined total decides if the global temperature goes up or down. It proves that collaboration is essential to protect our shared environment. The best collective performance can even <span className="font-bold text-blue-600">LOWER</span> the temperature!</p>
            </div>
            <div>
                <h4 className="font-bold text-lg sm:text-xl text-violet-600 mb-2">Pro-Tips to Win! 💡</h4>
                <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><span className="font-semibold">Think "Less is More":</span> Choices involving walking, using things you own, or choosing local usually have the lowest scores.</li>
                    <li><span className="font-semibold">Convenience Can Cost:</span> The fastest or easiest option (like private cars or single-use items) often has the highest environmental impact and score.</li>
                    <li><span className="font-semibold">Team Up for the Planet:</span> Encourage other teams to aim for low scores too! Everyone's choices affect the final temperature.</li>
                </ul>
            </div>
        </div>
    </Modal>
);

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
        <div className="flex items-center justify-center gap-4 sm:gap-6">
            <div 
                className="relative cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {showTooltip && (
                    <div className={`absolute -top-14 sm:-top-16 w-48 sm:w-56 text-center p-3 rounded-lg text-white text-sm sm:text-md font-semibold shadow-xl z-10 transition-opacity duration-300 ${feedback.color}`}>
                        {feedback.text}
                        <div className={`w-3 h-3 absolute left-1/2 -translate-x-1/2 -bottom-1 rotate-45 ${feedback.color}`}></div>
                    </div>
                )}
                <div className="w-16 h-64 sm:w-20 sm:h-72 bg-slate-200 rounded-full flex items-end p-2 overflow-hidden border-4 border-white shadow-inner">
                     <div
                        className="w-full rounded-full bg-gradient-to-t from-blue-500 to-red-500"
                        style={{ height: `${percentage}%`, transition: 'height 1s ease-in-out' }}
                    />
                </div>
            </div>
            <div className="text-6xl sm:text-7xl font-extrabold text-slate-700 drop-shadow-lg">
                {Math.round(temperature)}°C
            </div>
        </div>
    );
};

const TeamSetupCard: React.FC<{
    team: { name: string, avatar: string, players: string[] },
    index: number,
    onTeamChange: (team: { name: string, avatar: string, players: string[] }) => void,
    error?: string,
}> = ({ team, index, onTeamChange, error }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    const avatarIndex = AVATARS.indexOf(team.avatar);
    
    const nextAvatar = () => {
        const nextIndex = (avatarIndex + 1) % AVATARS.length;
        onTeamChange({ ...team, avatar: AVATARS[nextIndex] });
    };
    
    const handleAddPlayer = () => {
        if (newPlayerName.trim() !== '') {
            onTeamChange({ ...team, players: [...team.players, newPlayerName.trim()] });
            setNewPlayerName('');
        }
    };

    const handleRemovePlayer = (playerIndex: number) => {
        const updatedPlayers = team.players.filter((_, i) => i !== playerIndex);
        onTeamChange({ ...team, players: updatedPlayers });
    };

    const handlePlayerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddPlayer();
        }
    };

    const nameHasError = error && error.includes('name');
    const playersHasError = error && error.includes('player');

    return (
        <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col gap-4 animate-enter" style={{animationDelay: `${index * 100}ms`}}>
            <div className="flex items-center gap-3">
                <button onClick={nextAvatar} className="text-4xl hover:scale-110 transition-transform">{team.avatar}</button>
                <input 
                    type="text" 
                    value={team.name} 
                    onChange={e => onTeamChange({...team, name: e.target.value})} 
                    placeholder={`Team ${index + 1}`} 
                    className={`w-full bg-slate-100 text-slate-800 p-3 rounded-xl text-lg font-semibold border-2 focus:outline-none transition-all ${nameHasError ? 'border-red-400 ring-2 ring-red-100' : 'border-transparent focus:ring-2 focus:ring-violet-500'}`} />
            </div>
            <div className="min-h-[40px] flex flex-wrap gap-2 items-center">
                {team.players.map((player, pIndex) => (
                    <div key={pIndex} className="bg-violet-100 text-violet-800 text-sm font-semibold px-2.5 py-1 rounded-full flex items-center gap-2">
                        <span>{player}</span>
                        <button onClick={() => handleRemovePlayer(pIndex)} className="w-4 h-4 bg-violet-200 text-violet-600 rounded-full flex items-center justify-center text-xs font-bold hover:bg-violet-300 transition-colors">✕</button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    onKeyDown={handlePlayerKeyDown}
                    placeholder="Add player name"
                    className={`flex-grow bg-slate-100 text-slate-700 p-2 rounded-lg text-sm border-2 focus:outline-none transition-all ${playersHasError ? 'border-red-400 ring-2 ring-red-100' : 'border-transparent focus:ring-2 focus:ring-violet-400'}`}
                />
                <button onClick={handleAddPlayer} className="bg-violet-500 text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center hover:bg-violet-600 transition-colors">+</button>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>}
        </div>
    );
};

const Lobby: React.FC<{ onStartGame: (teams: {name: string, avatar: string, players: string[]}[], questionsPerRound: 3 | 4 | 6, totalRounds: number) => void }> = ({ onStartGame }) => {
    const [teams, setTeams] = useState<{ name: string, avatar: string, players: string[] }[]>([
        { name: 'Team Alpha', avatar: AVATARS[0], players: [] },
        { name: 'Team Beta', avatar: AVATARS[1], players: [] },
    ]);
    const [questionsPerRound, setQuestionsPerRound] = useState<3 | 4 | 6>(3);
    const [totalRounds, setTotalRounds] = useState(3);
    const [errors, setErrors] = useState<(string | undefined)[]>([]);

    const handleTeamChange = (index: number, updatedTeam: { name: string, avatar: string, players: string[] }) => {
        const newTeams = [...teams];
        newTeams[index] = updatedTeam;
        setTeams(newTeams);
    };

    const addTeam = () => {
        if (teams.length < 6) {
            setTeams([...teams, { name: `Team ${teams.length + 1}`, avatar: AVATARS[teams.length % AVATARS.length], players: [] }]);
        }
    };
    
    const removeTeam = (index: number) => {
        if (teams.length > 2) {
            setTeams(teams.filter((_, i) => i !== index));
        }
    };

    const handleStart = () => {
        const newErrors = teams.map(team => {
            if (team.name.trim() === '') return 'Team name cannot be empty.';
            if (team.players.length === 0) return 'Team must have at least one player.';
            return undefined;
        });

        if (newErrors.some(e => e)) {
            setErrors(newErrors);
            return;
        }
        
        setErrors([]);
        onStartGame(teams, questionsPerRound, totalRounds);
    };
    
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <header className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-800">Give Climate a ChanCe</h1>
                <p className="text-slate-500 text-lg md:text-xl mt-2">The Interactive Climate Adventure Game</p>
            </header>
            
            <main className="w-full max-w-5xl bg-white/50 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50">
                <h2 className="text-3xl font-bold text-slate-700 mb-6 text-center">Game Setup</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {teams.map((team, index) => (
                         <div key={index} className="relative">
                            <TeamSetupCard 
                                team={team} 
                                index={index}
                                onTeamChange={(updatedTeam) => handleTeamChange(index, updatedTeam)}
                                error={errors[index]}
                            />
                            {teams.length > 2 && (
                                <button onClick={() => removeTeam(index)} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm hover:bg-red-600 transition-transform hover:scale-110">✕</button>
                            )}
                        </div>
                    ))}
                    {teams.length < 6 && (
                        <button onClick={addTeam} className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-slate-400 transition-all p-8 min-h-[250px]">
                            <span className="text-4xl">+</span>
                            <span className="font-semibold">Add Team</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-slate-600 font-semibold mb-2">Questions per Round</label>
                        <select value={questionsPerRound} onChange={e => setQuestionsPerRound(Number(e.target.value) as 3 | 4 | 6)} className="w-full p-3 bg-slate-100 rounded-xl text-lg font-semibold border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
                            <option value="3">3 Questions (Quick)</option>
                            <option value="4">4 Questions (Standard)</option>
                            <option value="6">6 Questions (Full)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-slate-600 font-semibold mb-2">Number of Rounds</label>
                        <select value={totalRounds} onChange={e => setTotalRounds(Number(e.target.value))} className="w-full p-3 bg-slate-100 rounded-xl text-lg font-semibold border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all">
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Round{n > 1 ? 's' : ''}</option>)}
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleStart} 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-8 rounded-2xl text-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse-glow"
                >
                    Start The Adventure!
                </button>
            </main>
        </div>
    );
};

const GameHeader: React.FC<{
    teams: Team[];
    currentTeamIndex: number;
    questionIndex: number;
    totalQuestions: number;
    currentRound: number;
    totalRounds: number;
    isScenarioScreen?: boolean;
}> = ({ teams, currentTeamIndex, questionIndex, totalQuestions, currentRound, totalRounds, isScenarioScreen = false }) => {
    const questionDots = Array.from({ length: totalQuestions }, (_, i) => i);
    
    return (
        <header className="w-full bg-white/80 backdrop-blur-lg py-2 shadow-md sticky top-0 z-20 border-b border-white/50">
            <div className="w-full max-w-7xl mx-auto px-4 relative min-h-[100px] flex items-center">
                {/* Round Info */}
                <div className="absolute top-4 left-4 bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-base font-bold shadow-sm">
                    Round {currentRound}/{totalRounds}
                </div>
                
                {/* Team Widgets Container */}
                <div className="w-full flex justify-center items-end gap-4 py-2">
                    {teams.map((team, index) => {
                        const isCurrent = !isScenarioScreen && index === currentTeamIndex;

                        return (
                            <div 
                                key={team.id} 
                                className={`p-3 rounded-xl transition-all duration-300 w-64
                                    ${isCurrent 
                                        ? 'bg-violet-100 shadow-lg shadow-violet-500/20' 
                                        : 'bg-white opacity-70'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{team.avatar}</span>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-bold text-base text-slate-800 truncate" title={team.name}>{team.name}</p>
                                        <div className="flex flex-wrap gap-1 mt-1" title={team.players.join(', ')}>
                                            {team.players.map(player => (
                                                <span key={player} className="bg-violet-200 text-violet-800 text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {player}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {isCurrent && (
                                    <div className="flex items-center justify-center gap-1.5 mt-2 px-1">
                                        {questionDots.map(i => {
                                            const isAnswered = i < questionIndex;
                                            const isCurrentQuestion = i === questionIndex;
                                            return (
                                                <div key={i} className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500
                                                            ${isCurrentQuestion ? 'w-full bg-violet-500 animate-pulse' : ''}
                                                            ${isAnswered ? 'w-full bg-violet-300' : 'w-0'}
                                                        `}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </header>
    );
};

const ScenarioAssignmentScreen: React.FC<{
    teams: Team[];
    onProceed: () => void;
    onReshuffle: () => void;
    onShowMission: (scenario: Scenario) => void;
    currentRound: number;
    totalRounds: number;
    questionsPerRound: number;
}> = ({ teams, onProceed, onReshuffle, onShowMission, currentRound, totalRounds, questionsPerRound }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center">
            {teams.length > 0 && (
                <GameHeader 
                    teams={teams}
                    currentTeamIndex={0}
                    questionIndex={0}
                    totalQuestions={questionsPerRound}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                    isScenarioScreen={true}
                />
            )}
            <div className="flex flex-col items-center justify-center p-4 flex-grow">
                <header className="text-center my-8 animate-enter">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">Your Adventures Await!</h1>
                    <p className="text-slate-500 text-lg md:text-xl mt-2">Each team has a unique scenario. Click a card to read your mission!</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mb-8">
                    {teams.map((team, index) => (
                        <div 
                            key={team.id} 
                            onClick={() => onShowMission(team.scenario)}
                            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center animate-enter cursor-pointer transition-transform hover:scale-105 hover:shadow-xl" 
                            style={{animationDelay: `${index * 150}ms`}}
                        >
                            <div className="text-5xl mb-3">{team.avatar}</div>
                            <h3 className="text-2xl font-bold text-slate-700">{team.name}</h3>
                            <p className="text-slate-500 mb-4">{team.players.join(', ')}</p>
                            <div className={`p-4 rounded-xl w-full ${team.scenario.color}`}>
                                <div className="text-4xl">{ICONS[team.scenario.icon]}</div>
                                <h4 className="text-xl font-bold text-white mt-2">{team.scenario.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 animate-enter" style={{animationDelay: `${teams.length * 150}ms`}}>
                    <button onClick={onReshuffle} className="bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 font-bold py-3 px-6 rounded-xl text-lg transition-all shadow-md hover:shadow-lg">
                        Reshuffle Scenarios
                    </button>
                    <button onClick={onProceed} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                        Let's Go!
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuestionScreen: React.FC<{
    teams: Team[];
    currentTeamIndex: number;
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    onAnswer: (choice: Choice) => void;
    currentRound: number;
    totalRounds: number;
}> = ({ teams, currentTeamIndex, question, questionIndex, totalQuestions, onAnswer, currentRound, totalRounds }) => {
    const team = teams[currentTeamIndex];
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
            <GameHeader 
                teams={teams}
                currentTeamIndex={currentTeamIndex}
                questionIndex={questionIndex}
                totalQuestions={totalQuestions}
                currentRound={currentRound}
                totalRounds={totalRounds}
            />
            <div className="w-full max-w-7xl mx-auto flex-grow grid lg:grid-cols-2 gap-8 items-center py-8 px-4 sm:px-6">
                {/* Left Column: Mission Details */}
                <div className="bg-white/50 backdrop-blur-lg rounded-3xl p-6 lg:p-8 flex flex-col justify-center animate-enter border border-white/50 shadow-lg">
                    <div className="text-center lg:text-left">
                        <h2 className="text-5xl font-extrabold text-slate-700 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4">
                            <span className={`text-6xl p-3 rounded-2xl ${team.scenario.color} text-white`}>{ICONS[team.scenario.icon]}</span>
                            <span>{team.scenario.title}</span>
                        </h2>
                        <p className="mt-6 text-2xl text-slate-600 leading-relaxed">
                            {team.scenario.description}
                        </p>
                    </div>
                </div>

                {/* Right Column: Question & Choices */}
                <div className="animate-enter" style={{animationDelay: '200ms'}}>
                     <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                        <p className="text-3xl font-semibold text-slate-800 mb-10 leading-snug">{question.text}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {question.choices.map((choice, i) => (
                                <button 
                                    key={choice.id}
                                    onClick={() => onAnswer(choice)}
                                    className="text-left p-5 bg-slate-50 rounded-xl hover:bg-violet-100 hover:ring-4 hover:ring-violet-200 transition-all transform hover:scale-105 animate-enter"
                                    style={{animationDelay: `${300 + i * 100}ms`}}
                                >
                                    <p className="text-slate-700 text-xl">{choice.text}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryScreen: React.FC<{
    state: GameState;
    onCalculateResults: () => void;
    onNextRound: () => void;
}> = ({ state, onCalculateResults, onNextRound }) => {
    const { teams, lastTempChange, temperature, currentRound, totalRounds, questionsPerRound } = state;
    const [showScoringHelp, setShowScoringHelp] = useState(false);
    const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});

    useEffect(() => {
        onCalculateResults();
    }, []);
    
    const toggleFacts = (teamId: string) => {
        setExpandedFacts(prev => ({ ...prev, [teamId]: !prev[teamId] }));
    };

    const isGameOver = currentRound >= totalRounds;

    return (
        <>
            <ScoringHelp show={showScoringHelp} onClose={() => setShowScoringHelp(false)} />
            <div className="min-h-screen bg-slate-50 flex flex-col items-center">
                {teams.length > 0 && (
                    <GameHeader 
                        teams={teams}
                        currentTeamIndex={-1}
                        questionIndex={questionsPerRound}
                        totalQuestions={questionsPerRound}
                        currentRound={currentRound}
                        totalRounds={totalRounds}
                    />
                )}
                <div className="flex-grow flex flex-col items-center p-4 sm:p-6 w-full">
                    <header className="text-center my-8 animate-enter">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800">Round {currentRound} Complete!</h1>
                        <p className="text-slate-500 text-lg sm:text-xl mt-2">Let's see how everyone did and what happened to the planet.</p>
                    </header>
                    
                    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Team Results */}
                        <div className="lg:col-span-2 space-y-6">
                             {teams.map((team, index) => {
                                const isExpanded = expandedFacts[team.id];
                                return (
                                    <div key={team.id} className="bg-white p-5 rounded-2xl shadow-lg animate-enter" style={{animationDelay: `${index * 150}ms`}}>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="text-5xl">{team.avatar}</div>
                                            <div className="flex-grow text-center sm:text-left">
                                                <h3 className="text-2xl font-bold text-slate-700">{team.name}</h3>
                                                <p className="text-slate-500">Total Score: <span className="font-bold">{team.score}</span></p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                 <div className={`px-4 py-2 rounded-full text-md font-semibold text-center ${C_LEVEL_STYLES[team.cLevel]?.className}`}>
                                                    {C_LEVEL_STYLES[team.cLevel]?.emoji} {team.cLevel}
                                                </div>
                                                <div className="bg-slate-100 px-4 py-2 rounded-full text-md font-semibold text-slate-700">
                                                    {ICONS.token} {team.tokens}
                                                </div>
                                            </div>
                                        </div>
                                        {team.newAchievements && team.newAchievements.length > 0 && (
                                            <div className="mt-4 border-t pt-3 flex flex-wrap gap-3">
                                                {team.newAchievements.map(ach => (
                                                    <div key={ach.id} className="bg-yellow-100 text-yellow-800 font-semibold p-2 px-3 rounded-full text-sm animate-pop-in">
                                                       {ach.icon} New Achievement: {ach.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button onClick={() => toggleFacts(team.id)} className="mt-4 w-full flex justify-between items-center text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                                            <span className="font-semibold text-slate-600 flex items-center gap-2">💡<span>Review Questions &amp; Facts</span></span>
                                            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                                        </button>
                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-6 animate-enter">
                                                {team.answers.slice(-questionsPerRound).map(answer => {
                                                    const question = team.questions?.find(q => q.id === answer.questionId);
                                                    if (!question || !question.fact) return null;
                                                    return (
                                                        <div key={question.id}>
                                                            <p className="font-semibold text-slate-800 text-lg">{question.text}</p>
                                                             <div className="mt-2 text-slate-700 bg-violet-50 p-3 rounded-lg border border-violet-200">
                                                                <div className="flex justify-between items-center gap-2">
                                                                    <p><span className="font-bold text-violet-800">Your answer:</span> {answer.choice.text}</p>
                                                                    <span className="font-bold text-violet-600 bg-violet-200 px-2 py-1 rounded-full text-sm whitespace-nowrap">+{answer.choice.score} pts</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 text-base bg-slate-100 p-3 rounded-lg">
                                                                <p className="font-bold text-slate-600 flex items-center gap-2">💡 Must-to-know Fact</p>
                                                                <p className="text-slate-600 mt-1">{question.fact.text}</p>
                                                                <a href={question.fact.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold text-sm mt-2 inline-block">
                                                                    Source ↗
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Right Column: Global Temperature */}
                        <div className="space-y-6 animate-enter" style={{animationDelay: '500ms'}}>
                            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
                                 <h3 className="text-2xl font-bold text-slate-700 mb-4">Global Temperature</h3>
                                 <VerticalPillThermometer temperature={temperature} />
                                 <p className={`mt-4 text-2xl font-bold text-center ${lastTempChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                    {lastTempChange > 0 ? `+${lastTempChange.toFixed(1)}°C` : lastTempChange < 0 ? `${lastTempChange.toFixed(1)}°C` : 'No change'}
                                 </p>
                                 <p className="text-slate-500 text-center mt-1">This round, your collective choices changed the temperature.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-enter" style={{animationDelay: '800ms'}}>
                         <button onClick={onNextRound} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-8 rounded-2xl text-xl sm:text-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                            {isGameOver ? 'Play Again' : `Start Round ${currentRound + 1}`}
                        </button>
                        <button onClick={() => setShowScoringHelp(true)} className="text-slate-500 font-semibold hover:text-violet-600 transition-colors">
                            How does scoring work?
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- APP ---
const App: React.FC = () => {
    const [state, dispatch] = useReducer(gameReducer, { ...INITIAL_STATE, scenarios: shuffleArray(SCENARIOS) });
    const [missionModalScenario, setMissionModalScenario] = useState<Scenario | null>(null);

    const handleStartGame = useCallback((teams: {name: string, avatar: string, players: string[]}[], questionsPerRound: 3 | 4 | 6, totalRounds: number) => {
        dispatch({ type: 'START_GAME', payload: { teams, questionsPerRound, totalRounds } });
    }, []);

    const handleProceedToPlay = useCallback(() => {
        dispatch({ type: 'PROCEED_TO_PLAY' });
    }, []);
    
    const handleReshuffle = useCallback(() => {
        dispatch({ type: 'RESHUFFLE_SCENARIOS' });
    }, []);

    const handleAnswer = useCallback((choice: Choice) => {
        const currentTeam = state.teams[state.currentTeamIndex];
        const currentQuestion = currentTeam.questions![state.currentQuestionIndex];
        dispatch({ type: 'ANSWER_QUESTION', payload: { teamId: currentTeam.id, questionId: currentQuestion.id, choice } });
    }, [state.teams, state.currentTeamIndex, state.currentQuestionIndex]);
    
    const handleCalculateResults = useCallback(() => {
        dispatch({ type: 'CALCULATE_RESULTS' });
    }, []);

    const handleNextRound = useCallback(() => {
        if (state.currentRound >= state.totalRounds) {
            dispatch({ type: 'RESTART' });
        } else {
            dispatch({ type: 'START_NEXT_ROUND' });
        }
    }, [state.currentRound, state.totalRounds]);
    
    const handleShowMission = useCallback((scenario: Scenario) => {
        setMissionModalScenario(scenario);
    }, []);
    
    const renderGameState = () => {
        switch (state.status) {
            case GameStatus.LOBBY:
                return <Lobby onStartGame={handleStartGame} />;
            case GameStatus.SCENARIO_ASSIGNMENT:
                return <ScenarioAssignmentScreen 
                    teams={state.teams} 
                    onProceed={handleProceedToPlay} 
                    onReshuffle={handleReshuffle}
                    onShowMission={handleShowMission}
                    currentRound={state.currentRound}
                    totalRounds={state.totalRounds}
                    questionsPerRound={state.questionsPerRound}
                />;
            case GameStatus.PLAYING: {
                const currentTeam = state.teams[state.currentTeamIndex];
                const currentQuestion = currentTeam.questions?.[state.currentQuestionIndex];
                if (!currentTeam || !currentQuestion) {
                    return <div>Error: Could not load question.</div>;
                }
                return (
                    <QuestionScreen 
                        teams={state.teams}
                        currentTeamIndex={state.currentTeamIndex}
                        question={currentQuestion}
                        questionIndex={state.currentQuestionIndex}
                        totalQuestions={currentTeam.questions?.length || 0}
                        onAnswer={handleAnswer}
                        currentRound={state.currentRound}
                        totalRounds={state.totalRounds}
                    />
                );
            }
            case GameStatus.SUMMARY:
                return <SummaryScreen state={state} onCalculateResults={handleCalculateResults} onNextRound={handleNextRound} />;
            default:
                return <div>Unknown game state</div>;
        }
    };

    return (
        <div className="bg-slate-100">
            <MissionModal scenario={missionModalScenario} onClose={() => setMissionModalScenario(null)} />
            {renderGameState()}
        </div>
    );
};

export default App;