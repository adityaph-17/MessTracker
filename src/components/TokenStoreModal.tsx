import React, { useState } from 'react';
import { Student, TokenPack } from '../types';
import { Coins, Check, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';

interface TokenStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  onPurchase: (tokens: number, packName: string) => void;
}

const TOKEN_PACKS: TokenPack[] = [
  {
    id: 'pack_30',
    name: '30 TK Starter Pack',
    tokens: 30,
    priceInTaka: 300,
    bonusTokens: 0,
    tagline: 'Ideal for occasional extra meals and guest hosting.',
  },
  {
    id: 'pack_60',
    name: '60 TK Monthly Booster',
    tokens: 60,
    priceInTaka: 590,
    bonusTokens: 2, // Total 62 TK
    popular: true,
    tagline: 'Matches the monthly hostel quota. Most popular student tier.',
  },
  {
    id: 'pack_120',
    name: '120 TK Semester Pass',
    tokens: 120,
    priceInTaka: 1100,
    bonusTokens: 8, // Total 128 TK
    tagline: 'Maximum savings with 8 bonus tokens included.',
  },
];

export const TokenStoreModal: React.FC<TokenStoreModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onPurchase,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('pack_60');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuy = () => {
    setIsProcessing(true);
    setSuccessMsg(null);

    let tokensToCredit = 0;
    let packName = '';

    if (isCustom) {
      const parsed = parseInt(customAmount, 10);
      if (isNaN(parsed) || parsed <= 0) {
        setIsProcessing(false);
        return;
      }
      tokensToCredit = parsed;
      packName = `Custom Top-Up (${parsed} TK)`;
    } else {
      const pack = TOKEN_PACKS.find((p) => p.id === selectedPackId);
      if (!pack) {
        setIsProcessing(false);
        return;
      }
      tokensToCredit = pack.tokens + pack.bonusTokens;
      packName = pack.name;
    }

    setTimeout(() => {
      onPurchase(tokensToCredit, packName);
      setIsProcessing(false);
      setSuccessMsg(`Successfully added ${tokensToCredit} TK to your dining balance!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1400);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Purchase Mess Tokens</h2>
              <p className="text-xs text-slate-500">
                Top up your student dining account with official mess meal credits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Student Snapshot */}
        {currentStudent && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Crediting Account:</span>{' '}
              <span className="font-bold text-slate-900">{currentStudent.name}</span>{' '}
              <span className="font-mono text-slate-500">({currentStudent.rollNo})</span>
            </div>
            <div className="font-mono">
              <span className="text-slate-500">Current Balance:</span>{' '}
              <span className="font-bold text-amber-700">{currentStudent.tokenBalance} TK</span>
            </div>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Packs Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOKEN_PACKS.map((pack) => {
            const isSelected = !isCustom && selectedPackId === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => {
                  setIsCustom(false);
                  setSelectedPackId(pack.id);
                }}
                className={`cursor-pointer rounded-2xl p-4 border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-2.5 right-4 bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full tracking-wider uppercase">
                    Recommended
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{pack.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-extrabold text-slate-900">
                      {pack.tokens}
                    </span>
                    <span className="text-xs font-bold text-amber-600">TK</span>
                    {pack.bonusTokens > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded ml-1">
                        +{pack.bonusTokens} Free
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    {pack.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-900">
                    ৳{pack.priceInTaka}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Token Option */}
        <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="packSelect"
              checked={isCustom}
              onChange={() => setIsCustom(true)}
              className="text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-slate-900">
              Or Enter Custom Token Amount
            </span>
          </label>

          {isCustom && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative max-w-xs">
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-xs text-slate-600">
                Rate: 1 TK = ৳10 (Total:{' '}
                <span className="font-mono font-bold">
                  ৳{(parseInt(customAmount, 10) || 0) * 10}
                </span>
                )
              </span>
            </div>
          )}
        </div>

        {/* Security / Invariant Notice */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-100/70 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Instant balance update · Non-negative zero floor preserved · Synced with hostel dining registry.
          </span>
        </div>

        {/* Checkout Button */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleBuy}
            disabled={isProcessing || (isCustom && (!customAmount || parseInt(customAmount, 10) <= 0))}
            className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Payment...' : 'Confirm & Add Tokens'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
