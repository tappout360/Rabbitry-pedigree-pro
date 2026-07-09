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

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRecovery = () => {
    if (window.confirm("Would you like to reset application settings (theme and logo) to recover? (Your rabbit registry data will remain safe)")) {
      localStorage.removeItem('rp_theme');
      localStorage.removeItem('rp_logo');
      localStorage.removeItem('rp_dash_widgets');
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
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
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[9px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reload Component
            </button>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950 text-white font-sans">
          <div className="glass-container p-8 max-w-md border border-rose-500/30 flex flex-col gap-6 items-center bg-slate-900/60 backdrop-blur-md">
            
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg animate-bounce">
              🐰🩺
            </div>
            
            <div>
              <h2 className="text-xl font-black text-rose-400 tracking-wide">Something Hopped Away!</h2>
              <p className="text-xs opacity-75 mt-2 leading-relaxed text-slate-300">
                WarrenWise mascot detected a rendering error. Don't worry — your rabbit registry and pedigree databases are safe offline.
              </p>
            </div>
            
            <div className="text-[10px] bg-red-950/40 text-red-300 p-3.5 rounded-xl font-mono text-left w-full break-all border border-red-900/25 max-h-36 overflow-y-auto">
              {this.state.error?.toString()}
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-interactive w-full text-xs font-bold py-2.5 bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Try Reloading
              </button>
              
              <button 
                onClick={this.handleRecovery}
                className="text-xs text-slate-400 hover:text-white underline mt-1"
              >
                Reset App Settings & Clear Cache
              </button>
            </div>

          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
