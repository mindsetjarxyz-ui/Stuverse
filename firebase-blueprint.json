import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type Plan = 'free' | 'pro';
export type Language = 'en' | 'bn' | 'hi' | 'es';

interface AppState {
  plan: Plan;
  credits: number;
  lastClaimDate: string;
  streak: number;
  language: Language;
  recentTools: string[];
  quizAccuracy: number;
  totalQuizzesTaken: number;
  
  // UI State
  confirmDialog: { isOpen: boolean; message: string; onConfirm: () => void } | null;
  alertDialog: { isOpen: boolean; message: string } | null;
  
  // Actions
  claimDailyCredits: () => void;
  useCredits: (amount: number) => boolean;
  upgradeToPro: () => void;
  setLanguage: (lang: Language) => void;
  addRecentTool: (tool: string) => void;
  updateQuizAccuracy: (score: number, total: number) => void;
  syncWithFirestore: (userId: string) => Promise<void>;
  
  showConfirm: (message: string, onConfirm: () => void) => void;
  showAlert: (message: string) => void;
  closeConfirm: () => void;
  closeAlert: () => void;
}

const DAILY_FREE_CREDITS = 45;
const DAILY_PRO_CREDITS = 120;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plan: 'free',
      credits: DAILY_FREE_CREDITS,
      lastClaimDate: new Date().toISOString().split('T')[0],
      streak: 1,
      language: 'en',
      recentTools: [],
      quizAccuracy: 0,
      totalQuizzesTaken: 0,
      
      confirmDialog: null,
      alertDialog: null,

      claimDailyCredits: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastClaimDate, plan, streak } = get();
        
        if (today !== lastClaimDate) {
          const lastDate = new Date(lastClaimDate);
          const currentDate = new Date(today);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          
          set({
            credits: plan === 'pro' ? DAILY_PRO_CREDITS : DAILY_FREE_CREDITS,
            lastClaimDate: today,
            streak: diffDays === 1 ? streak + 1 : 1,
          });
        }
      },

      useCredits: (amount: number) => {
        const { credits } = get();
        if (credits >= amount) {
          set({ credits: credits - amount });
          return true;
        }
        return false;
      },

      upgradeToPro: () => set({ plan: 'pro', credits: DAILY_PRO_CREDITS }),
      
      setLanguage: (lang) => set({ language: lang }),
      
      addRecentTool: (tool) => set((state) => ({
        recentTools: [tool, ...state.recentTools.filter(t => t !== tool)].slice(0, 4)
      })),

      updateQuizAccuracy: (score, total) => set((state) => {
        const newTotal = state.totalQuizzesTaken + 1;
        return {
          totalQuizzesTaken: newTotal,
          quizAccuracy: Math.round(((state.quizAccuracy * state.totalQuizzesTaken) + (score / total * 100)) / newTotal)
        };
      }),

      syncWithFirestore: async (userId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const today = new Date().toISOString().split('T')[0];
            const lastRenewal = data.lastRenewalDate ? new Date(data.lastRenewalDate.seconds * 1000).toISOString().split('T')[0] : '';
            
            let currentCredits = data.credits ?? DAILY_FREE_CREDITS;
            let currentPlan = data.plan ?? 'free';

            if (today !== lastRenewal) {
              currentCredits = currentPlan === 'pro' ? DAILY_PRO_CREDITS : DAILY_FREE_CREDITS;
              await updateDoc(doc(db, 'users', userId), {
                credits: currentCredits,
                lastRenewalDate: serverTimestamp()
              });
            }

            set({
              credits: currentCredits,
              plan: currentPlan as Plan,
              lastClaimDate: today
            });
          }
        } catch (error) {
          console.error('Error syncing with Firestore:', error);
        }
      },
      
      showConfirm: (message, onConfirm) => set({ confirmDialog: { isOpen: true, message, onConfirm } }),
      showAlert: (message) => set({ alertDialog: { isOpen: true, message } }),
      closeConfirm: () => set({ confirmDialog: null }),
      closeAlert: () => set({ alertDialog: null }),
    }),
    {
      name: 'stuverse-storage',
      partialize: (state) => ({
        plan: state.plan,
        credits: state.credits,
        lastClaimDate: state.lastClaimDate,
        streak: state.streak,
        language: state.language,
        recentTools: state.recentTools,
        quizAccuracy: state.quizAccuracy,
        totalQuizzesTaken: state.totalQuizzesTaken,
      }),
    }
  )
);
