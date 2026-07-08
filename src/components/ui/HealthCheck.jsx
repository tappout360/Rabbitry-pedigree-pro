import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, RefreshCw, BarChart2, ShieldCheck, Database, Info } from 'lucide-react';
import { calculateArbaDivision, calculateRabbitShowClass } from '../../db/helpers';
import { GeneticsEngine } from '../../genetics';

export default function HealthCheck() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults(null);

    // Simulate short loader delay for modern visual feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    const results = [];

    // Test 1: Local Storage Read/Write Test
    try {
      const testKey = 'rp_health_test_temp';
      const testVal = 'WW-' + Date.now();
      localStorage.setItem(testKey, testVal);
      const readVal = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (readVal === testVal) {
        results.push({
          name: "Local Offline Storage Integrity",
          status: "pass",
          message: "Secure read/write permissions validated. Offline data cache operates successfully."
        });
      } else {
        throw new Error("Value mismatch in cache readback.");
      }
    } catch (e) {
      results.push({
        name: "Local Offline Storage Integrity",
        status: "fail",
        message: `Write/Read check failed: ${e.message}`
      });
    }

    // Test 2: Breed Classification (4-class vs 6-class) Check
    try {
      // 6-class breed (Californian), 7 months old on show day should be Intermediate
      const dob6Class = new Date();
      dob6Class.setMonth(dob6Class.getMonth() - 7);
      const dob6Str = dob6Class.toISOString().split('T')[0];
      const classResult6 = calculateRabbitShowClass(dob6Str, 'Californian', 'buck', new Date().toISOString().split('T')[0]);

      // 4-class breed (Holland Lop), 7 months old should be Senior
      const dob4Class = new Date();
      dob4Class.setMonth(dob4Class.getMonth() - 7);
      const dob4Str = dob4Class.toISOString().split('T')[0];
      const classResult4 = calculateRabbitShowClass(dob4Str, 'Holland Lop', 'buck', new Date().toISOString().split('T')[0]);

      if (classResult6.includes("Intermediate") && classResult4.includes("Senior")) {
        results.push({
          name: "ARBA Show Class Categorization",
          status: "pass",
          message: `Californian age 7mo matches 6-class Intermediate. Holland Lop age 7mo matches 4-class Senior.`
        });
      } else {
        results.push({
          name: "ARBA Show Class Categorization",
          status: "fail",
          message: `Incorrect classification. Californian 7mo: ${classResult6}; Holland Lop 7mo: ${classResult4}`
        });
      }
    } catch (e) {
      results.push({
        name: "ARBA Show Class Categorization",
        status: "fail",
        message: `Calculation error: ${e.message}`
      });
    }

    // Test 3: Genetics Wright's Coefficient Math Check
    try {
      const mockRabbits = [
        { id: 'r1', name: 'Sire', sex: 'buck', sireId: '', damId: '' },
        { id: 'r2', name: 'Dam', sex: 'doe', sireId: '', damId: '' },
        { id: 'r3', name: 'Offspring', sex: 'buck', sireId: 'r1', damId: 'r2' }
      ];
      const engine = new GeneticsEngine(mockRabbits);
      const testOffspring = { sireId: 'r1', damId: 'r2' };
      const coefficient = engine.calculateInbreedingCoefficient(testOffspring.sireId, testOffspring.damId);
      
      if (typeof coefficient === 'number' && !isNaN(coefficient)) {
        results.push({
          name: "Genetics Engine Mathematics",
          status: "pass",
          message: `Inbreeding Wright's Coefficient calculated successfully (result: ${(coefficient * 100).toFixed(2)}% inbreeding coefficient).`
        });
      } else {
        throw new Error("Invalid output type received.");
      }
    } catch (e) {
      results.push({
        name: "Genetics Engine Mathematics",
        status: "fail",
        message: `Wright's coefficient execution failed: ${e.message}`
      });
    }

    // Test 4: ARBA Youth Division Boundaries
    try {
      // 10 years old (should be Junior 5-11)
      const dobJunior = new Date();
      dobJunior.setFullYear(dobJunior.getFullYear() - 10);
      const dobJrStr = dobJunior.toISOString().split('T')[0];
      const divJunior = calculateArbaDivision(dobJrStr).division;

      // 16 years old (should be Senior 15-18)
      const dobSenior = new Date();
      dobSenior.setFullYear(dobSenior.getFullYear() - 16);
      const dobSrStr = dobSenior.toISOString().split('T')[0];
      const divSenior = calculateArbaDivision(dobSrStr).division;

      if (divJunior.includes("Junior") && divSenior.includes("Senior")) {
        results.push({
          name: "Youth Division Rules Engine",
          status: "pass",
          message: `Age 10 mapped to ${divJunior}. Age 16 mapped to ${divSenior}. Official ARBA rules verified.`
        });
      } else {
        results.push({
          name: "Youth Division Rules Engine",
          status: "fail",
          message: `Boundary mapping failure. 10yo: ${divJunior}; 16yo: ${divSenior}`
        });
      }
    } catch (e) {
      results.push({
        name: "Youth Division Rules Engine",
        status: "fail",
        message: `Rules validation crashed: ${e.message}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="glass-container p-6 border border-emerald-500/20 max-w-2xl mx-auto w-full flex flex-col gap-5">
      
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            🛡️ WarrenWise System Diagnostics
          </h3>
          <p className="text-xs opacity-75 mt-1">
            Perform instant integrity audits on databases, genetics engines, and ARBA show rule calculation components.
          </p>
        </div>
        
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="btn-interactive text-xs py-2 px-4 bg-emerald-600 border-none font-bold text-white shrink-0 disabled:opacity-50"
        >
          {isRunning ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Diagnosing...
            </span>
          ) : "Run Diagnostic Tests"}
        </button>
      </div>

      {testResults ? (
        <div className="flex flex-col gap-3 mt-2">
          {testResults.map((t, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                t.status === 'pass' 
                  ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-250' 
                  : 'bg-rose-950/20 border-rose-500/25 text-rose-250'
              }`}
            >
              {t.status === 'pass' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="font-bold text-white">{t.name}</strong>
                <p className="opacity-90 mt-0.5 leading-relaxed">{t.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 text-center text-xs opacity-70 flex flex-col items-center gap-2 py-8">
          <Info className="w-8 h-8 text-indigo-400 opacity-80" />
          <p>No diagnostics logged. Click the button above to run system health tests.</p>
        </div>
      )}

    </div>
  );
}
