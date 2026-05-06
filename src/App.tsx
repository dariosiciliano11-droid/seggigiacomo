/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Users, TrendingUp, Info, RotateCcw } from 'lucide-react';

interface ListVotes {
  fdi: number;
  forzaItalia: number;
  sanVitoViva: number;
  insiemePerSanVito: number;
}

interface SeatResult {
  id: keyof ListVotes;
  name: string;
  seats: number;
  color: string;
}

const LIST_CONFIG: Record<keyof ListVotes, { name: string; color: string }> = {
  fdi: { name: 'FdI', color: 'bg-blue-600' },
  forzaItalia: { name: 'Forza Italia', color: 'bg-blue-400' },
  sanVitoViva: { name: 'San Vito Viva', color: 'bg-yellow-500' },
  insiemePerSanVito: { name: 'Insieme per San Vito', color: 'bg-red-500' },
};

export default function App() {
  const [votes, setVotes] = useState<ListVotes>({
    fdi: 0,
    forzaItalia: 0,
    sanVitoViva: 0,
    insiemePerSanVito: 0,
  });

  const handleVoteChange = (key: keyof ListVotes, value: string) => {
    const numValue = parseInt(value) || 0;
    setVotes((prev) => ({ ...prev, [key]: numValue }));
  };

  const calculateSeats = (totalSeats: number): SeatResult[] => {
    const results: SeatResult[] = Object.entries(LIST_CONFIG).map(([key, config]) => ({
      id: key as keyof ListVotes,
      name: config.name,
      seats: 0,
      color: config.color,
    }));

    const quotients: { listId: keyof ListVotes; value: number }[] = [];

    Object.entries(votes).forEach(([key, voteCount]) => {
      const v = voteCount as number;
      for (let i = 1; i <= totalSeats; i++) {
        quotients.push({
          listId: key as keyof ListVotes,
          value: v / i,
        });
      }
    });

    // Sort by quotient descending
    quotients.sort((a, b) => b.value - a.value);

    // Assign seats to the top totalSeats quotients
    for (let i = 0; i < totalSeats; i++) {
      const winner = quotients[i];
      if (winner && winner.value > 0) {
        const listResult = results.find((r) => r.id === winner.listId);
        if (listResult) {
          listResult.seats += 1;
        }
      }
    }

    return results;
  };

  const results10 = useMemo(() => calculateSeats(10), [votes]);
  const results6 = useMemo(() => calculateSeats(6), [votes]);

  const totalVotes = Object.values(votes).reduce((a, b) => (a as number) + (b as number), 0) as number;

  const resetVotes = () => {
    setVotes({
      fdi: 0,
      forzaItalia: 0,
      sanVitoViva: 0,
      insiemePerSanVito: 0,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-widest uppercase mb-2">
            <Calculator size={14} />
            Calcolo Seggi
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
            Numero seggi <span className="text-blue-600">Giacomo</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl leading-relaxed">
            Inserisci i voti ottenuti dalle liste della coalizione per simulare la ripartizione dei seggi consiliari.
          </p>
        </header>

        {/* Inputs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-white rounded-3xl shadow-sm border border-neutral-200">
          {Object.entries(LIST_CONFIG).map(([key, config]) => (
            <div key={key} className="space-y-3">
              <label className="block text-sm font-semibold text-neutral-700 tracking-tight" htmlFor={key}>
                {config.name}
              </label>
              <div className="relative group">
                <input
                  id={key}
                  type="number"
                  placeholder="0"
                  value={votes[key as keyof ListVotes] || ''}
                  onChange={(e) => handleVoteChange(key as keyof ListVotes, e.target.value)}
                  className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white transition-all text-lg font-mono"
                />
                <div className={`absolute left-0 bottom-0 h-1 w-full rounded-b-2xl opacity-40 group-focus-within:opacity-100 transition-opacity ${config.color}`}></div>
              </div>
            </div>
          ))}
          <div className="md:col-span-4 flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-neutral-500">
              <Users size={18} />
              <span className="text-sm font-medium">Totale voti coalizione: <span className="font-mono font-bold text-neutral-900 text-lg ml-1">{totalVotes.toLocaleString()}</span></span>
            </div>
            <button
              onClick={resetVotes}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </section>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scenario Majority: 10 Seats */}
          <ResultCard title="Scenario Maggioranza" totalSeats={10} results={results10} icon={<TrendingUp className="text-green-600" />} />
          
          {/* Scenario Opposition: 6 Seats */}
          <ResultCard title="Scenario Opposizione" totalSeats={6} results={results6} icon={<TrendingUp className="text-orange-600 rotate-180" />} />
        </div>

      </div>
    </div>
  );
}

function ResultCard({ title, totalSeats, results, icon }: { title: string; totalSeats: number; results: SeatResult[]; icon: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-lg border border-neutral-200 overflow-hidden"
    >
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold leading-none">{title}</h3>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{totalSeats} Consiglieri</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="space-y-6">
          {results.map((res) => (
            <div key={res.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-neutral-700">{res.name}</span>
                <span className="text-2xl font-mono font-bold text-neutral-900">{res.seats}</span>
              </div>
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(res.seats / totalSeats) * 100}%` }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className={`h-full ${res.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex -space-x-1.5 overflow-hidden p-1">
            {[...Array(totalSeats)].map((_, i) => {
              let seatCount = 0;
              let ownerColor = 'bg-neutral-200';
              for (const res of results) {
                seatCount += res.seats;
                if (i < seatCount) {
                  ownerColor = res.color;
                  break;
                }
              }
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0 ${ownerColor}`}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-right max-w-[80px]">
            Ripartizione seggi
          </span>
        </div>
      </div>
    </motion.div>
  );
}
