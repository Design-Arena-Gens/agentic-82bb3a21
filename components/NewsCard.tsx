import type { ReactElement } from 'react';
import type { ProcessedNewsItem } from '@/lib/newsFetcher';

interface NewsCardProps {
  item: ProcessedNewsItem;
}

const priorityLabel: Record<ProcessedNewsItem['priority'], string> = {
  standard: 'Standard Priority',
  elevated: 'Elevated Priority',
  critical: 'Critical Priority'
};

const badgeClass: Record<ProcessedNewsItem['priority'], string> = {
  standard: 'badge',
  elevated: 'badge warning',
  critical: 'badge critical'
};

export function NewsCard({ item }: NewsCardProps): ReactElement {
  return (
    <article className="panel news-card">
      <header>
        <span>
          {item.company} • {item.focus.replace('-', ' ')} • {item.relativeTime}
        </span>
        <h3>
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h3>
      </header>

      <p>{item.summary}</p>

      <div className="badge-row">
        <span className={badgeClass[item.priority]}>{priorityLabel[item.priority]}</span>
        {item.sopAssignments.map((assignment) => (
          <span key={assignment.category.id} className="badge">
            {assignment.category.name}
          </span>
        ))}
      </div>

      {item.matchedSignals.length > 0 ? (
        <div className="follow-up">
          <h4>Signals Detected</h4>
          <div className="badge-row">
            {item.matchedSignals.map((signal) => (
              <span key={signal} className="badge">
                {signal}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {item.followUpActions.length > 0 ? (
        <div className="follow-up">
          <h4>SOP Follow-up Actions</h4>
          <ul>
            {item.followUpActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
