import React from 'react';
import { Check, X, ShieldAlert, WifiOff } from 'lucide-react';

export default function CommandConfirmationModal({ command, onConfirm, onCancel, isOffline }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState('');

  React.useEffect(() => {
    if (command && command.originalText) {
      setEditedText(command.originalText);
    }
  }, [command]);

  if (!command) return null;

  // Format the visual representation of the command
  const renderCommandDetails = () => {
    switch (command.action) {
      case 'ADD_RABBIT_INTENT':
        return (
          <>
            <p><strong>Action:</strong> Create Rabbit</p>
            <p><strong>Sex:</strong> {command.sex}</p>
            <p><strong>Age Class:</strong> {command.ageClass}</p>
            <p><strong>Breed:</strong> {command.breed || 'Unknown'}</p>
            <p><strong>Color/Variety:</strong> {command.color || 'Unknown'}</p>
          </>
        );
      case 'ADD_HEALTH_NOTE':
        return (
          <>
            <p><strong>Action:</strong> Add Health Note</p>
            <p><strong>Subject:</strong> {command.subject}</p>
            <p><strong>Note:</strong> {command.note}</p>
          </>
        );
      case 'LOG_WEIGHT':
        return (
          <>
            <p><strong>Action:</strong> Log Weight</p>
            <p><strong>Subject:</strong> {command.subject || 'Selected Rabbit'}</p>
            <p><strong>Weight:</strong> {command.value} oz</p>
          </>
        );
      case 'RECORD_BREEDING':
        return (
          <>
            <p><strong>Action:</strong> Schedule Breeding</p>
            <p><strong>Doe:</strong> {command.doe}</p>
            <p><strong>Buck:</strong> {command.buck}</p>
            <p><strong>Date:</strong> {command.date}</p>
          </>
        );
      case 'RECORD_KINDLING':
        return (
          <>
            <p><strong>Action:</strong> Record Kindling</p>
            <p><strong>Doe:</strong> {command.doe}</p>
            <p><strong>Total Kits:</strong> {command.totalKits}</p>
            <p><strong>Alive:</strong> {command.aliveKits}</p>
          </>
        );
      case 'UPDATE_STATUS':
        return (
          <>
            <p><strong>Action:</strong> Update Status</p>
            <p><strong>Subject:</strong> {command.subject}</p>
            <p><strong>New Status:</strong> {command.newStatus}</p>
          </>
        );
      case 'QUERY_KNOWLEDGE':
        return (
          <>
            <p><strong>Query:</strong> {command.question}</p>
          </>
        );
      default:
        return (
          <p><strong>Parsed Command:</strong> {command.action}</p>
        );
    }
  };

  const handleManualReParse = () => {
    // Basic fallback to re-send edited text. In real app, we'd pass it back to the VoiceEngine parser.
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-4 border-indigo-500 rounded-3xl p-8 shadow-2xl text-left flex flex-col gap-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Confirm Barn Action</h2>
            <p className="text-sm opacity-75 text-slate-300 mt-1">Please verify the AI parsed your voice correctly.</p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-300">Edit Voice Transcript (Quick Entry)</label>
            <textarea
              className="w-full bg-slate-950 border-2 border-indigo-500 rounded-xl p-4 text-white font-mono text-sm"
              rows={3}
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
            />
            <button onClick={handleManualReParse} className="btn-interactive py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm">
              Re-Process Edited Text
            </button>
          </div>
        ) : (
          <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 text-base text-slate-200 leading-relaxed space-y-2 font-mono">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest m-0">Parsed Information:</p>
              <button onClick={() => setIsEditing(true)} className="text-xs text-indigo-300 hover:text-white cursor-pointer bg-transparent border-none">Edit Text</button>
            </div>
            {renderCommandDetails()}
          </div>
        )}

        {isOffline && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-400">
            <WifiOff className="w-6 h-6 shrink-0" />
            <p className="text-xs font-bold leading-relaxed">
              You are offline. This action will be safely queued in your local device and synced automatically when signal returns.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-2xl border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" /> Cancel
          </button>
          <button
            onClick={() => onConfirm(command)}
            disabled={isEditing}
            className={`flex-1 py-4 text-white font-black text-lg rounded-2xl border-none shadow-lg flex items-center justify-center gap-2 transition-all ${
              isEditing ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer'
            }`}
          >
            <Check className="w-6 h-6" /> Confirm & Save
          </button>
        </div>

      </div>
    </div>
  );
}
