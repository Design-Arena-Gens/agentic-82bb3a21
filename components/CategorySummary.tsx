import type { ReactElement } from 'react';
import type { ProcessedNewsItem } from '@/lib/newsFetcher';
import { SOP_CATEGORIES } from '@/lib/sop';

interface CategorySummaryProps {
  items: ProcessedNewsItem[];
}

export function CategorySummary({ items }: CategorySummaryProps): ReactElement {
  const counts = SOP_CATEGORIES.map((category) => {
    const matchingItems = items.filter((item) =>
      item.sopAssignments.some((assignment) => assignment.category.id === category.id)
    );
    return {
      category,
      count: matchingItems.length
    };
  });

  return (
    <section className="panel">
      <h2>Category Summary</h2>
      <div className="category-summary">
        {counts.map(({ category, count }) => (
          <div key={category.id} className="category-card">
            <h3>
              {category.name} ({count})
            </h3>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
