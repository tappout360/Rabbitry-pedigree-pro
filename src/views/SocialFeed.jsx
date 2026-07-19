import React, { useState, useEffect } from 'react';
import { Share2, Sparkles, MessageSquare, Heart, CheckCircle2, ShieldAlert, AlertCircle, Trash2, Eye, Flag, Shield, Send } from 'lucide-react';
import { sanitizeTextInput } from '../db/helpers';
import { db } from '../db/registryDb';

/**
 * AI Content Moderation Scanner Heuristic
 * Scans text for hostile, toxic, false info, or suspicious behavior.
 */
export function scanContentForModeration(text) {
  if (!text) return { flagged: false };

  const lower = text.toLowerCase();
  
  // Toxicity & Hostility Patterns
  const toxicKeywords = [
    'hate', 'scam', 'fake breeder', 'cheater', 'stole', 'liar', 'fraud',
    'idiot', 'stupid', 'harass', 'abuse', 'report this user', 'shut up',
    'garbage', 'worthless', 'horrible'
  ];

  // False Information & Misleading Health Claims Patterns
  const falseInfoKeywords = [
    'guaranteed cure', 'secret miracle', 'miracle cure', 'fda approved without vet',
    'don\'t vaccinate', 'rhdv2 is fake', 'government conspiracy'
  ];

  for (const word of toxicKeywords) {
    if (lower.includes(word)) {
      return { flagged: true, reason: `Flagged for potential hostile/negative language ("${word}")` };
    }
  }

  for (const word of falseInfoKeywords) {
    if (lower.includes(word)) {
      return { flagged: true, reason: `Flagged for unverified health claim/misinformation ("${word}")` };
    }
  }

  return { flagged: false };
}

export default function SocialFeed({ currentUser, showToast }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('achievement');
  const [viewFilter, setViewFilter] = useState('public'); // 'public', 'my_posts', 'pending_approval'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment state tracking
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState({});

  // Determine user age limits for COPPA checks
  const isChild = React.useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.parentalControls) return true;
    if (currentUser.birthdate) {
      const birthDate = new Date(currentUser.birthdate);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      return age < 13;
    }
    return false;
  }, [currentUser]);

  // Load posts and comments from Dexie on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allPosts = await db.socialPosts.toArray();
      const allComments = await db.socialComments.toArray();

      if (allPosts.length === 0) {
        // Seed initial public posts
        const mockPosts = [
          {
            id: 'post-seed-1',
            breederId: 'ab-owner-1',
            breederName: 'Jason Mounts',
            rabbitryName: 'Epic Choice Rabbitry',
            title: 'Won Best of Breed (BOB) with our Senior Mini Rex buck at the Portland Breeders Show! 🏆',
            category: 'achievement',
            likes: 12,
            likedBy: [],
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            parentApproved: true,
            aiFlagged: false
          },
          {
            id: 'post-seed-2',
            breederId: 'ab-1',
            breederName: 'Sarah Connor',
            rabbitryName: 'Grandview Warrens',
            title: 'New Netherland Dwarf litter born this morning! All 4 kits are nursing and active. 🧬❤️',
            category: 'litter',
            likes: 8,
            likedBy: [],
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            parentApproved: true,
            aiFlagged: false
          },
          {
            id: 'post-seed-3',
            breederId: 'ab-youth-2',
            breederName: 'Timmy Smith',
            rabbitryName: 'Timothy 4-H Hutch',
            title: 'Just completed Level 3 of the WarrenWise Academy. Ready for the youth registrar exam! 📖',
            category: 'achievement',
            likes: 15,
            likedBy: [],
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            parentApproved: true,
            aiFlagged: false
          }
        ];
        await db.socialPosts.bulkAdd(mockPosts);
        setPosts(mockPosts);
      } else {
        setPosts(allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }

      setComments(allComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch (e) {
      console.error("Error loading social feed:", e);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    // Check if user comments/posting privileges are disabled by Jason Mounts
    if (currentUser?.userRestriction === 'disabled') {
      showToast("⛔ Posting and commenting privileges have been disabled for this account.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Safe Automated scan for SSN/PHI
      let clearedText = '';
      try {
        clearedText = sanitizeTextInput(postTitle);
      } catch (err) {
        showToast("⚠️ Post rejected by WarrenWise AI safety guards: Prohibited terms detected.", "error");
        setIsSubmitting(false);
        return;
      }

      // 2. AI Sentiment & Misinformation Moderation Scan
      const aiScan = scanContentForModeration(clearedText);
      const isAutoFlagged = currentUser?.userRestriction === 'auto_flag';
      const isAiFlagged = aiScan.flagged || isAutoFlagged;
      const flagReason = isAutoFlagged 
        ? 'User account under mandatory moderation restriction'
        : (aiScan.reason || '');

      // 3. Parental Consent & Control Center Routing
      const needsParentApproval = isChild;
      const needsAdminApproval = isAiFlagged;
      const parentApproved = !needsParentApproval && !needsAdminApproval;

      const newPost = {
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        breederId: currentUser?.id || 'guest',
        breederName: currentUser?.name || 'Anonymous Breeder',
        rabbitryName: currentUser?.rabbitryName || 'WarrenWise Hub',
        title: clearedText,
        category: postCategory,
        likes: 0,
        likedBy: [],
        timestamp: new Date().toISOString(),
        parentApproved: parentApproved,
        aiFlagged: isAiFlagged,
        flagReason: flagReason
      };

      await db.socialPosts.add(newPost);
      setPosts(prev => [newPost, ...prev]);
      setPostTitle('');
      
      if (isAiFlagged) {
        showToast("🛡️ AI Flagged: Post sent to Jason Mounts Control Center for review.", "warning");
      } else if (needsParentApproval) {
        showToast("Post submitted! Pending parental approval before going public.", "info");
      } else {
        showToast("Community post published successfully!", "success");
      }
    } catch (err) {
      console.error("Post save failed:", err);
      showToast("Failed to publish post.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId] || '';
    if (!text.trim()) return;

    if (currentUser?.userRestriction === 'disabled') {
      showToast("⛔ Commenting has been disabled for this account.", "error");
      return;
    }

    try {
      let sanitized = '';
      try {
        sanitized = sanitizeTextInput(text);
      } catch (err) {
        showToast("⚠️ Comment rejected: Prohibited terms detected.", "error");
        return;
      }

      const aiScan = scanContentForModeration(sanitized);
      const isAutoFlagged = currentUser?.userRestriction === 'auto_flag';
      const isAiFlagged = aiScan.flagged || isAutoFlagged;
      const flagReason = isAutoFlagged 
        ? 'User account under mandatory comment moderation' 
        : (aiScan.reason || '');

      const needsParentApproval = isChild;
      const parentApproved = !needsParentApproval && !isAiFlagged;

      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        postId: postId,
        breederId: currentUser?.id || 'guest',
        breederName: currentUser?.name || 'Anonymous Breeder',
        rabbitryName: currentUser?.rabbitryName || 'WarrenWise Hub',
        text: sanitized,
        timestamp: new Date().toISOString(),
        parentApproved: parentApproved,
        aiFlagged: isAiFlagged,
        flagReason: flagReason
      };

      await db.socialComments.add(newComment);
      setComments(prev => [...prev, newComment]);
      setCommentText(prev => ({ ...prev, [postId]: '' }));

      if (isAiFlagged) {
        showToast("🛡️ Comment flagged by AI: Routed to Jason Mounts Control Center.", "warning");
      } else if (needsParentApproval) {
        showToast("Comment submitted! Pending parent approval.", "info");
      } else {
        showToast("Comment added!", "success");
      }
    } catch (e) {
      console.error("Failed to add comment:", e);
      showToast("Failed to post comment.", "error");
    }
  };

  const handleLike = async (postId) => {
    try {
      const post = await db.socialPosts.get(postId);
      if (!post) return;

      const userId = currentUser?.id || 'guest';
      const likedBy = post.likedBy || [];
      let updatedLikes = post.likes || 0;
      let newLikedBy = [...likedBy];

      if (newLikedBy.includes(userId)) {
        newLikedBy = newLikedBy.filter(id => id !== userId);
        updatedLikes = Math.max(0, updatedLikes - 1);
      } else {
        newLikedBy.push(userId);
        updatedLikes++;
      }

      await db.socialPosts.update(postId, { likes: updatedLikes, likedBy: newLikedBy });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updatedLikes, likedBy: newLikedBy } : p));
    } catch (e) {
      console.error("Like action failed:", e);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await db.socialPosts.update(postId, { parentApproved: true, aiFlagged: false });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, parentApproved: true, aiFlagged: false } : p));
      showToast("Post approved for public feed!", "success");
    } catch (e) {
      console.error("Approve action failed:", e);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await db.socialPosts.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast("Post deleted.", "info");
    } catch (e) {
      console.error("Delete action failed:", e);
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      await db.socialComments.update(commentId, { parentApproved: true, aiFlagged: false });
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, parentApproved: true, aiFlagged: false } : c));
      showToast("Comment approved!", "success");
    } catch (e) {
      console.error("Approve comment failed:", e);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await db.socialComments.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      showToast("Comment deleted.", "info");
    } catch (e) {
      console.error("Delete comment failed:", e);
    }
  };

  // Filters logic
  const filteredPosts = React.useMemo(() => {
    return posts.filter(p => {
      if (viewFilter === 'my_posts') {
        return p.breederId === currentUser?.id;
      }
      if (viewFilter === 'pending_approval') {
        return (!p.parentApproved || p.aiFlagged) && (currentUser?.role === 'owner' || currentUser?.id === 'ab-admin');
      }
      // Public filter: shows approved posts, OR all posts belonging to the logged-in user
      return (p.parentApproved && !p.aiFlagged) || p.breederId === currentUser?.id;
    });
  }, [posts, viewFilter, currentUser]);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'achievement': return 'from-amber-500/20 to-orange-500/20 border-orange-500/30 text-orange-300';
      case 'litter': return 'from-pink-500/20 to-rose-500/20 border-rose-500/30 text-rose-300';
      case 'general': return 'from-sky-500/20 to-indigo-500/20 border-indigo-500/30 text-sky-300';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-300';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Banner Header */}
      <div className="glass-container p-6 flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Share2 className="w-6 h-6 text-indigo-400" /> Community Stories & Show Bench
        </h3>
        <p className="text-sm opacity-75">
          Share your rabbitry milestones, breeding updates, and show achievements with fellow breeders in a family-safe environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Post Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-container p-5 flex flex-col gap-4">
            <h4 className="font-bold text-sm text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Write a Story
            </h4>

            {isChild && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-2.5 text-xs text-indigo-200">
                <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Family Safe Mode Active:</span> Your posts will be automatically scanned by WarrenWise AI and require parent approval.
                </div>
              </div>
            )}

            {currentUser?.userRestriction === 'auto_flag' && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200">
                <Flag className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Account Restriction: Posts & comments route to Jason Mounts Control Center for moderation.</span>
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase opacity-60">Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-xs p-2.5 text-white rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="achievement">🏆 Show Achievement</option>
                  <option value="litter">🧬 Litter & Breeding Update</option>
                  <option value="general">💬 General Discussion</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase opacity-60">What happened?</label>
                <textarea
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  maxLength={180}
                  className="bg-slate-900 border border-white/10 text-xs p-3 text-white rounded-lg focus:outline-none focus:border-indigo-500 h-28 resize-none"
                  placeholder="Share a milestone (max 180 chars)..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !postTitle.trim()}
                className="btn-interactive w-full py-2.5 bg-indigo-600 hover:bg-indigo-650 text-white font-bold text-xs border-none flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                {isSubmitting ? 'Publishing...' : 'Publish to Feed'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Feed Lists */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Feed Filter Menu */}
          <div className="flex gap-2 border-b border-white/10 pb-1.5">
            <button
              onClick={() => setViewFilter('public')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 bg-transparent border-none cursor-pointer ${viewFilter === 'public' ? 'text-white border-indigo-500 border-solid border-b-2' : 'text-slate-400 hover:text-white'}`}
            >
              🌐 Public Feed
            </button>
            <button
              onClick={() => setViewFilter('my_posts')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 bg-transparent border-none cursor-pointer ${viewFilter === 'my_posts' ? 'text-white border-indigo-500 border-solid border-b-2' : 'text-slate-400 hover:text-white'}`}
            >
              👤 My Stories
            </button>
            {(currentUser?.role === 'owner' || currentUser?.id === 'ab-admin') && (
              <button
                onClick={() => setViewFilter('pending_approval')}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 bg-transparent border-none cursor-pointer relative ${viewFilter === 'pending_approval' ? 'text-white border-indigo-500 border-solid border-b-2' : 'text-slate-400 hover:text-white'}`}
              >
                🛡️ Parent Approvals
                {posts.filter(p => !p.parentApproved || p.aiFlagged).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500"></span>
                )}
              </button>
            )}
          </div>

          {/* Posts Feed */}
          <div className="flex flex-col gap-3.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPosts.map(p => {
              const postComments = comments.filter(c => c.postId === p.id && (c.parentApproved || c.breederId === currentUser?.id || currentUser?.id === 'ab-admin'));
              const isCommentsExpanded = activeCommentPostId === p.id;

              return (
                <div key={p.id} className="glass-container p-4.5 flex flex-col gap-3 relative border border-white/5 hover:border-white/10 transition-all text-left">
                  
                  {/* Post Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center font-bold text-white shadow font-mono text-sm">
                        {p.breederName ? p.breederName.slice(0, 2).toUpperCase() : 'AB'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-300 text-xs">{p.breederName}</span>
                        <span className="text-[10px] opacity-60 font-medium">{p.rabbitryName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase bg-gradient-to-r ${getCategoryColor(p.category)}`}>
                        {p.category}
                      </span>
                      {p.aiFlagged && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 border border-rose-500/35 text-rose-300 flex items-center gap-1 font-mono uppercase">
                          <Flag className="w-2.5 h-2.5" /> AI Flagged
                        </span>
                      )}
                      {!p.parentApproved && !p.aiFlagged && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 border border-amber-500/35 text-amber-300 flex items-center gap-1 font-mono uppercase">
                          <AlertCircle className="w-2.5 h-2.5" /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{p.title}</p>

                  {p.aiFlagged && p.flagReason && (
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/20 text-[10px] text-rose-300">
                      <strong>Moderation Flag:</strong> {p.flagReason}
                    </div>
                  )}

                  {/* Footer Controls */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-2.5 mt-1 text-[10px] opacity-75 font-mono">
                    <span>{new Date(p.timestamp).toLocaleString()}</span>
                    
                    <div className="flex items-center gap-3">
                      {/* Likes */}
                      <button
                        onClick={() => handleLike(p.id)}
                        className={`flex items-center gap-1 bg-transparent border-none cursor-pointer text-[10px] transition-all hover:scale-105 ${p.likedBy?.includes(currentUser?.id || 'guest') ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${p.likedBy?.includes(currentUser?.id || 'guest') ? 'fill-red-400' : ''}`} /> {p.likes || 0}
                      </button>

                      {/* Comments Toggle */}
                      <button
                        onClick={() => setActiveCommentPostId(isCommentsExpanded ? null : p.id)}
                        className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-[10px] text-slate-400 hover:text-white transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> {postComments.length}
                      </button>

                      {/* Parent Approval Action Button */}
                      {(!p.parentApproved || p.aiFlagged) && (currentUser?.role === 'owner' || currentUser?.id === 'ab-admin') && (
                        <button
                          onClick={() => handleApprovePost(p.id)}
                          className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-650 text-white font-bold border-none rounded-lg cursor-pointer flex items-center gap-1 shadow text-[10px]"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                      )}

                      {/* Delete (Admin or Owner) */}
                      {(currentUser?.id === p.breederId || currentUser?.id === 'ab-admin') && (
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          className="bg-transparent border-none cursor-pointer text-slate-400 hover:text-red-400 transition-all p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Comments Section */}
                  {isCommentsExpanded && (
                    <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-3.5">
                      <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Comments ({postComments.length})
                      </h5>

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText[p.id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [p.id]: e.target.value })}
                          placeholder="Write a family-safe comment..."
                          className="bg-slate-900 border border-white/10 text-xs py-1.5 px-3 text-white rounded-lg flex-1 focus:outline-none focus:border-indigo-500"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(p.id); }}
                        />
                        <button
                          onClick={() => handleAddComment(p.id)}
                          className="btn-interactive py-1.5 px-3 bg-indigo-600 hover:bg-indigo-650 text-white text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Post
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {postComments.map(c => (
                          <div key={c.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex justify-between items-start gap-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[11px] text-indigo-300">{c.breederName}</span>
                                <span className="text-[9px] opacity-40">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {c.aiFlagged && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">AI Flagged</span>
                                )}
                                {!c.parentApproved && !c.aiFlagged && (
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Pending Approval</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-200">{c.text}</p>
                            </div>

                            <div className="flex items-center gap-1">
                              {(!c.parentApproved || c.aiFlagged) && (currentUser?.role === 'owner' || currentUser?.id === 'ab-admin') && (
                                <button
                                  onClick={() => handleApproveComment(c.id)}
                                  className="p-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border-none rounded cursor-pointer"
                                  title="Approve comment"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              )}
                              {(currentUser?.id === c.breederId || currentUser?.id === 'ab-admin') && (
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="p-1 bg-transparent hover:text-red-400 text-slate-500 border-none cursor-pointer"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {postComments.length === 0 && (
                          <p className="text-[11px] opacity-50 py-2 italic text-center">No comments yet. Be the first to reply!</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="glass-container py-12 flex flex-col items-center justify-center text-center gap-3 opacity-60">
                <Share2 className="w-10 h-10 text-indigo-400" />
                <p className="text-xs">No community stories match your filter at this moment.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
