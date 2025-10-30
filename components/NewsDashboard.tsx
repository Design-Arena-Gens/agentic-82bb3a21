'use client';

import { useMemo, useState, type ChangeEvent, type ReactElement } from 'react';
import type { NewsFetchResult, ProcessedNewsItem } from '@/lib/newsFetcher';
import { SOP_CATEGORIES } from '@/lib/sop';
import { CategorySummary } from './CategorySummary';
import { NewsCard } from './NewsCard';

interface NewsDashboardProps {
  initialResult: NewsFetchResult;
}

type CategoryFilter = 'all' | string;

const LOOKBACK_OPTIONS = [7, 14, 30, 60, 90, 120, 180];

export function NewsDashboard({ initialResult }: NewsDashboardProps): ReactElement {
  const [result, setResult] = useState<NewsFetchResult>(initialResult);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [lookback, setLookback] = useState(initialResult.lookbackDays);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialResult.errors.length > 0
      ? `Some sources failed to load: ${initialResult.errors
          .map((err) => `${err.company} (${err.message})`)
          .join(', ')}`
      : null
  );

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const item of result.items) {
      set.add(item.company);
    }
    return Array.from(set).sort();
  }, [result.items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return result.items.filter((item) => {
      if (
        selectedCategory !== 'all' &&
        !item.sopAssignments.some((assignment) => assignment.category.id === selectedCategory)
      ) {
        return false;
      }

      if (selectedCompany !== 'all' && item.company !== selectedCompany) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = `${item.title} ${item.summary} ${item.matchedSignals.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [result.items, search, selectedCategory, selectedCompany]);

  const refreshNews = async (targetLookback = lookback): Promise<void> => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/news?days=${targetLookback}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`);
      }
      const data = (await response.json()) as NewsFetchResult;
      setResult(data);
      setLookback(data.lookbackDays);
      if (data.errors.length > 0) {
        setErrorMessage(
          `Some sources failed to refresh: ${data.errors
            .map((err) => `${err.company} (${err.message})`)
            .join(', ')}`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Unable to refresh news feed. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLookbackChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = Number.parseInt(event.target.value, 10);
    setLookback(value);
    void refreshNews(value);
  };

  const handleCategoryClick = (categoryId: string): void => {
    setSelectedCategory((prev) => (prev === categoryId ? 'all' : categoryId));
  };

  const lastGenerated = new Date(result.generatedAt).toLocaleString();

  return (
    <div className="dashboard-wrapper">
      <section className="panel">
        <h2>Monitoring Controls</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="lookback-select">Lookback window</label>
            <select id="lookback-select" value={lookback} onChange={handleLookbackChange}>
              {LOOKBACK_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  Last {days} days
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="company-select">Company</label>
            <select
              id="company-select"
              value={selectedCompany}
              onChange={(event) => setSelectedCompany(event.target.value)}
            >
              <option value="all">All companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search-input">Search signals</label>
            <input
              id="search-input"
              type="search"
              placeholder="Filter by molecule, indication, signal"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Realtime status</label>
            <div>
              <button
                type="button"
                className="refresh-button"
                onClick={() => void refreshNews()}
                disabled={loading}
              >
                ↺ Refresh now
              </button>
            </div>
          </div>
        </div>

        <div className="category-pills" role="group" aria-label="SOP categories">
          <button
            type="button"
            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All SOP categories
          </button>
          {SOP_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small>Dashboard generated: {lastGenerated}</small>
          {loading ? (
            <div className="loading-indicator" aria-live="polite">
              <span />
              <span />
              <span />
              <p style={{ margin: 0 }}>Refreshing feed…</p>
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="alert-panel" role="status" aria-live="polite">
            <strong>Data quality alert:</strong>
            <p>{errorMessage}</p>
          </div>
        ) : null}
      </section>

      <CategorySummary items={filteredItems} />

      <section className="panel">
        <h2>Biosimilar Intelligence Queue</h2>
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <strong>No biosimilar updates match the current filters.</strong>
            Try broadening the lookback window or clearing the filters.
          </div>
        ) : (
          <div className="news-grid">
            {filteredItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
