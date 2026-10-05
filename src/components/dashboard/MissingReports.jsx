import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { db } from '@/lib/localDb';
import { MESSAGE_TYPES } from '@/lib/messageTypes';
import { fmtDate } from '@/lib/format';
import { useSettings } from '@/hooks/useUnit';

const DUE = ['CRHSBE', 'CRHTER', 'CRHAS'];

function isoToDateInput(date) {
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getWeekRange(weekStartDay, weeksBack = 0) {
  const today = new Date();
  const currentDay = today.getDay();
  const offsetToStart = (currentDay - weekStartDay + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - offsetToStart - weeksBack * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: isoToDateInput(start),
    end: isoToDateInput(end),
  };
}

export default function MissingReports() {
  const { data: settings } = useSettings();
  const weekDay = Number(settings?.week_start_day ?? 5);

  const { data: missingWeeks = [] } = useQuery({
    queryKey: ['missingReports', weekDay],
    queryFn: async () => {
      const results = [];

      for (let weeksBack = 0; weeksBack <= 12; weeksBack++) {
        const { start, end } = getWeekRange(weekDay, weeksBack);

        const counts = await Promise.all(
          DUE.map((type) =>
            db.messages.count({
              type,
              date: { $gte: start, $lte: end },
            })
          )
        );

        const missingTypes = DUE.filter((_, i) => counts[i] === 0);

        if (missingTypes.length > 0) {
          results.push({
            start,
            end,
            label: weeksBack === 0 ? 'Semaine courante' : `Semaine du ${fmtDate(start)} au ${fmtDate(end)}`,
            missingTypes,
            weeksBack,
          });
        }
      }

      return results;
    },
  });

  if (!missingWeeks.length) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/70 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-xl text-amber-900 dark:text-amber-100">
            CR hebdomadaires non émis
          </h2>

          <div className="mt-4 space-y-3">
            {missingWeeks.map((week) => (
              <div
                key={`${week.start}-${week.end}`}
                className="rounded-xl border border-amber-200 bg-white/60 p-3 dark:border-amber-800 dark:bg-black/10"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {week.weeksBack === 0 ? 'Semaine en cours' : `Semaine manquée (${week.weeksBack} semaine${week.weeksBack > 1 ? 's' : ''} précédente${week.weeksBack > 1 ? 's' : ''})`}
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300">
                    {fmtDate(week.start)} → {fmtDate(week.end)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {week.missingTypes.map((type) => {
                    const T = MESSAGE_TYPES[type];
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center rounded-full bg-amber-200/80 px-2.5 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-900/60 dark:text-amber-100"
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
