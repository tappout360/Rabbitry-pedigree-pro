import React from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Auto-recover from dynamic module chunk load 404 errors (caused by new deployment updates)
    if (error && (
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk failed') ||
      error.name === 'ChunkLoadError' ||
      error.toString().includes('dynamically imported module')
    )) {
      const pageHasBeenReloaded = sessionStorage.getItem('chunk_error_reloaded_v2');
      if (!pageHasBeenReloaded) {
        sessionStorage.setItem('chunk_error_reloaded_v2', 'true');
        await this.purgeAllCachesAndHardReload();
      }
    }
  }

  purgeAllCachesAndHardReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (let key of keys) {
          await caches.delete(key);
        }
      }
      localStorage.removeItem('rp_migrated_to_dexie_v9');
    } catch (e) {
      console.warn("Purge cache error:", e);
    } finally {
      window.location.reload(true);
    }
  };

  handleRecovery = async () => {
    await this.purgeAllCachesAndHardReload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.compact) {
        return (
          <div className="glass-container p-5 border border-rose-500/30 flex flex-col gap-3 items-center text-center bg-slate-900/60 backdrop-blur-sm max-w-sm mx-auto hover-glow">
            <span className="text-2xl animate-bounce">🩺🐰</span>
            <h4 className="text-xs font-black text-rose-400 tracking-wide">Component Hopped Away</h4>
            <p className="text-[9px] text-slate-300 leading-normal">
              A local error occurred, but the rest of the barn registry is safe.
            </p>
            <div className="text-[8px] bg-red-950/40 text-red-300 p-2 rounded-lg font-mono text-left w-full break-all max-h-20 overflow-y-auto">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={this.purgeAllCachesAndHardReload}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[9px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Purge Cache & Reload
            </button>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950 text-white font-sans">
          <div className="glass-container p-8 max-w-md border border-rose-500/30 flex flex-col gap-6 items-center bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-2xl">
            
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg animate-bounce">
              🐰🩺
            </div>
            
            <div>
              <h2 className="text-xl font-black text-rose-400 tracking-wide">Update Available or Chunk Mismatch</h2>
              <p className="text-xs opacity-75 mt-2 leading-relaxed text-slate-300">
                A new app deployment was detected or an old cached module failed to load. Click below to unregister old caches and load the live production build instantly.
              </p>
            </div>
            
            <div className="text-[10px] bg-red-950/40 text-red-300 p-3.5 rounded-xl font-mono text-left w-full break-all border border-red-900/25 max-h-36 overflow-y-auto">
              {this.state.error?.toString()}
            </div>
            
            <div className="flex flex-col gap-2.5 w-full">
              <button 
                onClick={this.purgeAllCachesAndHardReload}
                className="btn-interactive w-full text-xs font-bold py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white border-none rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Purge Stale Cache & Load Fresh App
              </button>
              
              <button 
                onClick={this.handleRecovery}
                className="text-xs text-slate-400 hover:text-white underline mt-1 cursor-pointer border-none bg-transparent"
              >
                Reset Browser Caches & Database
              </button>
            </div>

          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
