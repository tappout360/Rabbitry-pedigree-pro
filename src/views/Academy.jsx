import React, { useState, useEffect, useMemo } from 'react';
import { Award, BookOpen, Brain, CheckCircle, HelpCircle, Trophy, RefreshCw, Star, Play, Award as BadgeIcon, Printer, ShieldCheck } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../db/quizQuestions';
import { db } from '../db/registryDb';

// Rabbit Anatomy Parts for the SVG Locator (22 parts)
const ANATOMY_PARTS = [
  { name: "Ears", cx: 120, cy: 55, r: 16, label: "Ears 👂" },
  { name: "Crown", cx: 145, cy: 85, r: 12, label: "Crown 👑" },
  { name: "Eyes", cx: 162, cy: 100, r: 8, label: "Eyes 👁️" },
  { name: "Nose", cx: 195, cy: 122, r: 9, label: "Nose 👃" },
  { name: "Teeth", cx: 190, cy: 138, r: 9, label: "Teeth 🦷" },
  { name: "Dewlap", cx: 155, cy: 165, r: 18, label: "Dewlap (Chin skin) 🐑" },
  { name: "Shoulder", cx: 110, cy: 155, r: 20, label: "Shoulder 💪" },
  { name: "Loin", cx: 70, cy: 145, r: 22, label: "Loin 🥩" },
  { name: "Rump", cx: 40, cy: 165, r: 25, label: "Rump 🍑" },
  { name: "Hock", cx: 45, cy: 220, r: 15, label: "Hock (Ankle) 🦵" },
  { name: "Tail", cx: 15, cy: 175, r: 12, label: "Tail 🥕" }
];

const CAVY_ANATOMY_PARTS = [
  { name: "Crown / Crest", cx: 140, cy: 80, r: 12, label: "Crown / Crest 👑" },
  { name: "Ears", cx: 120, cy: 60, r: 10, label: "Ears 👂" },
  { name: "Eyes", cx: 160, cy: 92, r: 8, label: "Eyes 👁️" },
  { name: "Nose", cx: 190, cy: 110, r: 9, label: "Nose 👃" },
  { name: "Saddle", cx: 80, cy: 120, r: 24, label: "Saddle / Back 🥩" },
  { name: "Hindquarters", cx: 45, cy: 140, r: 22, label: "Hindquarters 🍑" }
];

import { calculateArbaDivision, getDivisionQuizLevel } from '../db/helpers';

export default function Academy({
  rabbits,
  triggerConfetti,
  currentUser
}) {
  const divisionInfo = calculateArbaDivision(currentUser?.birthdate);
  const userDivision = divisionInfo.division;

  // Gamification States
  const [points, setPoints] = useState(() => Number(localStorage.getItem('academy_points')) || 0);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('academy_streak')) || 1);
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    const saved = localStorage.getItem('academy_badges');
    return saved ? JSON.parse(saved) : ["Newbie Hopper 🐇"];
  });

  // Navigation / Mode selection
  const [academyMode, setAcademyMode] = useState('menu'); // menu, quiz, anatomy, study, parent
  
  // Quiz Engine States
  const [quizLevel, setQuizLevel] = useState(() => getDivisionQuizLevel(userDivision));
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [mascotMood, setMascotMood] = useState('happy'); // happy, thinking, cheering, shield

  // Anatomy Locator States
  const [anatomyTargetIdx, setAnatomyTargetIdx] = useState(0);
  const [anatomyScore, setAnatomyScore] = useState(0);
  const [anatomyFeedback, setAnatomyFeedback] = useState('');
  const [anatomyComplete, setAnatomyComplete] = useState(false);

  // Study Mode State
  const [studyIdx, setStudyIdx] = useState(0);

  // Parent/Leader States & Multi-Exhibitor Database
  const [parentExhibitorName, setParentExhibitorName] = useState('Hop Master');
  const [members, setMembers] = useState([]);
  const [activeMemberId, setActiveMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState(10);
  const [coachFeedbackText, setCoachFeedbackText] = useState('');
  const [assignedQuizLevel, setAssignedQuizLevel] = useState('Beginner');
  const [quizLogs, setQuizLogs] = useState([]);

  // Anatomy Game Species Switcher
  const [anatomySpecies, setAnatomySpecies] = useState('rabbit');

  // Load members from Dexie
  const loadMembers = async () => {
    try {
      const list = await db.youthProgress.toArray();
      if (list.length === 0) {
        const seed = [
          { id: 'm-1', memberName: 'Johnny Miller', ageGroup: 'Intermediate', currentLevel: 3, xp: 240, streak: 5, lastActiveDate: '2026-07-12', coachId: currentUser?.id || 'ab-1' },
          { id: 'm-2', memberName: 'Emily Stone', ageGroup: 'Junior', currentLevel: 1, xp: 80, streak: 2, lastActiveDate: '2026-07-11', coachId: currentUser?.id || 'ab-1' }
        ];
        await db.youthProgress.bulkAdd(seed);
        setMembers(seed);
        setActiveMemberId(seed[0].id);
      } else {
        setMembers(list);
        if (list.length > 0 && !activeMemberId) {
          setActiveMemberId(list[0].id);
        }
      }
      
      const logs = await db.youthQuizLogs.toArray();
      setQuizLogs(logs);
    } catch (e) {
      console.error("Error loading youth progress:", e);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [academyMode]);

  const activeMember = useMemo(() => {
    return members.find(m => m.id === activeMemberId) || null;
  }, [activeMemberId, members]);

  // Sync exhibitor name with selected child
  useEffect(() => {
    if (activeMember) {
      setParentExhibitorName(activeMember.memberName);
    }
  }, [activeMember]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName) return;
    
    let division = 'Junior';
    if (newMemberAge >= 12 && newMemberAge <= 14) division = 'Intermediate';
    else if (newMemberAge >= 15) division = 'Senior';

    const newM = {
      id: 'm-' + Date.now(),
      memberName: newMemberName,
      ageGroup: division,
      currentLevel: 1,
      xp: 0,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      coachId: currentUser?.id || 'ab-1'
    };

    await db.youthProgress.add(newM);
    setNewMemberName('');
    await loadMembers();
    setActiveMemberId(newM.id);
  };

  const handleSaveFeedback = async () => {
    if (!activeMember) return;
    
    const log = {
      id: 'log-' + Date.now(),
      progressId: activeMember.id,
      quizType: 'Coach Review',
      score: 100,
      passed: true,
      date: new Date().toISOString().split('T')[0],
      coachFeedback: coachFeedbackText
    };
    await db.youthQuizLogs.add(log);
    
    alert(`Feedback saved for ${activeMember.memberName}: "${coachFeedbackText}"`);
    setCoachFeedbackText('');
    loadMembers();
  };
  // Showmanship Scoring Simulator States
  const [scoringScenarioIdx, setScoringScenarioIdx] = useState(0);
  const [inputScores, setInputScores] = useState({ attire: 10, carry: 5, pose: 10, exam: 40, qa: 30 });
  const [scoringFeedback, setScoringFeedback] = useState('');
  const [scoringComplete, setScoringComplete] = useState(false);
  const [parentClubName, setParentClubName] = useState('WarrenWise 4-H Club');

  // Save Stats to LocalStorage
  const addPoints = (amount) => {
    setPoints(prev => {
      const next = prev + amount;
      localStorage.setItem('academy_points', next);
      
      // Unlock badge thresholds
      if (next >= 100 && !unlockedBadges.includes("Showmanship Star 🏆")) {
        unlockBadge("Showmanship Star 🏆");
      }
      if (next >= 250 && !unlockedBadges.includes("Breed Master 🎓")) {
        unlockBadge("Breed Master 🎓");
      }
      if (next >= 500 && !unlockedBadges.includes("WarrenWise Scholar 👑")) {
        unlockBadge("WarrenWise Scholar 👑");
      }
      return next;
    });
  };

  const unlockBadge = (badgeName) => {
    setUnlockedBadges(prev => {
      const next = [...prev, badgeName];
      localStorage.setItem('academy_badges', JSON.stringify(next));
      triggerConfetti();
      return next;
    });
  };

  // Generate Questions for selected level
  const startQuiz = (level) => {
    setQuizLevel(level);
    const filtered = QUIZ_QUESTIONS.filter(q => q.level === level);
    // Shuffle questions
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuizQuestions(shuffled);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setQuizScore(0);
    setShowExplanation(false);
    setMascotMood('thinking');
    setAcademyMode('quiz');
  };

  // Submit Answer
  const handleAnswerSubmit = (option) => {
    if (answerSubmitted) return;
    setSelectedAnswer(option);
    setAnswerSubmitted(true);
    
    const question = quizQuestions[currentQuestionIdx];
    if (option === question.answer) {
      setQuizScore(prev => prev + 1);
      addPoints(10);
      setMascotMood('cheering');
      triggerConfetti();
    } else {
      setMascotMood('shield');
    }
    setShowExplanation(true);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIdx + 1 < quizQuestions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setShowExplanation(false);
      setMascotMood('thinking');
    } else {
      // Quiz complete
      if (quizScore === quizQuestions.length) {
        addPoints(50); // bonus for perfect score
        unlockBadge(`${quizLevel} Champion 🏅`);
      }
      // Increment streak
      setStreak(prev => {
        const next = prev + 1;
        localStorage.setItem('academy_streak', next);
        return next;
      });
      alert(`Quiz Finished! You got ${quizScore}/${quizQuestions.length} correct and earned ${quizScore * 10} points!`);
      setAcademyMode('menu');
    }
  };

  // Anatomy Click Handler
  const handleAnatomyClick = (partName) => {
    if (anatomyComplete) return;
    const partsList = anatomySpecies === 'cavy' ? CAVY_ANATOMY_PARTS : ANATOMY_PARTS;
    const target = partsList[anatomyTargetIdx].name;
    if (partName === target) {
      setAnatomyScore(prev => prev + 1);
      addPoints(15);
      setAnatomyFeedback('🎉 Correct! That is the ' + partName + '!');
      triggerConfetti();
      
      if (anatomyTargetIdx + 1 < partsList.length) {
        setAnatomyTargetIdx(prev => prev + 1);
      } else {
        setAnatomyComplete(true);
        unlockBadge(anatomySpecies === 'cavy' ? "Cavy Anatomy Expert 🐹" : "Anatomy Expert 🐇");
        addPoints(50); // Bonus
      }
    } else {
      setAnatomyFeedback('❌ Oops! That is the ' + partName + '. Try to find the ' + target + '!');
    }
  };

  // Print Certificate on Canvas
  const drawCertificate = () => {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Forest Glassy border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 15;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WARRENWISE 4-H ACADEMY', canvas.width / 2, 80);
    
    ctx.fillStyle = '#10b981';
    ctx.font = '24px Outfit, sans-serif';
    ctx.fillText('Certificate of Achievement', canvas.width / 2, 120);

    // Body
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'italic 18px Inter, sans-serif';
    ctx.fillText('This is proudly awarded to', canvas.width / 2, 170);

    // Kid Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Outfit, sans-serif';
    ctx.fillText(parentExhibitorName, canvas.width / 2, 215);

    // Accomplishment
    ctx.fillStyle = '#f8fafc';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`For outstanding knowledge in Rabbitry Showmanship, Anatomy, and Care`, canvas.width / 2, 260);
    ctx.fillText(`with ${parentClubName}`, canvas.width / 2, 285);

    // Score and Points
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText(`Total Points Earned: ${points} XP | Badges Earned: ${unlockedBadges.length}`, canvas.width / 2, 330);

    // Signature Line
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('__________________________', 200, 390);
    ctx.fillText('4-H Leader / Supervisor Signature', 200, 410);

    ctx.fillText('__________________________', 600, 390);
    ctx.fillText('WarrenWise Rabbitry Mascot Approval', 600, 410);

    // Draw mascot emoticon
    ctx.font = '40px Inter';
    ctx.fillText('🐇👑', 600, 360);
  };

  useEffect(() => {
    if (academyMode === 'parent') {
      drawCertificate();
    }
  }, [academyMode, parentExhibitorName, parentClubName]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Academy header & Mascot Banner */}
      <div className="glass-container p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/30">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg animate-bounce">
            🎓
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">WarrenWise 4-H Academy</h2>
            {currentUser?.birthdate && (
              <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-1.5">
                Division: {userDivision} {divisionInfo.age !== null && `(Age: ${divisionInfo.age})`}
              </span>
            )}
            <p className="text-sm opacity-90 text-emerald-300 font-semibold flex items-center gap-1.5 mt-1">
              <span>🥕 Study Showmanship, Anatomy, & Breed Standards!</span>
            </p>
          </div>
        </div>

        {/* Stats display */}
        <div className="flex gap-4 shrink-0">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-yellow-400">Total XP</span>
            <p className="text-xl font-bold text-white">{points} pts</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-sky-400">Quiz Streak</span>
            <p className="text-xl font-bold text-white">🔥 {streak} Days</p>
          </div>
        </div>
      </div>

      {/* Main Mode Controller */}
      {academyMode === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Main selection cards */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Quiz Card */}
            <div className="glass-container p-6 flex flex-col justify-between gap-4 border border-violet-500/20 hover:border-violet-500/40 transition-all group">
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xl">
                  ❓
                </div>
                <h3 className="text-lg font-black group-hover:text-violet-300 transition-colors">ARBA & 4-H Knowledge Quiz</h3>
                <p className="text-xs opacity-75">Test your rabbit wits! Multiple levels. Earn points, certificates, and badges.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startQuiz('Beginner')} className="btn-interactive text-xs py-1.5 px-3 bg-violet-600 border-none font-bold text-white">Beginner</button>
                <button onClick={() => startQuiz('Junior')} className="btn-interactive text-xs py-1.5 px-3 bg-indigo-600 border-none font-bold text-white">Junior</button>
                <button onClick={() => startQuiz('Senior')} className="btn-interactive text-xs py-1.5 px-3 bg-fuchsia-600 border-none font-bold text-white">Senior</button>
              </div>
            </div>

            {/* Anatomy Locator Card */}
            <div className="glass-container p-6 flex flex-col justify-between gap-4 border border-amber-500/20 hover:border-amber-500/40 transition-all group">
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xl">
                  🐰
                </div>
                <h3 className="text-lg font-black group-hover:text-amber-300 transition-colors">Rabbit Anatomy Game</h3>
                <p className="text-xs opacity-75">Identify the 22+ parts of the rabbit interactively! Perfect practice for showmanship judges.</p>
              </div>
              <button 
                onClick={() => {
                  setAnatomyTargetIdx(0);
                  setAnatomyScore(0);
                  setAnatomyFeedback('');
                  setAnatomyComplete(false);
                  setAcademyMode('anatomy');
                }}
                className="btn-interactive w-full text-xs bg-amber-600 border-none font-bold text-white flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Start Anatomy Practice
              </button>
            </div>

            {/* Flashcard Study Card */}
            <div className="glass-container p-6 flex flex-col justify-between gap-4 border border-sky-500/20 hover:border-sky-500/40 transition-all group">
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xl">
                  📖
                </div>
                <h3 className="text-lg font-black group-hover:text-sky-300 transition-colors">Hop-To-Study Cards</h3>
                <p className="text-xs opacity-75 font-medium">Browse ARBA breed types, standard weights, and official 4-H care rules.</p>
              </div>
              <button 
                onClick={() => {
                  setStudyIdx(0);
                  setAcademyMode('study');
                }}
                className="btn-interactive w-full text-xs bg-sky-600 border-none font-bold text-white flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Open Study Deck
              </button>
            </div>

            {/* Leader Tools / Certificates Card */}
            <div className="glass-container p-6 flex flex-col justify-between gap-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xl">
                  📜
                </div>
                <h3 className="text-lg font-black group-hover:text-emerald-300 transition-colors">Parent & Leader Reports</h3>
                <p className="text-xs opacity-75">Verify learning history and export official 4-H record book certificates.</p>
              </div>
              <button 
                onClick={() => setAcademyMode('parent')}
                className="btn-interactive w-full text-xs bg-emerald-600 border-none font-bold text-white flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Manage Certificates
              </button>
            </div>

            {/* Showmanship Scoring Simulator Card */}
            <div className="glass-container p-6 flex flex-col justify-between gap-4 border border-pink-500/20 hover:border-pink-500/40 transition-all group">
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xl">
                  ⚖️
                </div>
                <h3 className="text-lg font-black group-hover:text-pink-300 transition-colors">Showmanship Scoring Game</h3>
                <p className="text-xs opacity-75">Roleplay as an ARBA judge! Grade mock presentations, deduct points, and check score sheets.</p>
              </div>
              <button 
                onClick={() => {
                  setScoringScenarioIdx(0);
                  setInputScores({ attire: 10, carry: 5, pose: 10, exam: 40, qa: 30 });
                  setScoringFeedback('');
                  setScoringComplete(false);
                  setAcademyMode('simulator');
                }}
                className="btn-interactive w-full text-xs bg-pink-600 border-none font-bold text-white flex items-center justify-center gap-1.5"
              >
                ⚖️ Open Scoring Simulator
              </button>
            </div>

          </div>

          {/* Badges sidebar */}
          <div className="glass-container p-5 flex flex-col gap-4">
            <h3 className="font-black text-sm flex items-center gap-1 text-yellow-400">
              <BadgeIcon className="w-4 h-4" /> My Academy Badges
            </h3>
            
            <div className="flex flex-col gap-2">
              {unlockedBadges.map((b, idx) => (
                <div key={idx} className="p-2.5 bg-gradient-to-r from-emerald-950/40 to-indigo-950/40 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs">
                  <span className="text-base">⭐</span>
                  <span className="font-bold text-white">{b}</span>
                </div>
              ))}
              {unlockedBadges.length === 0 && (
                <p className="text-xs opacity-60 text-center py-6">Win points to unlock badges!</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* QUIZ TAKING MODE */}
      {academyMode === 'quiz' && quizQuestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto w-full">
          
          {/* Main Quiz Area */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <div className="glass-container p-6 flex flex-col gap-4 border border-indigo-500/30">
              <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
                <span className="font-bold text-indigo-400 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {quizQuestions.length}</span>
                <span className="bg-indigo-650 px-2 py-0.5 rounded text-white font-bold">{quizLevel} Level</span>
              </div>

              {/* Question Text */}
              <h3 className="text-lg font-bold text-white">{quizQuestions[currentQuestionIdx].question}</h3>

              {/* Answer options */}
              <div className="flex flex-col gap-2.5 mt-4">
                {quizQuestions[currentQuestionIdx].options.map((option, idx) => {
                  let btnStyle = "bg-white/5 border-white/10 hover:border-indigo-400/40 hover:bg-white/10 text-white hover:scale-[1.015]";
                  if (answerSubmitted) {
                    if (option === quizQuestions[currentQuestionIdx].answer) {
                      btnStyle = "bg-gradient-to-r from-emerald-500/20 to-green-500/10 border-emerald-400 text-emerald-250 font-bold shadow-lg shadow-emerald-500/15 animate-bounce-subtle border-2";
                    } else if (option === selectedAnswer) {
                      btnStyle = "bg-gradient-to-r from-red-500/20 to-rose-500/10 border-rose-500 text-red-200 shadow-lg shadow-rose-500/15 border-2 animate-wiggle";
                    } else {
                      btnStyle = "bg-white/5 border-white/10 opacity-30 text-white/30 cursor-not-allowed";
                    }
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={answerSubmitted}
                      className={`w-full p-3.5 rounded-2xl border text-left text-sm transition-all flex justify-between items-center cursor-pointer ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {answerSubmitted && option === quizQuestions[currentQuestionIdx].answer && <span className="text-emerald-400 font-bold">✅ Correct!</span>}
                      {answerSubmitted && option === selectedAnswer && option !== quizQuestions[currentQuestionIdx].answer && <span className="text-red-400 font-bold">❌ Incorrect</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation section */}
              {showExplanation && (
                <div className="bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-2xl text-xs flex flex-col gap-2 mt-4 animate-fade-in text-slate-200">
                  <p className="font-bold text-indigo-400 flex items-center gap-1">🧠 Mascot Explanation:</p>
                  <p className="leading-relaxed">{quizQuestions[currentQuestionIdx].explanation}</p>
                  
                  <button 
                    onClick={handleNextQuestion}
                    className="btn-interactive mt-2 w-full text-xs font-bold bg-indigo-600 border-none py-2 px-4 text-white"
                  >
                    {currentQuestionIdx + 1 < quizQuestions.length ? "Next Question" : "Finish Quiz"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mascot feedback sidebar */}
          <div className="md:col-span-1 flex flex-col gap-4 items-center justify-center text-center p-4">
            <div className="text-7xl animate-pulse">
              {mascotMood === 'happy' && '🐰'}
              {mascotMood === 'thinking' && '🧐'}
              {mascotMood === 'cheering' && '🥳'}
              {mascotMood === 'shield' && '🛡️'}
            </div>
            <div className="glass-container p-4 mt-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400">WarrenWise Mascot</span>
              <p className="text-xs italic mt-1 text-slate-350">
                {mascotMood === 'thinking' && '"Hmm, let\'s read this carefully. I know you can get it!"'}
                {mascotMood === 'cheering' && '"HOORAY! That is absolutely right! Double carrot point!"'}
                {mascotMood === 'shield' && '"Oh, not quite! Let\'s read the correction explanation to learn it!"'}
              </p>
            </div>
            <button 
              onClick={() => setAcademyMode('menu')}
              className="text-xs text-indigo-300 hover:text-white underline mt-4"
            >
              Quit Quiz
            </button>
          </div>

        </div>
      )}

      {/* ANATOMY GAME MODE */}
      {academyMode === 'anatomy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          
          {/* Anatomy quiz workspace */}
          <div className="glass-container p-6 flex flex-col gap-4 items-center">
            <h3 className="text-lg font-bold">Interactive Anatomy Map</h3>
            <p className="text-xs opacity-75 text-center">Locate the correct part of the animal below by clicking on the yellow target dots.</p>

            {/* Species Selector for Anatomy */}
            <div className="flex gap-2 mb-2 bg-slate-950 p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setAnatomySpecies('rabbit');
                  setAnatomyTargetIdx(0);
                  setAnatomyFeedback('');
                  setAnatomyComplete(false);
                }}
                className={`text-[11px] py-1.5 px-3 rounded font-bold border-none transition-all cursor-pointer ${anatomySpecies === 'rabbit' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-transparent'}`}
              >
                🐰 Rabbit Anatomy
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnatomySpecies('cavy');
                  setAnatomyTargetIdx(0);
                  setAnatomyFeedback('');
                  setAnatomyComplete(false);
                }}
                className={`text-[11px] py-1.5 px-3 rounded font-bold border-none transition-all cursor-pointer ${anatomySpecies === 'cavy' ? 'bg-amber-600 text-white' : 'text-slate-400 bg-transparent'}`}
              >
                🐹 Cavy Anatomy
              </button>
            </div>

            <div className="relative bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center w-full">
              {!anatomyComplete && (
                <div className="mb-4 text-center">
                  <p className="text-xs opacity-75 font-semibold">Click on the {anatomySpecies === 'cavy' ? 'cavy' : 'rabbit'}'s:</p>
                  <span className="text-xl font-black text-yellow-400 uppercase tracking-widest block mt-1">
                    {(anatomySpecies === 'cavy' ? CAVY_ANATOMY_PARTS : ANATOMY_PARTS)[anatomyTargetIdx].label}
                  </span>
                </div>
              )}

              {/* Vector Anatomy SVG */}
              <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
                <svg viewBox="0 0 250 250" className="w-full h-full drop-shadow-md">
                  {anatomySpecies === 'cavy' ? (
                    <>
                      {/* Outer cavy body outline */}
                      <path d="M 35,160 C 25,140 35,110 70,105 C 90,100 110,120 135,120 C 150,120 160,95 170,85 C 180,75 195,85 190,105 C 195,110 200,120 195,130 C 185,145 170,155 150,165 C 130,175 90,180 50,180 C 40,180 35,170 35,160 Z" fill="#b45309" stroke="#d97706" strokeWidth="3" />
                      {/* Cavy ears */}
                      <ellipse cx="120" cy="70" rx="8" ry="12" fill="#b45309" stroke="#d97706" strokeWidth="2" transform="rotate(-30 120 70)" />
                    </>
                  ) : (
                    <>
                      {/* Outer rabbit body outline */}
                      <path d="M 30,190 C 20,160 30,120 70,120 C 90,120 100,140 120,140 C 130,140 140,110 150,90 C 160,70 180,50 175,85 C 185,85 195,95 190,110 C 195,115 205,125 195,140 C 185,155 170,170 150,185 C 130,200 90,210 50,210 C 40,210 32,200 30,190 Z" fill="#312e81" stroke="#4f46e5" strokeWidth="3" />
                      {/* Rabbit ears outline */}
                      <path d="M 140,80 C 130,50 110,30 120,30 C 130,30 140,50 145,80 Z" fill="#312e81" stroke="#4f46e5" strokeWidth="2" />
                    </>
                  )}
                  
                  {/* Clickable pins */}
                  {(anatomySpecies === 'cavy' ? CAVY_ANATOMY_PARTS : ANATOMY_PARTS).map((p) => {
                    const activeParts = anatomySpecies === 'cavy' ? CAVY_ANATOMY_PARTS : ANATOMY_PARTS;
                    const isTarget = p.name === activeParts[anatomyTargetIdx].name;
                    return (
                      <circle
                        key={p.name}
                        cx={p.cx}
                        cy={p.cy}
                        r={p.r}
                        onClick={() => handleAnatomyClick(p.name)}
                        className={`cursor-pointer transition-all ${
                          isTarget 
                            ? 'fill-yellow-500/20 hover:fill-yellow-400/50 stroke-yellow-400 stroke-[2px] animate-pulse'
                            : 'fill-indigo-500/30 hover:fill-indigo-400/50 stroke-indigo-400/60 stroke-1'
                        }`}
                      />
                    );
                  })}
                </svg>
              </div>

              {anatomyFeedback && (
                <div className="mt-4 text-xs font-bold text-center text-indigo-300 p-2.5 bg-white/5 rounded-xl border border-white/5">
                  {anatomyFeedback}
                </div>
              )}

              {anatomyComplete && (
                <div className="mt-4 text-center flex flex-col gap-2 p-6 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl w-full">
                  <h4 className="font-bold text-emerald-300">🎉 Anatomy Practice Finished!</h4>
                  <p className="text-xs">Amazing job! You identified all 22 parts of the rabbit correctly. You earned 150 XP bonus points!</p>
                  <button onClick={() => setAcademyMode('menu')} className="btn-interactive text-xs py-2 px-4 bg-emerald-600 border-none text-white font-bold mt-2">Back to Academy Menu</button>
                </div>
              )}
            </div>
          </div>

          {/* List of anatomical parts definitions for study */}
          <div className="glass-container p-6 flex flex-col gap-4">
            <h3 className="text-base font-black text-indigo-300 flex items-center gap-1">
              <Brain className="w-5 h-5" /> Anatomy Study Sheet
            </h3>
            <p className="text-xs opacity-75">Take a look at the functions and definitions of each part to master your showmanship examinations.</p>
            
            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-2 text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-yellow-400">Crown:</span> The top part of the head connecting the ears to the skull. Crucial for Lop breeds.
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-yellow-400">Dewlap:</span> The large flap of skin beneath the chin of does. Pulling wool from here is common for nesting.
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-yellow-400">Hock:</span> The back ankle area of the rabbit's rear legs. Must be inspected for sores (Sore Hocks).
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="font-bold text-yellow-400">Loin:</span> The meaty area along the back of the rabbit between the ribs and hip. Checked for muscle density.
              </div>
            </div>

            <button 
              onClick={() => setAcademyMode('menu')}
              className="btn-interactive text-xs bg-slate-700 hover:bg-slate-650 border-none font-bold text-white mt-auto"
            >
              Quit Anatomy Game
            </button>
          </div>

        </div>
      )}

      {/* STUDY DECK MODE */}
      {academyMode === 'study' && (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          <div className="glass-container p-6 border border-sky-500/30 flex flex-col gap-4 text-center">
            <div className="flex justify-between items-center text-xs opacity-75 border-b border-white/10 pb-2">
              <span className="font-bold text-sky-400 uppercase tracking-widest">Study Cards</span>
              <span>Card {studyIdx + 1} of 3</span>
            </div>

            {studyIdx === 0 && (
              <div className="flex flex-col gap-4 py-6">
                <span className="text-4xl">📚</span>
                <h3 className="text-lg font-bold">ARBA Show Classes (4-Class vs 6-Class)</h3>
                <p className="text-sm leading-relaxed max-w-md mx-auto text-slate-200">
                  Rabbits are shown in classes based on their breed's ideal weight. Small breeds (like Holland Lops) are <strong>4-class</strong>: Senior Buck, Senior Doe, Junior Buck, and Junior Doe. Large breeds (like New Zealands) have intermediate classes making them <strong>6-class</strong>: Senior Buck/Doe, Intermediate Buck/Doe, and Junior Buck/Doe.
                </p>
              </div>
            )}

            {studyIdx === 1 && (
              <div className="flex flex-col gap-4 py-6">
                <span className="text-4xl">🩺</span>
                <h3 className="text-lg font-bold">Standard Disqualifications (DQs)</h3>
                <p className="text-sm leading-relaxed max-w-md mx-auto text-slate-200">
                  DQs are serious flaws that prevent a rabbit from being judged. Always check for: 
                  <strong> Malocclusion</strong> (crooked teeth), <strong>Sore Hocks</strong> (raw skin on heels), 
                  <strong> Ear Canker</strong> (crusty ears from mites), <strong>Wall Eye</strong> (different eye colors), 
                  and <strong>Cold/Snuffles</strong> (thick white nasal discharge).
                </p>
              </div>
            )}

            {studyIdx === 2 && (
              <div className="flex flex-col gap-4 py-6">
                <span className="text-4xl">🍀</span>
                <h3 className="text-lg font-bold">Exhibitor Showmanship Etiquette</h3>
                <p className="text-sm leading-relaxed max-w-md mx-auto text-slate-200">
                  Exhibiting is about confidence, presentation, and safety! Dress professionally (preferably a long-sleeved 4-H show coat or white button-up). Always listen to the judge, keep your eyes on them, smile, handle your rabbit calmly, and politely answer their questions about your rabbit's breed, sex, and weight.
                </p>
              </div>
            )}

            <div className="flex justify-between gap-4 mt-6">
              <button 
                onClick={() => setStudyIdx(prev => Math.max(0, prev - 1))}
                disabled={studyIdx === 0}
                className="btn-interactive text-xs bg-slate-700 disabled:opacity-50"
              >
                Previous Card
              </button>
              <button 
                onClick={() => setStudyIdx(prev => Math.min(2, prev + 1))}
                disabled={studyIdx === 2}
                className="btn-interactive text-xs bg-sky-600 border-none font-bold text-white"
              >
                Next Card
              </button>
            </div>
          </div>

          <button 
            onClick={() => setAcademyMode('menu')}
            className="text-xs text-sky-400 hover:text-white underline mx-auto"
          >
            Close Study Deck
          </button>
        </div>
      )}

      {/* SHOWMANSHIP & CONFORMATION SCORING SIMULATOR */}
      {academyMode === 'simulator' && (() => {
        const getFieldConfig = () => {
          if (scoringScenarioIdx === 0 || scoringScenarioIdx === 1) {
            return [
              { key: 'attire', label: 'Attire & Posture', max: 10 },
              { key: 'carry', label: 'Carrying Style', max: 5 },
              { key: 'pose', label: 'Posing Stance', max: 10 },
              { key: 'exam', label: 'Veterinary Exam', max: 40 },
              { key: 'qa', label: 'Judge Q&A', max: 30 }
            ];
          } else if (scoringScenarioIdx === 2) {
            return [
              { key: 'attire', label: 'Head, Crown & Ears', max: 42 },
              { key: 'carry', label: 'Body Type Conformation', max: 32 },
              { key: 'pose', label: 'Bone, Feet & Legs', max: 10 },
              { key: 'exam', label: 'Fur / Coat Quality', max: 7 },
              { key: 'qa', label: 'Color & Condition', max: 9 }
            ];
          } else {
            return [
              { key: 'attire', label: 'Head & Ears Structure', max: 11 },
              { key: 'carry', label: 'Body Shape Conformation', max: 35 },
              { key: 'pose', label: 'Fur Texture & Density', max: 35 },
              { key: 'exam', label: 'Color & Markings', max: 15 },
              { key: 'qa', label: 'General Condition', max: 5 }
            ];
          }
        };

        const fields = getFieldConfig();

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            
            {/* Scenario Description Panel */}
            <div className="glass-container p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-pink-400">Scoring Practice Scenario</h3>
              
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-400 block mb-1">Showmanship Simulators:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setScoringScenarioIdx(0);
                        setInputScores({ attire: 10, carry: 5, pose: 10, exam: 40, qa: 30 });
                        setScoringFeedback('');
                        setScoringComplete(false);
                      }}
                      className={`text-xs py-1 px-3 rounded-lg border font-bold ${scoringScenarioIdx === 0 ? 'bg-pink-600 border-none text-white' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                      Sarah (Lop)
                    </button>
                    <button 
                      onClick={() => {
                        setScoringScenarioIdx(1);
                        setInputScores({ attire: 10, carry: 5, pose: 10, exam: 40, qa: 30 });
                        setScoringFeedback('');
                        setScoringComplete(false);
                      }}
                      className={`text-xs py-1 px-3 rounded-lg border font-bold ${scoringScenarioIdx === 1 ? 'bg-pink-600 border-none text-white' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                      Brandon (Himi)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Conformation Simulators:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setScoringScenarioIdx(2);
                        setInputScores({ attire: 42, carry: 32, pose: 10, exam: 7, qa: 9 });
                        setScoringFeedback('');
                        setScoringComplete(false);
                      }}
                      className={`text-xs py-1 px-3 rounded-lg border font-bold ${scoringScenarioIdx === 2 ? 'bg-cyan-600 border-none text-white' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                      Bella (Holland Lop)
                    </button>
                    <button 
                      onClick={() => {
                        setScoringScenarioIdx(3);
                        setInputScores({ attire: 11, carry: 35, pose: 35, exam: 15, qa: 5 });
                        setScoringFeedback('');
                        setScoringComplete(false);
                      }}
                      className={`text-xs py-1 px-3 rounded-lg border font-bold ${scoringScenarioIdx === 3 ? 'bg-cyan-600 border-none text-white' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                      Rexy (Mini Rex)
                    </button>
                  </div>
                </div>
              </div>

              {scoringScenarioIdx === 0 && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs flex flex-col gap-2">
                  <span className="font-bold text-indigo-300">Exhibitor: Sarah | Breed: Holland Lop (Compact)</span>
                  <p className="leading-relaxed">
                    "Sarah walks up to the table. She is wearing a nice short-sleeved t-shirt. She carries her Holland Lop safely using the correct football carry, supporting the rear. 
                    When posing, she stretches the front feet forward, similar to posing a Himalayan. During the teeth check, she pulls the mouth open wide using both thumbs, causing the rabbit to struggle."
                  </p>
                  <div className="mt-2 text-[10px] text-pink-300 border-t border-white/5 pt-2">
                    <strong>💡 Deductions Checklist Guide:</strong>
                    <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5 text-slate-400">
                      <li>Attire: Short sleeves are prohibited (-5 points).</li>
                      <li>Carry: Flawless (0 points deducted).</li>
                      <li>Posing: Stretched pose is incorrect for Compact body type (-3 points).</li>
                      <li>Examination: Prying mouth open with thumbs is incorrect (-10 points).</li>
                      <li>Q&A: Excellent answers (0 points deducted).</li>
                    </ul>
                  </div>
                </div>
              )}

              {scoringScenarioIdx === 1 && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs flex flex-col gap-2">
                  <span className="font-bold text-indigo-300">Exhibitor: Brandon | Breed: Himalayan (Cylindrical)</span>
                  <p className="leading-relaxed text-slate-350">
                    "Brandon walks up wearing a clean, long-sleeved 4-H show coat. However, he carries the rabbit by its ears! When posing, he tucks it up in a ball. 
                    During the vet exam, he checks the ears and teeth but completely skips checking the claws, hocks, stomach, and sex."
                  </p>
                  <div className="mt-2 text-[10px] text-pink-300 border-t border-white/5 pt-2">
                    <strong>💡 Deductions Checklist Guide:</strong>
                    <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5 text-slate-400">
                      <li>Attire: Professional show coat (0 points deducted).</li>
                      <li>Carry: Carrying by ears is a severe safety violation (-5 points).</li>
                      <li>Posing: Himalayan must be posed flat & stretched, not tucked (-5 points).</li>
                      <li>Examination: Skipped vent check and hind claws (-20 points).</li>
                      <li>Q&A: Excellent answers (0 points deducted).</li>
                    </ul>
                  </div>
                </div>
              )}

              {scoringScenarioIdx === 2 && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs flex flex-col gap-2">
                  <span className="font-bold text-cyan-300">Rabbit: Bella | Breed: Holland Lop (Compact)</span>
                  <p className="leading-relaxed text-slate-300">
                    "You are judging Bella, a senior Holland Lop doe. Evaluating her head, you find it extremely wide, short, and well-filled between the eyes. Her crown is thick and deep, and her ears hang perfectly close to the cheeks (Full 42/42 points). Posing her, you note her shoulders are narrow and her loin flat, lacking depth (22/32 points). Her bone is strong and legs straight (10/10 points). Her fur rolls back but is soft and has minor matting (4/7 points). She has clear broken orange color and excellent healthy flesh condition (9/9 points)."
                  </p>
                  <div className="mt-2 text-[10px] text-cyan-300 border-t border-white/5 pt-2">
                    <strong>💡 Conformation Guide (Bella):</strong>
                    <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5 text-slate-400">
                      <li>Head, Crown & Ears: Flawless head shape, thick crown, and short ears (42 pts).</li>
                      <li>Body Type: Narrow shoulders and lacks loin depth (-10 pts; 22 pts).</li>
                      <li>Bone & Legs: Thick, straight bone (10 pts).</li>
                      <li>Fur / Coat: Soft texture, minor mats (-3 pts; 4 pts).</li>
                      <li>Color & Condition: Clear orange pattern, healthy body (9 pts).</li>
                    </ul>
                  </div>
                </div>
              )}

              {scoringScenarioIdx === 3 && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs flex flex-col gap-2">
                  <span className="font-bold text-cyan-300">Rabbit: Rexy | Breed: Mini Rex (Compact - Plush Rex Fur)</span>
                  <p className="leading-relaxed text-slate-300">
                    "You are judging Rexy, a senior Mini Rex buck. His body is extremely compact, well-rounded, and has a dense loin (35/35 points). However, his head is narrow and ears are long and thin, exceeding the standard (6/11 points). His coat stands plush and vertical, but is slightly sparse with weak spring (25/35 points). His Castor color has a few stray white hairs in the blanket (12/15 points). His condition is firm and healthy (5/5 points)."
                  </p>
                  <div className="mt-2 text-[10px] text-cyan-300 border-t border-white/5 pt-2">
                    <strong>💡 Conformation Guide (Rexy):</strong>
                    <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5 text-slate-400">
                      <li>Head & Ears: Narrow head, thin/long ears (-5 pts; 6 pts).</li>
                      <li>Body Type: Excellent roundness, dense loin (35 pts).</li>
                      <li>Fur Quality: Short plush rex fur, but lacks density/spring (-10 pts; 25 pts).</li>
                      <li>Color & Markings: Minor white hairs in standard (-3 pts; 12 pts).</li>
                      <li>Condition: Firm flesh, alert (5 pts).</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Scoring Form Panel */}
            <div className="glass-container p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white">Enter Scorecard Values</h3>
              <p className="text-xs opacity-75">Grade this exhibitor or rabbit based on the scenario description. Enter the final score for each category.</p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  if (scoringScenarioIdx === 0) {
                    if (
                      Number(inputScores.attire) === 5 &&
                      Number(inputScores.carry) === 5 &&
                      Number(inputScores.pose) === 7 &&
                      Number(inputScores.exam) === 30 &&
                      Number(inputScores.qa) === 30
                    ) {
                      setScoringFeedback("🎉 Correct! Total score is 77 points. Sarah lost points for short sleeves, incorrect stretched pose, and unsafe thumb teeth check.");
                      setScoringComplete(true);
                      addPoints(100);
                      unlockBadge("Fair Judge ⚖️");
                    } else {
                      setScoringFeedback("❌ Mismatch! Review deductions: Sarah gets 5 for attire (-5 for short sleeves), 5 for carry, 7 for pose (-3 for stretched feet), 30 for exam (-10 for thumbs teeth check), and 30 for Q&A.");
                    }
                  } else if (scoringScenarioIdx === 1) {
                    if (
                      Number(inputScores.attire) === 10 &&
                      Number(inputScores.carry) === 0 &&
                      Number(inputScores.pose) === 5 &&
                      Number(inputScores.exam) === 20 &&
                      Number(inputScores.qa) === 30
                    ) {
                      setScoringFeedback("🎉 Correct! Total score is 65 points. Brandon got 0 for carrying by ears, lost 5 points on posing, and lost 20 points for skipping vent/claws checks.");
                      setScoringComplete(true);
                      addPoints(100);
                      unlockBadge("Fair Judge ⚖️");
                    } else {
                      setScoringFeedback("❌ Mismatch! Review deductions: Brandon gets 10 for attire, 0 for carry (ears carry violation), 5 for pose (-5 for tucked), 20 for exam (-20 for skipping claws & vent), and 30 for Q&A.");
                    }
                  } else if (scoringScenarioIdx === 2) {
                    if (
                      Number(inputScores.attire) === 42 &&
                      Number(inputScores.carry) === 22 &&
                      Number(inputScores.pose) === 10 &&
                      Number(inputScores.exam) === 4 &&
                      Number(inputScores.qa) === 9
                    ) {
                      setScoringFeedback("🎉 Correct! Total score is 87 points. Bella has a perfect head/crown/ears (42) and bone (10), but lost body points for narrow shoulders (22/32) and coat points for soft, matted fur (4/7).");
                      setScoringComplete(true);
                      addPoints(150);
                      unlockBadge("Licensed Judge 🎓");
                    } else {
                      setScoringFeedback("❌ Mismatch! Review Holland Lop point schedule deductions: Head/Crown/Ears gets full 42 points. Body gets 22/32 (narrow/flat loin). Bone/Legs gets full 10. Fur gets 4/7 (soft & matted). Color & Condition gets full 9 (4 + 5).");
                    }
                  } else if (scoringScenarioIdx === 3) {
                    if (
                      Number(inputScores.attire) === 6 &&
                      Number(inputScores.carry) === 35 &&
                      Number(inputScores.pose) === 25 &&
                      Number(inputScores.exam) === 12 &&
                      Number(inputScores.qa) === 5
                    ) {
                      setScoringFeedback("🎉 Correct! Total score is 83 points. Rexy has a perfect body (35) and condition (5), but lost points for long ears (6/11), sparse/weak fur (25/35), and stray white hairs in color (12/15).");
                      setScoringComplete(true);
                      addPoints(150);
                      unlockBadge("Licensed Judge 🎓");
                    } else {
                      setScoringFeedback("❌ Mismatch! Review Mini Rex point schedule deductions: Head/Ears gets 6/11 (thin & long). Body gets full 35. Fur gets 25/35 (sparse/weak spring). Color gets 12/15 (minor stray white hairs). Condition gets full 5.");
                    }
                  }
                }}
                className="flex flex-col gap-3 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  {fields.map((f, idx) => (
                    <div key={f.key} className={`flex flex-col gap-1 ${idx === 4 ? 'col-span-2' : ''}`}>
                      <label className="font-bold">{f.label} (Max {f.max})</label>
                      <input 
                        type="number" required max={f.max} min="0"
                        value={inputScores[f.key]}
                        onChange={(e) => setInputScores({...inputScores, [f.key]: e.target.value})}
                        className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white" 
                      />
                    </div>
                  ))}
                </div>

                {scoringFeedback && (
                  <div className={`p-2.5 rounded-xl border text-center font-bold ${scoringComplete ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border-red-500/30 text-red-300'}`}>
                    {scoringFeedback}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={scoringComplete}
                  className="btn-interactive w-full bg-pink-650 hover:bg-pink-700 text-white font-bold py-2 px-4 border-none rounded-xl mt-2 disabled:opacity-50"
                >
                  Validate Scorecard Evaluation
                </button>

                <button 
                  type="button"
                  onClick={() => setAcademyMode('menu')}
                  className="btn-interactive w-full bg-slate-700 hover:bg-slate-650 text-white font-bold py-2 px-4 border-none rounded-xl mt-1"
                >
                  Back to Academy Menu
                </button>
              </form>
            </div>

          </div>
        );
      })()}

      {/* PARENT & LEADER TOOLS MODE */}
      {academyMode === 'parent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
          
          {/* Member Selection & Registration Portal */}
          <div className="glass-container p-6 flex flex-col gap-5 border border-emerald-500/20">
            <h3 className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5" /> 4-H Coach & Parent Portal
            </h3>
            <p className="text-xs opacity-75">Manage your youth members, track their learning history, and assign quizzes.</p>

            {/* List Active Members */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-350">Active Club Members:</span>
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {members.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMemberId(m.id)}
                    className={`p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition-all cursor-pointer ${
                      activeMemberId === m.id 
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' 
                        : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>👤 {m.memberName} ({m.ageGroup} Division)</span>
                    <span className="bg-indigo-650 px-2 py-0.5 rounded text-[10px] text-white">{m.xp} XP</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add New Member Form */}
            <form onSubmit={handleAddMember} className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col gap-3">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Add Club Member</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Member Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Jason Jr"
                    className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold">Age</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="18"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(Number(e.target.value))}
                    className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-interactive text-[11px] py-1.5 bg-indigo-600 border-none font-bold text-white w-full rounded-lg"
              >
                ➕ Add Member
              </button>
            </form>

            {/* Assign Lesson / Quiz Section */}
            {activeMember && (
              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col gap-3">
                <span className="text-[10px] uppercase font-bold text-amber-400">Assign Custom Quiz</span>
                <div className="flex gap-2 items-center text-xs">
                  <select
                    value={assignedQuizLevel}
                    onChange={(e) => setAssignedQuizLevel(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white shrink-0"
                  >
                    <option value="Beginner">Beginner Level</option>
                    <option value="Junior">Junior Level</option>
                    <option value="Senior">Senior Level</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      // Save assigned log
                      const log = {
                        id: 'log-' + Date.now(),
                        progressId: activeMember.id,
                        quizType: `${assignedQuizLevel} Quiz (Assigned)`,
                        score: 0,
                        passed: false,
                        date: new Date().toISOString().split('T')[0],
                        coachFeedback: 'Pending completion.'
                      };
                      await db.youthQuizLogs.add(log);
                      alert(`Successfully assigned ${assignedQuizLevel} Quiz to ${activeMember.memberName}!`);
                      loadMembers();
                    }}
                    className="btn-interactive text-[11px] py-2 bg-amber-600 border-none font-bold text-white w-full rounded-lg"
                  >
                    📝 Assign Lesson
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Member Analytics, Feedback & Certificate Preview */}
          <div className="flex flex-col gap-6">
            
            {activeMember ? (
              <div className="glass-container p-6 flex flex-col gap-4 border border-emerald-500/20">
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white">Member: {activeMember.memberName}</h3>
                    <span className="text-xs opacity-75">Streak: 🔥 {activeMember.streak} Days | Level: {activeMember.currentLevel}</span>
                  </div>
                  <span className="bg-indigo-600/35 border border-indigo-400 text-[10px] text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                    {activeMember.ageGroup} Division
                  </span>
                </div>

                {/* Progress metrics */}
                <div className="text-xs flex flex-col gap-2.5">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Showmanship Simulator Conformation Score</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-2" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Breed & Variety ID Game Score</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-2" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>ARBA Show Rules & Health Standards</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-2" style={{ width: '50%' }} />
                    </div>
                  </div>
                </div>

                {/* Coach Feedback Box */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Coach Feedback / Review Remarks:</label>
                  <textarea
                    rows="2"
                    value={coachFeedbackText}
                    onChange={(e) => setCoachFeedbackText(e.target.value)}
                    placeholder="Provide constructive feedback or encouragement..."
                    className="bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSaveFeedback}
                    className="btn-interactive text-xs py-1.5 bg-emerald-600 border-none font-bold text-white ml-auto"
                  >
                    Save Coach Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-container p-6 text-center text-xs opacity-75">
                Select a club member to view their performance metrics.
              </div>
            )}

            {/* Live Certificate preview */}
            <div className="glass-container p-6 flex flex-col gap-4 items-center border border-emerald-500/20">
              <h3 className="text-sm font-black text-white">Official 4-H Academy Certificate Preview</h3>
              
              <div className="w-full bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-2">
                <canvas 
                  id="certificateCanvas" 
                  width="800" 
                  height="500" 
                  className="w-full h-auto border border-emerald-500/50 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setAcademyMode('menu')}
                  className="btn-interactive text-xs bg-slate-700 hover:bg-slate-650 border-none font-bold text-white"
                >
                  Back to Menu
                </button>
                <button 
                  onClick={() => {
                    const canvas = document.getElementById('certificateCanvas');
                    if (canvas) {
                      const dataUrl = canvas.toDataURL("image/png");
                      const link = document.createElement('a');
                      link.download = `${parentExhibitorName.replace(/\s+/g, '_')}_4H_Certificate.png`;
                      link.href = dataUrl;
                      link.click();
                    }
                  }}
                  className="btn-interactive text-xs bg-emerald-600 border-none font-bold text-white py-2.5 px-4"
                >
                  Export PNG Certificate
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
