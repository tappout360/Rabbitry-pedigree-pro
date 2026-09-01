import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Plus, Search, Printer, Link as LinkIcon, Trash2, 
  ShieldCheck, Heart, FileText, CheckCircle, AlertCircle, ArrowUpRight, DollarSign
} from 'lucide-react';
import PrintableBillOfSaleModal from './PrintableBillOfSaleModal';

export default function SalesAndTransfers({
  transfers = [],
  rabbits = [],
  ledger = [],
  activeBreeder = {},
  currentUser = {},
  onStartTransfer,
  onDeleteTransfer,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBillOfSale, setSelectedBillOfSale] = useState(null);
  const [selectedBlankSaleRabbit, setSelectedBlankSaleRabbit] = useState(null);

  // Filtered transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        t.rabbitName?.toLowerCase().includes(q) ||
        t.rabbitTattoo?.toLowerCase().includes(q) ||
        t.buyerName?.toLowerCase().includes(q) ||
        t.certificateId?.toLowerCase().includes(q)
      );
    });
  }, [transfers, searchQuery]);

  // Total sales metrics
  const totalRevenue = useMemo(() => {
    return transfers.reduce((acc, t) => acc + (parseFloat(t.price) || 0), 0);
  }, [transfers]);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* 1. Header & Quick Actions */}
      <div className="glass-container p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-2 border-emerald-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white">
              Sales, Transfers & Health Warranties
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Certified ownership contracts, buyer health guarantees, 7-day care guides, and ledger logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onStartTransfer}
            className="btn-interactive py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer border-none shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" /> New Sale & Transfer Wizard
          </button>

          <button
            onClick={() => setSelectedBlankSaleRabbit(rabbits[0] || null)}
            className="btn-interactive py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-white/10"
          >
            <Printer className="w-4 h-4 text-cyan-300" /> Printable Bill of Sale & Care Packet
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-container p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Sales Revenue
          </span>
          <strong className="text-xl font-black text-emerald-400 font-mono">
            {'$' + totalRevenue.toFixed(2)}
          </strong>
        </div>

        <div className="glass-container p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            🐇 Transferred Animals
          </span>
          <strong className="text-xl font-black text-white font-mono">
            {transfers.length + ' Sold'}
          </strong>
        </div>

        <div className="glass-container p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Health Warranties
          </span>
          <strong className="text-xl font-black text-indigo-400 font-mono">
            100% Protected
          </strong>
        </div>

        <div className="glass-container p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Care Packets Included
          </span>
          <strong className="text-xl font-black text-rose-400 font-mono">
            7-Day Guides
          </strong>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="glass-container p-3 flex items-center justify-between gap-3 border border-white/10">
        <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rabbit name, tattoo, buyer, certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white border-none bg-transparent cursor-pointer">✕</button>
          )}
        </div>
      </div>

      {/* 4. Verifiable Sales & Transfer Records Table */}
      <div className="glass-container overflow-hidden border border-white/10 rounded-2xl">
        {filteredTransfers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-4xl">📜</span>
            <h3 className="text-sm font-bold text-white">No Transfer Records Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Use the Guided Transfer Wizard to record rabbit sales with official bill of sale certificates, health guarantees, and buyer care instructions.
            </p>
            <button
              onClick={onStartTransfer}
              className="btn-interactive mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
            >
              Start First Transfer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-[10px] font-black uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3.5">Rabbit Details</th>
                  <th className="p-3.5">Buyer Information</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Date & Cert #</th>
                  <th className="p-3.5">Health Guarantee</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <strong className="text-white font-bold block">{t.rabbitName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{'Tat: ' + t.rabbitTattoo + ' • ' + t.rabbitBreed}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-200 font-medium block">{t.buyerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.buyerEmail + (t.buyerPhone ? (' • ' + t.buyerPhone) : '')}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {'$' + (parseFloat(t.price) || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="text-slate-300 block">{t.date}</span>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold">{t.certificateId}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> 7-Day Care Covered
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBillOfSale(t)}
                          className="btn-interactive py-1.5 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-[11px] rounded-lg border-none flex items-center gap-1 cursor-pointer"
                          title="Print Bill of Sale, Health Guarantee & Care Guide"
                        >
                          <Printer className="w-3.5 h-3.5" /> Bill of Sale
                        </button>
                        <button
                          onClick={() => {
                            const mockUrl = window.location.origin + '/transfer/' + t.id + '?cert=' + t.certificateId;
                            navigator.clipboard.writeText(mockUrl);
                            if (showToast) showToast('Verification link copied to clipboard!', 'info');
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 border-none bg-transparent cursor-pointer"
                          title="Copy verification link"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteTransfer && (
                          <button
                            onClick={() => onDeleteTransfer(t.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 border-none bg-transparent cursor-pointer"
                            title="Delete transfer record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Printable Bill of Sale & Care Packet Modal */}
      {(selectedBillOfSale || selectedBlankSaleRabbit) && (
        <PrintableBillOfSaleModal
          transfer={selectedBillOfSale}
          rabbit={selectedBlankSaleRabbit}
          breeder={activeBreeder || currentUser}
          onClose={() => {
            setSelectedBillOfSale(null);
            setSelectedBlankSaleRabbit(null);
          }}
        />
      )}

    </div>
  );
}
