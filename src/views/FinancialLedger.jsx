import React, { useState } from 'react';

export default function FinancialLedger({ ledger, handleAddTx }) {
  const [newTx, setNewTx] = useState({
    type: 'expense',
    category: 'feed',
    amount: '',
    notes: ''
  });

  const [ledgerPage, setLedgerPage] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddTx(e, newTx);
    // Reset form inputs (except type/category defaults)
    setNewTx({
      type: newTx.type,
      category: newTx.category,
      amount: '',
      notes: ''
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Add Transaction Form */}
      <div className="glass-container p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Log Transaction</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Type</label>
            <select 
              value={newTx.type}
              onChange={(e) => setNewTx({...newTx, type: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Category</label>
            <select 
              value={newTx.category}
              onChange={(e) => setNewTx({...newTx, category: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
            >
              <option value="feed">Feed</option>
              <option value="medical">Medical</option>
              <option value="equipment">Equipment</option>
              <option value="sale">Sale of Rabbit</option>
              <option value="show_fee">Show Entry Fee</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Amount ($)</label>
            <input 
              type="number" step="0.01" required placeholder="0.00"
              value={newTx.amount}
              onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-300">Notes</label>
            <input 
              type="text" placeholder="Description"
              value={newTx.notes}
              onChange={(e) => setNewTx({...newTx, notes: e.target.value})}
              className="bg-slate-950 text-white border border-white/10 rounded-xl p-2.5"
            />
          </div>
          
          <div className="md:col-span-4">
            <button type="submit" className="btn-interactive w-full">Record Ledger Event</button>
          </div>
        </form>
      </div>

      {/* Transactions List */}
      <div className="glass-container p-6">
        <h3 className="text-lg font-bold mb-4 text-white">Financial Log History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider opacity-70 text-slate-300">
                <th className="pb-3">Date</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-100">
              {(() => {
                const ITEMS_PER_PAGE = 20;
                const startIndex = (ledgerPage - 1) * ITEMS_PER_PAGE;
                const paginated = ledger.slice(startIndex, startIndex + ITEMS_PER_PAGE);
                return paginated.map(t => (
                  <tr key={t.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 text-slate-300">{t.date}</td>
                    <td className="py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 capitalize text-slate-300">{t.category}</td>
                    <td className="py-3 text-slate-300">{t.notes}</td>
                    <td className={`py-3 text-right font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
          {ledger.length === 0 && (
            <p className="text-center py-6 opacity-60 text-slate-400">No financial records cataloged.</p>
          )}

          {/* Pagination Controls */}
          {ledger.length > 20 && (
            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4 text-xs">
              <button
                type="button"
                onClick={() => setLedgerPage(prev => Math.max(prev - 1, 1))}
                disabled={ledgerPage === 1}
                className="btn-interactive py-1 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border-none text-white font-bold cursor-pointer"
              >
                Prev Page
              </button>
              <span className="opacity-75 font-semibold text-white">
                Page {ledgerPage} of {Math.ceil(ledger.length / 20)} ({ledger.length} total)
              </span>
              <button
                type="button"
                onClick={() => setLedgerPage(prev => Math.min(prev + 1, Math.ceil(ledger.length / 20)))}
                disabled={ledgerPage === Math.ceil(ledger.length / 20)}
                className="btn-interactive py-1 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border-none text-white font-bold cursor-pointer"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
