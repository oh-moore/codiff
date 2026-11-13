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
  focus,
  openStop,
  overview,
  stopIds,
  title,
}: {
  focus: string;
  openStop: (index: number) => void;
  overview: WalkthroughOverview;
  stopIds: ReadonlyArray<string>;
  title: string;
}) {
  const [view, setView] = useState<View>('calls');
  const renderCalls = (parent?: string) => (
    <ul>
      {overview.calls
        .filter((call) => (call.parent || undefined) === parent)
        .map((call) => {
          const index = stopIds.indexOf(call.stopId ?? '');
          const label = (
            <>
              <small>{call.file}</small>
              <code>{call.symbol.replace(/\.(?=[^.]+$)/, ' → ')}</code>
              <span>{call.explanation}</span>
            </>
          );
          return (
            <li key={call.id}>
              {call.snippet || index >= 0 ? (
                <details>
                  <summary>{label}</summary>
                  {call.snippet && <pre>{call.snippet}</pre>}
                  {index >= 0 && (
                    <button onClick={() => openStop(index)} type="button">
                      Review change
                    </button>
                  )}
                </details>
              ) : (
                <div className="wt-call-card">{label}</div>
              )}
              {renderCalls(call.id)}
            </li>
          );
        })}
    </ul>
  );
  return (
    <section className="wt-system-overview">
      <header>
        <small>System overview</small>
        <h2>{title}</h2>
        <p>{focus}</p>
      </header>
      <div aria-label="Overview views" role="group">
        {(Object.keys(views) as Array<View>).map((key) => (
          <button aria-pressed={view === key} key={key} onClick={() => setView(key)} type="button">
            {views[key]}
          </button>
        ))}
      </div>
      <div hidden={view !== 'calls'}>
        <h3>Call tree</h3>
        {renderCalls()}
      </div>
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
