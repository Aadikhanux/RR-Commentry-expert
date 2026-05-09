/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Zap, History, LayoutDashboard, Share2, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
interface BallEvent {
  batter: string;
  bowler: string;
  runs: number;
  extras: number;
  isWicket: boolean;
  wicketType?: string;
  overNumber?: string;
}

interface CommentaryOutput {
  text: string;
  emoji: string;
  timestamp: string;
}

const RR_PINK = "#EB1A8C";
const RR_BLUE = "#2D3E8B";

export default function App() {
  const [ballData, setBallData] = useState<BallEvent>({
    batter: "",
    bowler: "",
    runs: 0,
    extras: 0,
    isWicket: false,
    overNumber: "0.1"
  });

  const [commentary, setCommentary] = useState<CommentaryOutput | null>(null);
  const [history, setHistory] = useState<CommentaryOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const generateCommentary = async () => {
    if (!ballData.batter || !ballData.bowler) {
      setError("Please enter batter and bowler names.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            text: `Generate an engaging Hinglish (Hindi-English) commentary line for a cricket match.
            The commentary must have a strong bias/tilt towards Rajasthan Royals (RR). 
            Even if RR isn't explicitly mentioned in the input, assume the batter or bowler from RR (whichever is doing the positive action) is our guy.
            If RR is struggling (e.g. lost a wicket), the commentary should be emotional but hopeful as a true fan.
            
            Input Ball Data: ${JSON.stringify(ballData)}
            
            Format: A JSON object with "text" (the commentary) and "emoji" (1-2 relevant emojis).
            Language: Hinglish (Hindi mixed with English, street style/IPL vibe).
            Style: Short, punchy, 1-2 sentences.
            `
          }
        ],
        config: {
          systemInstruction: "You are a die-hard Rajasthan Royals (RR) fan and a vernacular cricket commentator. You love the 'Halla Bol' spirit. Your commentary is always in Hinglish, colorful, and energetic.",
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "{}");
      const newCommentary = {
        ...result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCommentary(newCommentary);
      setHistory(prev => [newCommentary, ...prev].slice(0, 5));
    } catch (err) {
      console.error(err);
      setError("Failed to generate commentary. Check your API key or input.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BallEvent, value: string | number | boolean) => {
    setBallData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A]">
      {/* Header */}
      <header className="bg-[#2D3E8B] text-white p-6 shadow-lg border-b-4 border-[#EB1A8C] font-display">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EB1A8C] rounded-lg">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase">RR Halla Bol AI</h1>
              <p className="text-xs font-medium opacity-80 uppercase tracking-widest font-sans">Live Commentary Generator</p>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-[#EB1A8C] transition-colors">Live Match</a>
            <a href="#" className="hover:text-[#EB1A8C] transition-colors">Fan Wall</a>
            <a href="#" className="hover:text-[#EB1A8C] transition-colors">Stats</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-2 gap-8 mt-4">
        {/* Left Col: Controls */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm font-display">
            <div className="flex items-center gap-2 mb-6">
              <LayoutDashboard className="w-5 h-5 text-[#2D3E8B]" />
              <h2 className="text-sm font-black uppercase tracking-tight text-[#2D3E8B]">Ball Event Entry</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Batter</label>
                <input
                  type="text"
                  placeholder="e.g. Sanju Samson"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EB1A8C] transition-all"
                  value={ballData.batter}
                  onChange={(e) => handleInputChange("batter", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Bowler</label>
                <input
                  type="text"
                  placeholder="e.g. Rashid Khan"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EB1A8C] transition-all"
                  value={ballData.bowler}
                  onChange={(e) => handleInputChange("bowler", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Runs</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EB1A8C]"
                  value={ballData.runs}
                  onChange={(e) => handleInputChange("runs", parseInt(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 6].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Extras</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EB1A8C]"
                  value={ballData.extras}
                  onChange={(e) => handleInputChange("extras", parseInt(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Over</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EB1A8C]"
                  value={ballData.overNumber}
                  onChange={(e) => handleInputChange("overNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => handleInputChange("isWicket", !ballData.isWicket)}
                className={`flex-1 p-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border-2 ${
                  ballData.isWicket 
                  ? "bg-red-600 text-white border-red-600" 
                  : "bg-transparent text-gray-400 border-gray-200 hover:border-red-600 hover:text-red-600"
                }`}
              >
                {ballData.isWicket ? "Out!" : "Wicket?"}
              </button>
              <button
                onClick={generateCommentary}
                disabled={isLoading}
                className="flex-[2] bg-[#EB1A8C] hover:bg-[#d0177b] text-white p-3 rounded-lg text-sm font-black uppercase tracking-widest shadow-lg shadow-[#EB1A8C]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Generate <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold uppercase tracking-tight">{error}</p>
            )}
          </section>

          <section className="bg-[#2D3E8B] p-6 rounded-2xl text-white font-display">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5" />
              <h2 className="text-xs font-black uppercase tracking-widest">Recent Updates</h2>
            </div>
            <div className="space-y-4 font-sans">
              {history.map((item, idx) => (
                <div key={idx} className="border-l-2 border-[#EB1A8C] pl-4 py-1">
                  <p className="text-xs font-medium opacity-60 mb-1">{item.timestamp}</p>
                  <p className="text-sm font-bold leading-tight">{item.text} {item.emoji}</p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs italic opacity-50">No updates yet. Halla Bol!</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Col: Output View */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {commentary ? (
              <motion.div
                key={commentary.text}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-8 border-2 border-[#EB1A8C] shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center items-center text-center min-h-[400px]"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Zap className="w-64 h-64 text-[#EB1A8C]" />
                </div>
                
                <div className="relative z-10 space-y-8 font-display">
                  <div className="text-7xl mb-4">{commentary.emoji}</div>
                  <blockquote className="text-3xl md:text-5xl font-black italic text-[#2D3E8B] leading-tight tracking-tighter">
                    "{commentary.text}"
                  </blockquote>
                  
                  <div className="pt-8 flex flex-wrap justify-center gap-3 font-sans">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black italic uppercase tracking-widest text-gray-500">
                      #{ballData.batter.replace(/\s+/g, '')}
                    </span>
                    <span className="px-4 py-2 bg-pink-100 text-[#EB1A8C] rounded-full text-[10px] font-black italic uppercase tracking-widest">
                      #HallaBol
                    </span>
                    <span className="px-4 py-2 bg-blue-100 text-[#2D3E8B] rounded-full text-[10px] font-black italic uppercase tracking-widest">
                      #IPL2024
                    </span>
                  </div>

                  <div className="pt-12 flex justify-center gap-4">
                    <button className="p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
                      <Share2 className="w-6 h-6 text-gray-400" />
                    </button>
                    <button className="flex-1 px-8 py-4 bg-[#2D3E8B] text-white rounded-full font-black uppercase tracking-widest hover:bg-[#1a2b7a] transition-all shadow-xl shadow-blue-900/20">
                      Copy for Post
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-100 rounded-3xl p-8 border-2 border-dashed border-gray-300 flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                <Zap className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-bold uppercase tracking-widest italic opacity-40">Ready for the action?</p>
                <p className="text-xs uppercase tracking-tight opacity-40 mt-1">Enter ball data to spark the commentary</p>
              </div>
            )}
          </AnimatePresence>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-t-4 border-t-yellow-400">
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Commentary Tips
            </h3>
            <ul className="text-xs space-y-2 font-medium text-gray-500 uppercase tracking-tight">
              <li>• Focus on aggressive intent for RR batters</li>
              <li>• Celebrate Jos Buttler's scoops specifically</li>
              <li>• Praise Yuzi Chahal's 'Chalaki' (cunningness)</li>
              <li>• Use "Halla Bol" for momentum shifts</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto p-8 text-center border-t border-gray-200 mt-12 pb-12 font-display">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
          Powered by Gemini 3 Flash • Built for the Royals Family 💖👑
        </p>
      </footer>
    </div>
  );
}

