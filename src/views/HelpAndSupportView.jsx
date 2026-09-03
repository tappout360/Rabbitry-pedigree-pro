import React, { useState, useMemo } from 'react';
import { 
  LifeBuoy, Search, Send, Ticket, MessageSquare, CheckCircle, 
  AlertTriangle, Clock, Paperclip, ChevronDown, ChevronUp, BookOpen, 
  ShieldCheck, FileText, ArrowRight, UserCheck, Smartphone
} from 'lucide-react';
import { db } from '../db/registryDb';
import { DEFAULT_HELP_ARTICLES } from '../db/defaults';
import { logSecurityEvent } from '../services/AccountSecurityService';

export default function HelpAndSupportView({
  currentUser,
  allTickets = [],
  setAllTickets,
  onOpenTermsModal,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('help'); // 'help', 'submit_ticket', 'my_tickets'

  // Help Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHelpCategory, setSelectedHelpCategory] = useState('All');
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  // New Ticket Form State
  const [ticketCategory, setTicketCategory] = useState('Account Recovery');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketScreenshot, setTicketScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Ticket Viewer
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Categories list
  const categories = [
    'All', 
    'Account & Security', 
    'Pedigrees & Lineage', 
    'Animal Welfare & Safety', 
    'Barn Mode & Hutches', 
    'Billing & Subscriptions'
  ];

  // Filtered Help Articles
  const filteredArticles = useMemo(() => {
    return DEFAULT_HELP_ARTICLES.filter(art => {
      const matchCat = selectedHelpCategory === 'All' || art.category === selectedHelpCategory;
      const matchQuery = !searchQuery.trim() || 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedHelpCategory, searchQuery]);

  // Current user's tickets
  const userTickets = useMemo(() => {
    return allTickets.filter(t => 
      t.breederId === currentUser?.id || 
      t.breederEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
      currentUser?.role === 'superadmin' ||
      currentUser?.id === 'ab-demo-1'
    );
  }, [allTickets, currentUser]);

  // Handle Screenshot File Pick
  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File size limit is 2MB for support attachments.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTicketScreenshot(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      alert("Please fill in both Subject and Description.");
      return;
    }

    setIsSubmitting(true);
    const ticketNumber = 'WW-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: 'tkt_' + Date.now(),
      ticketNumber,
      breederId: currentUser?.id || 'guest',
      breederEmail: currentUser?.email || 'guest@example.com',
      rabbitryName: currentUser?.rabbitryName || 'WarrenWise Breeder',
      category: ticketCategory,
      priority: ticketPriority,
      subject: ticketSubject.trim(),
      description: ticketDescription.trim(),
      screenshot: ticketScreenshot || null,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deviceInfo: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        online: navigator.onLine,
        appVersion: '1.0.0'
      },
      replies: []
    };

    if (db && db.supportTickets) {
      await db.supportTickets.add(newTicket);
    }
    setAllTickets(prev => [newTicket, ...prev]);

    await logSecurityEvent(currentUser?.id, 'SUPPORT_TICKET_SUBMITTED', { ticketNumber, category: ticketCategory }, 'info');

    setIsSubmitting(false);
    setTicketSubject('');
    setTicketDescription('');
    setTicketScreenshot(null);
    setActiveTab('my_tickets');
    setSelectedTicket(newTicket);
    showToast(`Support Ticket #${ticketNumber} created!`, "success");
  };

  // Send Reply to existing ticket
  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;

    const reply = {
      id: 'rep_' + Date.now(),
      senderRole: 'user',
      senderName: currentUser?.name || 'Breeder',
      message: ticketReplyText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedReplies = [...(selectedTicket.replies || []), reply];
    const updatedTicket = {
      ...selectedTicket,
      replies: updatedReplies,
      updatedAt: new Date().toISOString()
    };

    if (db && db.supportTickets) {
      await db.supportTickets.update(selectedTicket.id, {
        replies: updatedReplies,
        updatedAt: updatedTicket.updatedAt
      });
    }

    setSelectedTicket(updatedTicket);
    setAllTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setTicketReplyText('');
    showToast("Reply sent to support!", "info");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto text-left">
      
      {/* Header Banner */}
      <div className="glass-container p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Help Center & Support Desk</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant guides for account recovery, ARBA standards, pedigree calculations, and ticket assistance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTermsModal}
            className="btn-interactive text-xs py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Animal Safety & Policies
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-slate-950/30 rounded-2xl p-1 gap-1 text-xs font-bold">
        <button
          onClick={() => { setActiveTab('help'); setSelectedTicket(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'help' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Knowledge Base & FAQ
        </button>
        <button
          onClick={() => { setActiveTab('submit_ticket'); setSelectedTicket(null); }}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'submit_ticket' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <Send className="w-4 h-4" /> Submit a Support Ticket
        </button>
        <button
          onClick={() => setActiveTab('my_tickets')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'my_tickets' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-slate-400 hover:text-white bg-transparent'
          }`}
        >
          <Ticket className="w-4 h-4" /> My Tickets ({userTickets.length})
        </button>
      </div>

      {/* TAB 1: KNOWLEDGE BASE & FAQ */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          
          {/* Search bar */}
          <div className="glass-container p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search guides, 2FA recovery, pedigree standards, FDA rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedHelpCategory(cat)}
                  className={`text-[11px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap cursor-pointer transition-all border-none ${
                    selectedHelpCategory === cat 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Support Pathways */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => { setActiveTab('submit_ticket'); setTicketCategory('Account Recovery'); setTicketPriority('Urgent'); }}
              className="p-4 bg-slate-900/80 hover:bg-indigo-950/40 border border-white/10 hover:border-indigo-500/40 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit mb-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-xs">2FA & Lockout Recovery</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Lost your phone or backup codes? Open an urgent recovery request for Root administrator verification.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-400 mt-3 flex items-center gap-1">Request Recovery &rarr;</span>
            </div>

            <div 
              onClick={() => { setActiveTab('submit_ticket'); setTicketCategory('Pedigree'); }}
              className="p-4 bg-slate-900/80 hover:bg-indigo-950/40 border border-white/10 hover:border-indigo-500/40 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl w-fit mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-xs">Pedigree Certificate Question</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Need assistance with 4-generation lineages, Wright's inbreeding (F), or Grand Champion leg imports?
                </p>
              </div>
              <span className="text-xs font-bold text-purple-400 mt-3 flex items-center gap-1">Ask Pedigree Team &rarr;</span>
            </div>

            <div 
              onClick={onOpenTermsModal}
              className="p-4 bg-slate-900/80 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-xs">Animal Safety Policy</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Review our strict welfare guidelines, FDA meat/show withdrawal tracking, and veterinary oversight rules.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 mt-3 flex items-center gap-1">View Safety Rules &rarr;</span>
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">Knowledge Base Guides ({filteredArticles.length})</h3>

            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 glass-container">
                No guides found matching "{searchQuery}". Try different keywords or submit a ticket below.
              </div>
            ) : (
              filteredArticles.map(article => {
                const isExpanded = expandedArticleId === article.id;
                return (
                  <div 
                    key={article.id}
                    className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl space-y-2 text-left"
                  >
                    <div 
                      onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                            {article.category}
                          </span>
                          <h4 className="font-bold text-white text-sm">{article.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{article.summary}</p>
                      </div>
                      <button className="text-slate-400 hover:text-white border-none bg-transparent p-1 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line font-sans bg-slate-950/40 p-4 rounded-xl">
                        {article.content}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 2: SUBMIT A SUPPORT TICKET */}
      {activeTab === 'submit_ticket' && (
        <form onSubmit={handleSubmitTicket} className="glass-container p-6 border border-white/10 space-y-5 text-left">
          <div>
            <h3 className="font-bold text-white text-base">Open a Customer Support Ticket</h3>
            <p className="text-xs text-slate-400">
              Direct line to our engineering and ARBA pedigree specialists. Tickets are typically reviewed within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Issue Category *</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Account Recovery">Account & 2FA Recovery</option>
                <option value="Billing">Billing & Subscription</option>
                <option value="Pedigree">Pedigree / Genetics Issue</option>
                <option value="Technical">Technical Bug / Offline Sync</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Animal Safety">Animal Safety / Policy Question</option>
                <option value="Other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Urgency Priority *</label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Normal">Normal Priority</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="Lockout Critical">Lockout Critical (Account Access)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Subject Summary *</label>
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Need assistance pairing 2FA to new mobile phone"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Detailed Description *</label>
            <textarea
              required
              rows={4}
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              placeholder="Provide as much detail as possible. Include ear tattoo numbers or error messages if applicable..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
            />
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Attach Screenshot (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-none file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
            />
            {ticketScreenshot && (
              <div className="mt-2">
                <img src={ticketScreenshot} alt="Attachment Preview" className="h-24 w-auto rounded-lg border border-white/20" />
              </div>
            )}
          </div>

          {/* Auto-Captured Environment Box */}
          <div className="p-3 bg-slate-950/60 border border-white/10 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Diagnostic Auto-Capture:</strong> App v1.0.0 &bull; Platform: {navigator.platform} &bull; Account: {currentUser?.email || 'Guest'}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-interactive py-3 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <Send className="w-4 h-4" /> Submit Ticket to Support Desk
          </button>
        </form>
      )}

      {/* TAB 3: MY TICKETS & CONVERSATION VIEW */}
      {activeTab === 'my_tickets' && (
        <div className="space-y-4">
          
          {/* Selected Ticket Conversation View */}
          {selectedTicket ? (
            <div className="glass-container p-6 border border-white/10 space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 border-none bg-transparent cursor-pointer"
                >
                  &larr; Back to Ticket List
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    selectedTicket.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    selectedTicket.status === 'In Review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {selectedTicket.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{selectedTicket.ticketNumber}</span>
                </div>
              </div>

              <div>
                <h3 className="font-black text-white text-base">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Category: <strong>{selectedTicket.category}</strong> &bull; Opened {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Initial ticket text */}
              <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {selectedTicket.description}
              </div>

              {selectedTicket.screenshot && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Attached Screenshot:</span>
                  <img src={selectedTicket.screenshot} alt="Screenshot" className="max-h-60 rounded-xl border border-white/10 shadow" />
                </div>
              )}

              {/* Replies Chain */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversation History</h4>
                
                {(!selectedTicket.replies || selectedTicket.replies.length === 0) ? (
                  <div className="p-4 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-slate-400">
                    Awaiting response from Support Desk. You will receive an update here shortly.
                  </div>
                ) : (
                  selectedTicket.replies.map(rep => (
                    <div 
                      key={rep.id} 
                      className={`p-4 rounded-2xl border ${
                        rep.senderRole === 'admin' 
                          ? 'bg-indigo-950/50 border-indigo-500/40 ml-4' 
                          : 'bg-slate-950/60 border-white/10 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {rep.senderRole === 'admin' ? '🛡️ WarrenWise Support' : rep.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(rep.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{rep.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendTicketReply} className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-300 block">Add Follow-Up Message</label>
                <textarea
                  rows={3}
                  required
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="Type your response to support..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                />
                <button
                  type="submit"
                  className="btn-interactive py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl border-none flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Reply
                </button>
              </form>
            </div>
          ) : (
            /* Ticket List */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Your Submitted Tickets ({userTickets.length})</h3>
                <button
                  onClick={() => setActiveTab('submit_ticket')}
                  className="btn-interactive py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg border-none cursor-pointer"
                >
                  + New Ticket
                </button>
              </div>

              {userTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 glass-container">
                  You have no open tickets. Need help? Click <strong>+ New Ticket</strong> to get in touch.
                </div>
              ) : (
                userTickets.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="p-4 bg-slate-900/80 hover:bg-indigo-950/30 border border-white/10 hover:border-indigo-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-xl text-indigo-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-300">{t.ticketNumber}</span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                            t.status === 'In Review' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-0.5 line-clamp-1">{t.subject}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t.category} &bull; Updated {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-500 text-xs font-bold">&rarr;</span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
