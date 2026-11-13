import { useState } from 'react';
import type { WalkthroughOverview } from '../../../types.ts';
import { ReadOnlyMarkdownView } from '../ReadOnlyMarkdownView.tsx';

const views = {
  calls: 'Call tree',
  flow: 'Component flow',
  sequence: 'Sequence diagram',
} as const;
type View = keyof typeof views;

export function SystemOverview({
  openStop,
  overview,
  stopIds,
}: {
  openStop: (index: number) => void;
  overview: WalkthroughOverview;
  stopIds: ReadonlyArray<string>;
}) {
  const [view, setView] = useState<View>('calls');
  const renderCalls = (parent?: string) => (
    <ul>
      {overview.calls
        .filter((call) => (call.parent || undefined) === parent)
        .map((call) => {
          const index = stopIds.indexOf(call.stopId ?? '');
          return (
            <li key={call.id}>
              <details>
                <summary>
                  <small>{call.file}</small> <code>{call.symbol}</code>
                </summary>
                <p>{call.explanation}</p>
                {call.snippet && <pre>{call.snippet}</pre>}
                {index >= 0 && (
                  <button onClick={() => openStop(index)} type="button">
                    Review change
                  </button>
                )}
              </details>
              {renderCalls(call.id)}
            </li>
          );
        })}
    </ul>
  );
  return (
    <section className="wt-system-overview">
      <h2>System overview</h2>
      <div aria-label="Overview views" role="group">
        {(Object.keys(views) as Array<View>).map((key) => (
          <button aria-pressed={view === key} key={key} onClick={() => setView(key)} type="button">
            {views[key]}
          </button>
        ))}
      </div>
      <div hidden={view !== 'calls'}>{renderCalls()}</div>
      {view !== 'calls' && (
        <ReadOnlyMarkdownView
          ariaLabel={views[view]}
          className="wt-overview-diagram"
          value={['```mermaid', overview[view], '```'].join('\n')}
        />
      )}
    </section>
  );
}
