// Shows past attempts and improvement over time, grouped by test.

import type { TestResult } from '../types'

interface HistoryPanelProps {
  history: TestResult[]
  onClearHistory: () => void
}

/**
 * Group history by testId, preserving the order each test was most recently
 * taken (newest activity first). Uses the stored testTitle as the label, so
 * synthetic sources like Endless Practice show up alongside the fixed exams.
 */
function groupByTest(history: TestResult[]): Array<{ id: string; title: string; attempts: TestResult[] }> {
  const order: string[] = []
  const byId = new Map<string, { id: string; title: string; attempts: TestResult[] }>()
  for (const r of history) {
    let group = byId.get(r.testId)
    if (!group) {
      group = { id: r.testId, title: r.testTitle, attempts: [] }
      byId.set(r.testId, group)
      order.push(r.testId)
    }
    group.attempts.push(r)
  }
  // attempts arrive newest-first; reverse to oldest -> newest for the chart
  return order.map((id) => {
    const g = byId.get(id)!
    return { ...g, attempts: g.attempts.slice().reverse() }
  })
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function HistoryPanel({ history, onClearHistory }: HistoryPanelProps) {
  // Study-mode runs aren't recorded, so history holds only graded attempts.
  if (history.length === 0) {
    return (
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-dmv-blue">Your progress</h2>
        <p className="text-sm text-gray-600">
          No attempts yet. Take a test and your scores will appear here so you can track
          improvement over time.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-dmv-blue">Your progress</h2>
        <button
          onClick={onClearHistory}
          className="text-xs font-medium text-gray-500 underline hover:text-red-600"
        >
          Clear history
        </button>
      </div>

      <div className="space-y-5">
        {groupByTest(history).map((test) => {
          const attempts = test.attempts // oldest -> newest for a left-to-right trend

          const first = attempts[0].scorePercent
          const last = attempts[attempts.length - 1].scorePercent
          const delta = Math.round((last - first) * 10) / 10

          return (
            <div key={test.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-800">{test.title}</span>
                {attempts.length > 1 && (
                  <span
                    className={
                      delta > 0
                        ? 'text-green-600'
                        : delta < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }
                  >
                    {delta > 0 ? '▲' : delta < 0 ? '▼' : '＝'} {Math.abs(delta)}% since first try
                  </span>
                )}
              </div>
              {/* Simple inline bar chart of each attempt's score */}
              <div className="flex items-end gap-1.5">
                {attempts.map((a) => (
                  <div key={a.id} className="flex flex-1 flex-col items-center">
                    <div
                      className="flex w-full items-start justify-center rounded-t"
                      style={{ height: 70 }}
                    >
                      <div
                        className={`w-full rounded-t ${a.passed ? 'bg-green-500' : 'bg-red-400'}`}
                        style={{ height: `${Math.max(a.scorePercent, 4)}%`, alignSelf: 'flex-end' }}
                        title={`${a.scorePercent}% on ${formatDate(a.completedAt)}`}
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-gray-500">{a.scorePercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
