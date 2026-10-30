import React, { useState } from 'react';
import { Clock, Calendar, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SimulatedClockControlProps {
  currentSimulatedIso: string;
  onUpdateSimulatedTime: (isoString: string) => void;
  onResetSimulatedTime: () => void;
}

export const SimulatedClockControl: React.FC<SimulatedClockControlProps> = ({
  currentSimulatedIso,
  onUpdateSimulatedTime,
  onResetSimulatedTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(currentSimulatedIso.slice(0, 16));

  const simDate = new Date(currentSimulatedIso);
  const formattedDisplay = simDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal) {
      onUpdateSimulatedTime(`${inputVal}:00`);
      setIsOpen(false);
    }
  };

  const handlePreset = (iso: string) => {
    setInputVal(iso.slice(0, 16));
    onUpdateSimulatedTime(iso);
  };

  return (
    <div className="bg-amber-950 text-amber-50 border-b border-amber-900/80 px-4 py-2.5 transition-all text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Clock Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 font-semibold text-[11px] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Simulated System Time</span>
          </div>

          <div className="font-mono font-bold text-white text-sm">
            {formattedDisplay}
          </div>
        </div>

        {/* Middle: Quick Skip & Rollover Testing Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-amber-300/80 font-medium mr-1 hidden lg:inline">
            Fast Skip &amp; Rollover Scenarios:
          </span>

          {/* Preset 1: Sunday 07:30 PM (Before 8 PM deadline for Monday meals) */}
          <button
            type="button"
            onClick={() => handlePreset('2026-11-01T19:30:00')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
              currentSimulatedIso.startsWith('2026-11-01T19:30')
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-700/60'
            }`}
            title="Sunday 7:30 PM - Valid skip for Monday (before 8:00 PM deadline)"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Sun 07:30 PM (Valid Skip)</span>
          </button>

          {/* Preset 2: Sunday 08:30 PM (After 8 PM deadline for Monday meals) */}
          <button
            type="button"
            onClick={() => handlePreset('2026-11-01T20:30:00')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
              currentSimulatedIso.startsWith('2026-11-01T20:30')
                ? 'bg-rose-500 text-white border-rose-400 font-bold'
                : 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-700/60'
            }`}
            title="Sunday 8:30 PM - Deadline passed for Monday meals! Demonstrates blocked skip."
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Sun 08:30 PM (Past Deadline)</span>
          </button>

          {/* Preset 3: Month End for Rollover */}
          <button
            type="button"
            onClick={() => handlePreset('2026-10-31T23:59:00')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
              currentSimulatedIso.startsWith('2026-10-31T23:59')
                ? 'bg-blue-500 text-white border-blue-400 font-bold'
                : 'bg-amber-900/60 hover:bg-amber-800 text-amber-200 border-amber-700/60'
            }`}
            title="End of Month (Oct 31, 11:59 PM) - Test Month-End Rollover"
          >
            <span>Oct 31 End (Rollover)</span>
          </button>
        </div>

        {/* Right: Manual Picker & Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-700/60"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Set Custom Time</span>
          </button>

          <button
            type="button"
            onClick={onResetSimulatedTime}
            className="p-1 hover:bg-amber-800/80 text-amber-300 rounded-lg transition-colors"
            title="Reset Simulated Clock to Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Manual Time Picker Dropdown */}
      {isOpen && (
        <form
          onSubmit={handleApply}
          className="mt-3 pt-3 border-t border-amber-900/80 flex flex-wrap items-center gap-3 justify-end max-w-7xl mx-auto"
        >
          <span className="text-xs text-amber-200 font-medium">Select Exact Date &amp; Time:</span>
          <input
            type="datetime-local"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-amber-900/90 text-white border border-amber-700 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <span>Apply Time</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-2.5 py-1.5 bg-amber-900 text-amber-300 hover:text-white rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
