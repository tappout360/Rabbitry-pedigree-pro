import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Sparkles, X, ChevronRight, AlertTriangle, 
  MessageSquare, Star, ArrowUpRight, ShieldCheck, Camera, Smartphone, WifiOff
} from 'lucide-react';
import { betaService, BETA_TASKS, BETA_COHORTS } from '../../services/BetaValidationService';

export default function BetaTaskChecklistModal({
  isOpen,
  onClose,
  currentUser,
  showToast,
  onNavigateAction
}) {
  const [userState, setUserState] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState('show_breeder');
  const [showFeedbackSubmodal, setShowFeedbackSubmodal] = useState(false);

  // Feedback form state
  const [feedbackSeverity, setFeedbackSeverity] = useState('Minor');
  const [feedbackCategory, setFeedbackCategory] = useState('Offline & Barn Mode');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadState();
    }
  }, [isOpen, currentUser?.id]);

  const loadState = async () => {
    const st = await betaService.getUserState(currentUser?.id || 'default_user');
    setUserState(st);
    if (st.cohort) setSelectedCohort(st.cohort);
  };

  if (!isOpen) return null;

  const completedMap = userState?.completedTasks || {};
  const totalTasks = BETA_TASKS.length;
  const completedCount = Object.keys(completedMap).length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const handleToggleTask = async (taskId) => {
    const isCompleted = !!completedMap[taskId];
    const updated = await betaService.setTaskCompletion(
      currentUser?.id || 'default_user',
      taskId,
      !isCompleted
    );
    setUserState({ ...updated });
    if (!isCompleted && showToast) {
      showToast('Validation task completed! 🎉', 'success');
    }
  };

  const handleSaveCohort = (cohortId) => {
    setSelectedCohort(cohortId);
    if (userState) {
      const updated = { ...userState, cohort: cohortId };
      betaService.saveUserState(currentUser?.id || 'default_user', updated);
      setUserState(updated);
      if (showToast) showToast('Tester cohort updated', 'info');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    try {
      setIsSubmitting(true);
      await betaService.submitBetaFeedback({
        userId: currentUser?.id || 'user',
        userName: currentUser?.name || currentUser?.username || 'Breeder',
        userEmail: currentUser?.email || '',
        rabbitryName: currentUser?.rabbitryName || '',
        cohort: selectedCohort,
        severity: feedbackSeverity,
        category: feedbackCategory,
        title: feedbackTitle || `${feedbackSeverity} in ${feedbackCategory}`,
        message: feedbackMessage,
        rating: feedbackRating,
        currentRoute: window.location.hash || ''
      });

      if (showToast) {
        showToast('Feedback submitted to Owner Control Center! 🚀', 'success');
      }
      setShowFeedbackSubmodal(false);
      setFeedbackMessage('');
      setFeedbackTitle('');
      loadState();
    } catch (err) {
      if (showToast) showToast('Failed to submit feedback: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group tasks by Phase
  const phases = Array.from(new Set(BETA_TASKS.map(t => t.phase)));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in text-left">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-hidden text-slate-100 relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Real-User Beta Validation</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Closed Beta
                </span>
              </div>
              <p className="text-xs text-slate-400">
                8-Day Guided Validation Checklist for ARBA & 4-H Barn Hardening
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          
          {/* Progress Overview Bar */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Your Validation Progress</span>
              <span className="font-black text-indigo-300">{completedCount} of {totalTasks} Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Goal: Validate offline reliability in real barn conditions</span>
              <button
                type="button"
                onClick={() => setShowFeedbackSubmodal(true)}
                className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Submit Issue or Suggestion &rarr;
              </button>
            </div>
          </div>

          {/* Tester Cohort Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Primary Testing Cohort:</span>
            </label>
            <select
              value={selectedCohort}
              onChange={(e) => handleSaveCohort(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-indigo-300 font-bold focus:outline-none"
            >
              {BETA_COHORTS.map(c => (
                <option key={c.id} value={c.id}>{c.label} — {c.desc}</option>
              ))}
            </select>
          </div>

          {/* Checklist Sections by Phase */}
          <div className="space-y-5">
            {phases.map(phaseName => {
              const phaseTasks = BETA_TASKS.filter(t => t.phase === phaseName);
              const phaseCompleted = phaseTasks.filter(t => completedMap[t.id]).length;

              return (
                <div key={phaseName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      {phaseName}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {phaseCompleted}/{phaseTasks.length} Done
                    </span>
                  </div>

                  <div className="space-y-2">
                    {phaseTasks.map(task => {
                      const isDone = !!completedMap[task.id];
                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                            isDone 
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100' 
                              : 'bg-slate-950/60 border-white/5 hover:border-white/10 text-slate-200'
                          }`}
                        >
                          <div 
                            className="flex items-start gap-3 cursor-pointer flex-1"
                            onClick={() => handleToggleTask(task.id)}
                          >
                            <div className="pt-0.5">
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20 shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400 shrink-0" />
                              )}
                            </div>
                            <div>
                              <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                                {task.title}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                {task.desc}
                              </p>
                              {completedMap[task.id]?.notes && (
                                <p className="text-[10px] text-indigo-300 mt-1 italic">
                                  Notes: {completedMap[task.id].notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Jump Action Button */}
                          {task.requiredAction && onNavigateAction && (
                            <button
                              type="button"
                              onClick={() => {
                                onNavigateAction(task.requiredAction);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white shrink-0 flex items-center gap-1 cursor-pointer"
                              title="Go to section"
                            >
                              <span>Open</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All progress saved offline & automatically synced.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFeedbackSubmodal(true)}
              className="py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-pink-600/30 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Report Issue / Feedback</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUBMODAL: STRUCTURED BETA FEEDBACK SUBMISSION                 */}
        {/* ------------------------------------------------------------- */}
        {showFeedbackSubmodal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-left">
            <div className="w-full max-w-lg bg-slate-900 border-2 border-pink-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-500/20 text-pink-400 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Submit Beta Issue / Feedback</h4>
                    <p className="text-[11px] text-slate-400">Routes straight to Jason Mounts & Root Control Center</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeedbackSubmodal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                
                {/* Severity Tag */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Severity Level *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Blocker', label: '🚨 Blocker', desc: 'Prevents work' },
                      { id: 'Major', label: '⚠️ Major', desc: 'Broken feature' },
                      { id: 'Minor', label: 'ℹ️ Minor', desc: 'Cosmetic / delay' },
                      { id: 'Feature', label: '💡 Idea', desc: 'Suggestion' }
                    ].map(sev => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setFeedbackSeverity(sev.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          feedbackSeverity === sev.id
                            ? 'bg-indigo-600 border-indigo-400 text-white font-black shadow-md'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs">{sev.label}</div>
                        <div className="text-[9px] opacity-75">{sev.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Feature Area</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Offline & Barn Mode">🌾 Offline & Barn Mode</option>
                    <option value="Photos & Camera">📸 Photos & Camera Uploads</option>
                    <option value="Pedigrees & ARBA">📜 Pedigrees & ARBA Standards</option>
                    <option value="Rapid Weights & Health">⚖️ Weights & Health Logs</option>
                    <option value="Breeding & Litters">🐰 Breeding & Litters</option>
                    <option value="4-H Youth Academy">🎓 4-H Youth Academy</option>
                    <option value="Backup & Data">💾 Backup & Restore</option>
                    <option value="Other">💬 General / Other</option>
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Short Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weight modal did not calculate gain when offline"
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">What happened? (Steps to reproduce) *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what you were trying to do, what happened, and any error message you saw..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Overall Impression (1-5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFeedbackRating(s)}
                        className="p-1 text-2xl transition-transform hover:scale-125 border-none bg-transparent cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${s <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Telemetry included: screen size, online state, and storage quota for fast diagnostics.</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackSubmodal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !feedbackMessage.trim()}
                    className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 cursor-pointer"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
