import React, { useState, useEffect } from 'react';
import { Calendar, Flame, Target, TrendingUp, Award, Shield, BarChart3, Brain, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import './App.css';
const GrowthDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({});
  const [view, setView] = useState('daily');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('growthData');
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('growthData', JSON.stringify(data));
  }, [data]);

  const today = data[currentDate] || {
    physique: { workout: false, eating: false, hydration: false },
    skill: { minutes: 0, focus: 'AI', output: '' },
    mind: { done: false, reflection: '' },
    sideQuests: { communication: false, leadership: false, entrepreneur: false, wealth: false, reading: false },
    resistance: { junkFood: false, scrolling: false, mood: false, dopamine: false },
    close: { well: '', adjust: '', gratitude: '' },
    weeklyRank: { rank: '', days: 0, insight: '', calibration: '' }
  };

 const updateToday = (path, value) => {
    const newData = { ...data };
    if (!newData[currentDate]) {
      newData[currentDate] = {
        physique: { workout: false, eating: false, hydration: false },
        skill: { minutes: 0, focus: 'AI', output: '' },
        mind: { done: false, reflection: '' },
        sideQuests: { communication: false, leadership: false, entrepreneur: false, wealth: false, reading: false },
        resistance: { junkFood: false, scrolling: false, mood: false, dopamine: false },
        close: { well: '', adjust: '', gratitude: '' },
        weeklyRank: { rank: '', days: 0, insight: '', calibration: '' },
        logged: true,
        timestamp: new Date().toISOString()
      };
    }

    const keys = path.split('.');
    let current = newData[currentDate];
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    newData[currentDate].timestamp = new Date().toISOString();

    setData(newData);
  };

  const isCleared = (day) => {
    return day.physique?.workout &&
           day.physique?.eating &&
           day.physique?.hydration &&
           day.skill?.minutes >= 60 &&
           day.mind?.done;
  };

  const calculateStreak = () => {
    let streak = 0;
    const dates = Object.keys(data).sort().reverse();
    for (const date of dates) {
      if (isCleared(data[date])) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        data: data[dateStr],
        cleared: data[dateStr] ? isCleared(data[dateStr]) : false
      });
    }
    return days;
  };

  const getStats = () => {
    const allDates = Object.keys(data);
    const totalDays = allDates.length;
    const clearedDays = allDates.filter(date => isCleared(data[date])).length;
    const clearRate = totalDays > 0 ? Math.round((clearedDays / totalDays) * 100) : 0;

    let sideQuestTotal = 0;
    let resistanceTotal = 0;
    let skillMinutesTotal = 0;

    allDates.forEach(date => {
      const day = data[date];
      if (day.sideQuests) {
        sideQuestTotal += Object.values(day.sideQuests).filter(Boolean).length;
      }
      if (day.resistance) {
        resistanceTotal += Object.values(day.resistance).filter(Boolean).length;
      }
      if (day.skill?.minutes) {
        skillMinutesTotal += day.skill.minutes;
      }
    });
    // AUTOMATIC RANK CALCULATION
    const weeklyRank = clearedDays === 7 ? { rank: 'S', color: 'text-cyan-400', title: 'PERFECT' } :
                          clearedDays >= 6 ? { rank: 'A', color: 'text-green-400', title: 'ELITE' } :
                          clearedDays >= 5 ? { rank: 'B', color: 'text-blue-400', title: 'CONSISTENT' } :
                          clearedDays >= 3 ? { rank: 'C', color: 'text-yellow-400', title: 'AVERAGE' } :
                          clearedDays >= 1 ? { rank: 'D', color: 'text-orange-400', title: 'SURVIVAL' } :
                          { rank: 'E', color: 'text-red-600', title: 'FAILURE' };

    return {
      totalDays,
      weeklyRank,
      clearedDays,
      clearRate,
      avgSideQuests: totalDays > 0 ? (sideQuestTotal / totalDays).toFixed(1) : 0,
      avgResistance: totalDays > 0 ? (resistanceTotal / totalDays).toFixed(1) : 0,
      totalSkillHours: Math.round(skillMinutesTotal / 60),
      currentStreak: calculateStreak()
    };
  };
  // AUTOMATIC RANK CALCULATION
  const calculateWeeklyRank = (clearedDays) => {
    if (clearedDays === 7) return { rank: 'S', color: 'text-cyan-400', title: 'PERFECT' };
    if (clearedDays >= 6) return { rank: 'A', color: 'text-green-400', title: 'ELITE' };
    if (clearedDays >= 5) return { rank: 'B', color: 'text-blue-400', title: 'CONSISTENT' };
    if (clearedDays >= 3) return { rank: 'C', color: 'text-yellow-400', title: 'AVERAGE' };
    if (clearedDays >= 1) return { rank: 'D', color: 'text-orange-400', title: 'SURVIVAL' };
    return { rank: 'E', color: 'text-red-600', title: 'FAILURE' };
  };

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const stats = getStats();
      const last30 = getLast30Days();
      const recentEntries = last30.slice(-7).filter(d => d.data);

      const prompt = `You are a personal growth coach analyzing someone's daily progress data. Be direct, honest, and actionable.

**Recent Performance (Last 7 Days):**
- Days cleared: ${recentEntries.filter(d => d.cleared).length} / 7
- Current streak: ${stats.currentStreak} days

**Overall Stats:**
- Total days tracked: ${stats.totalDays}
- Success rate: ${stats.clearRate}%
- Total skill hours: ${stats.totalSkillHours}h
- Avg side quests per day: ${stats.avgSideQuests}
- Avg resistance wins per day: ${stats.avgResistance}

**Recent Daily Reflections:**
${recentEntries.slice(-5).map(e => e.data?.close?.well ? `- ${e.date}: "${e.data.close.well}"` : '').filter(Boolean).join('\n')}

**Recent Adjustments Noted:**
${recentEntries.slice(-5).map(e => e.data?.close?.adjust ? `- ${e.date}: "${e.data.close.adjust}"` : '').filter(Boolean).join('\n')}

Provide a 3-paragraph analysis:
1. **Current State**: What's working? What patterns do you see?
2. **Concerns**: What needs attention? Be honest about weak points.
3. **Next Steps**: 2-3 specific, actionable suggestions for the next week.

Keep it real, grounded, and supportive but firm. No generic advice. Use the actual data.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const result = await response.json();
      const analysis = result.content[0].text;
      setAiAnalysis(analysis);
    } catch (error) {
      setAiAnalysis('Analysis unavailable. Make sure you have internet connection.');
      console.error('AI Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const navigateDate = (direction) => {
    const curr = new Date(currentDate);
    curr.setDate(curr.getDate() + direction);
    setCurrentDate(curr.toISOString().split('T')[0]);
  };

  const sideQuestCount = Object.values(today.sideQuests).filter(Boolean).length;
  const resistanceCount = Object.values(today.resistance).filter(Boolean).length;
  const streak = calculateStreak();

  // History View
  if (view === 'history') {
    const last30 = getLast30Days();
    const stats = getStats();

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="border-2 border-gray-700 p-6 bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                HISTORY & ANALYTICS
              </h1>
              <button
                onClick={() => setView('daily')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm"
              >
                Back to Daily
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 p-4">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalDays}</div>
              <div className="text-xs text-gray-400">Total Days Tracked</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-400">{stats.clearRate}%</div>
              <div className="text-xs text-gray-400">Success Rate</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
              <div className="text-xs text-gray-400">Current Streak</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 p-4">
              <div className="text-2xl font-bold text-purple-400">{stats.totalSkillHours}h</div>
              <div className="text-xs text-gray-400">Total Skill Hours</div>
            </div>
          </div>

          {/* Last 30 Days Calendar */}
          <div className="border-2 border-gray-700 p-6 bg-gray-900">
            <h2 className="text-lg font-bold text-cyan-400 mb-4">Last 30 Days</h2>
            <div className="grid grid-cols-7 gap-2">
              {last30.map((day) => (
                <div
                  key={day.date}
                  className={`aspect-square rounded border-2 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition ${
                    day.cleared
                      ? 'bg-green-900 border-green-600'
                      : day.data
                      ? 'bg-red-900 border-red-600'
                      : 'bg-gray-800 border-gray-600'
                  }`}
                  onClick={() => {
                    setCurrentDate(day.date);
                    setView('daily');
                  }}
                  title={day.date}
                >
                  <div className="text-xs font-bold">
                    {new Date(day.date).getDate()}
                  </div>
                  {day.cleared && <div className="text-xs">✓</div>}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-900 border-2 border-green-600"></div>
                <span>Cleared</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-900 border-2 border-red-600"></div>
                <span>Incomplete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-800 border-2 border-gray-600"></div>
                <span>No Data</span>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="border-2 border-cyan-600 p-6 bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI COACH ANALYSIS
              </h2>
              <button
                onClick={generateAIAnalysis}
                disabled={isAnalyzing}
                className={`px-4 py-2 border flex items-center gap-2 text-sm ${
                  isAnalyzing
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-gray-900 font-semibold'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                  {aiAnalysis}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm italic text-center py-8">
                Click "Generate Analysis" to get AI-powered insights on your progress, patterns, and next steps.
              </div>
            )}
          </div>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-700 p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Side Quest Performance</h3>
              <div className="text-2xl font-bold mb-1">{stats.avgSideQuests}</div>
              <div className="text-xs text-gray-400">Average per day</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 p-4">
              <h3 className="text-sm font-bold text-cyan-400 mb-3">Resistance Wins</h3>
              <div className="text-2xl font-bold mb-1">{stats.avgResistance}</div>
              <div className="text-xs text-gray-400">Average per day</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

// Weekly View (UPDATED)
  if (view === 'weekly') {
    const getWeekDates = () => {
      const curr = new Date(currentDate);
      const day = curr.getDay() || 7; // Get current day (Monday=1...Sunday=7)
      if (day !== 1) curr.setHours(-24 * (day - 1)); // Adjust to Monday

      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(curr);
        d.setDate(curr.getDate() + i);
        week.push(d.toISOString().split('T')[0]);
      }
      return week;
    };

    const weekDates = getWeekDates();
    let clearedCount = 0;

    // Calculate cleared days for this specific week from your existing data
    weekDates.forEach(date => {
      if (data[date] && isCleared(data[date])) {
        clearedCount++;
      }
    });

    // Get the rank based on the count
    const rankData = calculateWeeklyRank(clearedCount);

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-mono">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-2 border-gray-700 p-6 bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-cyan-400">WEEKLY REPORT</h1>
              <button onClick={() => setView('daily')} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm">
                Back to Daily
              </button>
            </div>
            <div className="text-sm text-gray-400">Week Starting: {weekDates[0]}</div>
          </div>

          {/* Automatic Rank Card */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-700 bg-gray-900 p-8 flex flex-col items-center justify-center text-center">
              <div className="text-sm text-gray-500 uppercase tracking-widest mb-2">System Evaluation</div>
              <div className={`text-9xl font-black ${rankData.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}>
                {rankData.rank}
              </div>
              <div className={`text-xl font-bold mt-4 ${rankData.color} tracking-widest`}>
                {rankData.title}
              </div>
              <div className="mt-6 text-sm text-gray-400">
                Cleared Days: <span className="text-white font-bold">{clearedCount}</span> / 7
              </div>
            </div>

            <div className="border-2 border-gray-700 bg-gray-900 p-6 flex flex-col justify-between">
               <div>
                  <h3 className="text-cyan-400 font-bold mb-4 border-b border-gray-700 pb-2">CRITERIA CHECKLIST</h3>
                  <ul className="space-y-3 text-sm">
                    {weekDates.map(date => {
                      const isDayCleared = data[date] ? isCleared(data[date]) : false;
                      const isFuture = new Date(date) > new Date(new Date().toISOString().split('T')[0]);

                      return (
                        <li key={date} className="flex justify-between items-center">
                          <span className="text-gray-400">{date}</span>
                          {isFuture ? (
                            <span className="text-gray-600">PENDING</span>
                          ) : (
                            <span className={isDayCleared ? "text-green-400 font-bold" : "text-red-500"}>
                              {isDayCleared ? "CLEARED" : "FAILED"}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Daily View (Main)
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Player Status */}
        <div className="border-2 border-cyan-500 p-6 bg-gray-900">
          <div className="text-cyan-400 text-sm font-bold mb-4 tracking-wider">PLAYER STATUS</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Name:</span>
              <span className="font-semibold">Foundation Architect</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Phase:</span>
              <span className="text-cyan-400">Foundation Era (Year 1 of 3)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Difficulty:</span>
              <span className="text-red-400 font-bold">Hard Mode</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-300">
              <strong>Objective:</strong> Build elite technical skills, disciplined body, and internal calm over 2–3 years.
            </div>
            <div className="mt-3 text-center text-sm italic text-cyan-300">
              "I show up. I build. I don't break the chain."
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-orange-400 font-bold">Streak: {streak} days</span>
              </span>
              <span className="text-gray-500 text-xs">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setView('history')}
            className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 font-semibold flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            History & AI Analysis
          </button>
          <button
            onClick={() => setView('weekly')}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-500 border border-purple-500 font-semibold flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            Weekly Rank
          </button>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-gray-900 border border-gray-700 p-3">
          <button
            onClick={() => navigateDate(-1)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{currentDate}</span>
          </div>
          <button
            onClick={() => navigateDate(1)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm flex items-center gap-2"
            disabled={currentDate === new Date().toISOString().split('T')[0]}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main Quests */}
        <div className="border-2 border-gray-700 p-6 bg-gray-900">
          <div className="text-cyan-400 text-sm font-bold mb-4 tracking-wider flex items-center gap-2">
            <Target className="w-5 h-5" />
            MAIN QUESTS — Today's Non-Negotiables
          </div>

          <div className="mb-6 pb-6 border-b border-gray-800">
            <div className="font-semibold mb-3 text-cyan-300">Quest 1: PHYSIQUE</div>
            <div className="space-y-2 pl-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={today.physique.workout}
                  onChange={(e) => updateToday('physique.workout', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">Training completed</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={today.physique.eating}
                  onChange={(e) => updateToday('physique.eating', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">Ate clean (whole foods, no junk)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={today.physique.hydration}
                  onChange={(e) => updateToday('physique.hydration', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">Hydration (2L+ water)</span>
              </label>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-gray-800">
            <div className="font-semibold mb-3 text-cyan-300">Quest 2: CORE SKILL</div>
            <div className="space-y-3 pl-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Deep work logged (minutes):</label>
                <input
                  type="number"
                  value={today.skill.minutes}
                  onChange={(e) => updateToday('skill.minutes', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="Target: 60+"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Focus area:</label>
                <select
                  value={today.skill.focus}
                  onChange={(e) => updateToday('skill.focus', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option>AI</option>
                  <option>Computer Vision</option>
                  <option>GenAI</option>
                  <option>Cloud</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Output produced:</label>
                <input
                  type="text"
                  value={today.skill.output}
                  onChange={(e) => updateToday('skill.output', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="e.g., finished tutorial X, wrote 200 lines..."
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-semibold mb-3 text-cyan-300">Quest 3: MIND + SPIRIT</div>
            <div className="space-y-3 pl-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={today.mind.done}
                  onChange={(e) => updateToday('mind.done', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">Silence / prayer / gratitude (5–10 min)</span>
              </label>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Brief reflection:</label>
                <input
                  type="text"
                  value={today.mind.reflection}
                  onChange={(e) => updateToday('mind.reflection', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder="One line max..."
                />
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 border-2 text-center font-bold ${
            isCleared(today)
              ? 'bg-green-900 border-green-500 text-green-300'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}>
            {isCleared(today) ? '✓ DAY CLEARED — All 3 quests complete' : '○ DAY INCOMPLETE'}
          </div>
        </div>

        {/* Side Quests */}
        <div className="border-2 border-gray-700 p-6 bg-gray-900">
          <div className="text-cyan-400 text-sm font-bold mb-2 tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            SIDE QUESTS — Bonus Progress (Optional)
          </div>
          <div className="text-xs text-gray-500 mb-4">"Bonus work, not required work."</div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.sideQuests.communication}
                onChange={(e) => updateToday('sideQuests.communication', e.target.checked)}
                className="w-4 h-4"
                />
              <span className="text-sm">Communication: English practice or writing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.sideQuests.leadership}
                onChange={(e) => updateToday('sideQuests.leadership', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Leadership: Public speaking or teaching</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.sideQuests.entrepreneur}
                onChange={(e) => updateToday('sideQuests.entrepreneur', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Entrepreneur: Spotted/analyzed one problem</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.sideQuests.wealth}
                onChange={(e) => updateToday('sideQuests.wealth', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Wealth: Learned one investing/trading concept</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.sideQuests.reading}
                onChange={(e) => updateToday('sideQuests.reading', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Reading: Read 15+ pages of a book</span>
            </label>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Completed: <span className="text-cyan-400 font-semibold">{sideQuestCount} / 5</span>
          </div>
        </div>

        {/* Resistance Log */}
        <div className="border-2 border-gray-700 p-6 bg-gray-900">
          <div className="text-cyan-400 text-sm font-bold mb-2 tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5" />
            RESISTANCE LOG — What I Didn't Give In To
          </div>

          <div className="space-y-2 mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.resistance.junkFood}
                onChange={(e) => updateToday('resistance.junkFood', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Avoided junk food</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.resistance.scrolling}
                onChange={(e) => updateToday('resistance.scrolling', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">No doom scrolling</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.resistance.mood}
                onChange={(e) => updateToday('resistance.mood', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Didn't act on low mood</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={today.resistance.dopamine}
                onChange={(e) => updateToday('resistance.dopamine', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Resisted cheap dopamine</span>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400 italic text-center">
            "Discipline is choosing discomfort now over regret later."
          </div>

          <div className="mt-3 text-sm text-gray-400">
            Victories: <span className="text-cyan-400 font-semibold">{resistanceCount} / 4</span>
          </div>
        </div>

        {/* Daily Close */}
        <div className="border-2 border-gray-700 p-6 bg-gray-900">
          <div className="text-cyan-400 text-sm font-bold mb-4 tracking-wider">DAILY CLOSE</div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">One thing done well today:</label>
              <input
                type="text"
                value={today.close.well}
                onChange={(e) => updateToday('close.well', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">One thing to adjust tomorrow:</label>
              <input
                type="text"
                value={today.close.adjust}
                onChange={(e) => updateToday('close.adjust', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">One specific gratitude:</label>
              <input
                type="text"
                value={today.close.gratitude}
                onChange={(e) => updateToday('close.gratitude', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 p-2 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GrowthDashboard;
