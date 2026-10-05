import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { db } from '@/lib/localDb';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { localISO, fmtDate, weekRange } from '@/lib/format';
import { useSettings } from '@/hooks/useUnit';

const DUE = ['CRHSBE', 'CRHTER', 'CRHAS'];

export default function MissingReports() {
  const { data: settings } = useSettings();
  const weekDay = Number(settings?.week_start_day ?? 5);

  const { data: missingWeeks = [] } = useQuery({
    queryKey: ['missingReports', weekDay],
    queryFn: async () => {
      // Check current week and previous 12 weeks
      const missing = [];
      
      for (let weeksBack = 0; weeksBack <= 12; weeksBack++) {
        const offset = weeksBack * 7;
        const { start, end } = weekRange(weekDay, -offset);
        
        // Check if any of the due reports are missing for this week
        const counts = await Promise.all(
          DUE.map((type) => db.messages.count({ type, date: { $gte: start, $lte: end } }))
        );
        
        const hasMissing = counts.some(count => count === 0);
        
        if (hasMissing) {
          missing.push({
            start,
            end,
            week: weeksBack,
            counts,
            missingTypes: DUE.filter((_, i) => counts[i] === 0)
          });
        } else if (weeksBack > 0) {
          // Stop if we find a complete week
          break;
        }
      }
      
      return missing;
    },
  });

  if (missingWeeks.length === 0) return null;

  return (
    <section className="dashboard-section rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg text-amber-900 dark:text-amber-100 mb-3">
            Rapports manquants
          </h2>
          <div className="space-y-3">
            {missingWeeks.map((week) => (
              <div key={`${week.start}-${week.end}`} className="bg-white/50 dark:bg-black/30 rounded-lg p-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Semaine du {fmtDate(week.start)} au {fmtDate(week.end)}
                  </span>
                  {week.week > 0 && (
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                      il y a {week.week} semaine{week.week > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {week.missingTypes.map((type) => {
                    const T = MESSAGE_TYPES[type];
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-mono"
                      >
                        {T.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
