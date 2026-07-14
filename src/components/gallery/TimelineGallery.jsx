import React, { useState, useMemo } from 'react';
import { Camera, Calendar, Scale, Trash2, Plus, Clock, FileText, Check } from 'lucide-react';
import { uuidv7 } from '../../db/uuid';

export default function TimelineGallery({ rabbits = [], onUpdateRabbit }) {
  const [selectedRabbitId, setSelectedRabbitId] = useState(rabbits[0]?.id || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightOz, setWeightOz] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Active rabbit instance
  const activeRabbit = useMemo(() => {
    return rabbits.find(r => r.id === selectedRabbitId) || null;
  }, [rabbits, selectedRabbitId]);

  // Ensure timeline list exists
  const timeline = useMemo(() => {
    if (!activeRabbit) return [];
    return activeRabbit.timeline || [
      {
        id: 'initial',
        date: activeRabbit.dob || new Date().toISOString().split('T')[0],
        photo: activeRabbit.photos?.[0] || '/assets/holland_lop.png',
        weightOz: activeRabbit.weightOz || 0,
        notes: 'Initial registration entry'
      }
    ];
  }, [activeRabbit]);

  // Sort timeline chronologically (latest first)
  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [timeline]);

  // Convert uploaded image to base64 with canvas-based size optimization (max 1024px width)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.8 quality to preserve database storage limits
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoPreview(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddTimelineEntry = (e) => {
    e.preventDefault();
    if (!activeRabbit) return;

    setIsUploading(true);
    
    const newEntry = {
      id: uuidv7(),
      date: date || new Date().toISOString().split('T')[0],
      photo: photoPreview || '/assets/holland_lop.png',
      weightOz: weightOz ? parseFloat(weightOz) : null,
      notes: notes || 'Photo log entry'
    };

    // Update rabbit instance
    const updatedTimeline = [...timeline, newEntry];
    
    // Add primary photo to standard photos array if it's the latest
    const photosArray = [...(activeRabbit.photos || [])];
    if (photoPreview) {
      photosArray.unshift(photoPreview);
    }

    const isLatestWeight = !timeline.some(entry => entry.weightOz && new Date(entry.date) > new Date(newEntry.date));

    const updatedRabbit = {
      ...activeRabbit,
      timeline: updatedTimeline,
      photos: photosArray,
      // Update primary weight if this entry is the latest date
      weightOz: weightOz && (isLatestWeight || !activeRabbit.weightOz) ? parseFloat(weightOz) : activeRabbit.weightOz
    };

    setTimeout(() => {
      onUpdateRabbit(updatedRabbit);
      setPhotoFile(null);
      setPhotoPreview('');
      setWeightOz('');
      setNotes('');
      setIsUploading(false);
    }, 400); // UI feel delay
  };

  const handleDeleteEntry = (entryId) => {
    if (!activeRabbit || entryId === 'initial') return;

    const updatedTimeline = timeline.filter(entry => entry.id !== entryId);
    const updatedRabbit = {
      ...activeRabbit,
      timeline: updatedTimeline
    };
    onUpdateRabbit(updatedRabbit);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section with rabbit selector */}
      <div className="glass-container p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">🐰 Photo Gallery & Growth Timelines</h2>
          <p className="text-xs text-slate-300">Track weight checkpoints and visual development logs over time.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400">Select Rabbit:</label>
          <select
            value={selectedRabbitId}
            onChange={(e) => setSelectedRabbitId(e.target.value)}
            className="bg-slate-900/80 border border-white/10 text-white text-sm rounded-xl py-2 px-4 focus:border-indigo-500 font-semibold"
          >
            {rabbits.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.tattooNumber || 'No Tattoo'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeRabbit ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Timeline Entry Form (1 Col) */}
          <div className="glass-container p-6 flex flex-col gap-5 border border-indigo-500/20">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Add Timeline Entry
            </h3>

            <form onSubmit={handleAddTimelineEntry} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-300">Upload Photo</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-4 bg-slate-950/40 relative hover:border-indigo-500 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl border border-white/10"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <span className="text-slate-400 text-center font-medium">Click or Drag Image Here</span>
                      <span className="text-[10px] text-slate-500">Max size optimized automatically</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl py-2 px-3 focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-400" /> Weight (oz)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="E.g. 48"
                    value={weightOz}
                    onChange={(e) => setWeightOz(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl py-2 px-3 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Diary Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe development, feed changes, or show readiness comments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="btn-interactive w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-950/20 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving Entry...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Timeline Entry
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Timeline Cards View (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-indigo-400" /> Growth Progression
            </h3>

            {sortedTimeline.length === 0 ? (
              <div className="glass-container p-8 text-center text-slate-400">
                No growth timeline logs available for this rabbit. Use the form to log the first entry.
              </div>
            ) : (
              <div className="relative pl-6 border-l border-indigo-500/25 flex flex-col gap-6">
                {sortedTimeline.map((entry, index) => (
                  <div key={entry.id} className="relative group">
                    {/* Circle timeline dot */}
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-400 group-hover:bg-indigo-400 transition-all shadow shadow-indigo-950"></div>

                    {/* Timeline card */}
                    <div className="glass-container p-5 flex flex-col md:flex-row gap-5 items-start relative hover:border-white/20 transition-all">
                      <img
                        src={entry.photo}
                        alt="Timeline"
                        className="w-full md:w-36 h-28 object-cover rounded-xl border border-white/10 shadow shadow-slate-950"
                      />

                      <div className="flex-1 flex flex-col gap-2 w-full">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-indigo-400" /> {entry.date}
                          </span>
                          
                          {entry.id !== 'initial' && (
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-all"
                              title="Delete timeline entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 items-center mt-0.5">
                          {entry.weightOz ? (
                            <span className="py-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded-lg text-[10px] flex items-center gap-1">
                              <Scale className="w-3 h-3" /> {(entry.weightOz / 16).toFixed(2)} lbs ({entry.weightOz} oz)
                            </span>
                          ) : null}
                          <span className="py-1 px-2.5 bg-slate-900 border border-white/10 text-slate-300 font-medium rounded-lg text-[10px]">
                            Entry #{sortedTimeline.length - index}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 leading-relaxed italic bg-slate-950/20 p-2.5 rounded-lg border border-white/5">
                          "{entry.notes}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-container p-12 text-center text-slate-400">
          No rabbits available. Please add a rabbit inside the Lineage tab first!
        </div>
      )}
    </div>
  );
}
