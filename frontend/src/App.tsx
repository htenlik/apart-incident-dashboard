import { useEffect, useMemo, useState } from 'react';
import './App.css';

type EventStatus = 'Confirmed' | 'Disputed' | 'Uncertain';
type StatusFilter = 'All' | EventStatus;

type Summary = {
  totalEvents: number;
  totalSources: number;
  byStatus: {
    confirmed: number;
    disputed: number;
    uncertain: number;
  };
};

type IncidentEvent = {
  id: string;
  eventDate: string;
  eventTitle: string;
  claim: string;
  status: EventStatus;
  category: string;
  primarySourceId: string;
  supportingSourceIds: string[];
  evidenceSummary: string;
  whyThisStatus: string;
  uncertainty: string;
  tags: string[];
};

type Source = {
  id: string;
  publisher: string;
  title: string;
  published: string;
  type: string;
  url: string;
  role: string;
  notes: string;
};

type CheckItem = {
  id: string;
  type: 'Check' | 'Watch';
  title: string;
  question: string;
  whyItMatters: string;
  evidenceIds: string[];
};

function App() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [checks, setChecks] = useState<CheckItem[]>([]);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('All');

  const [sourceFilter, setSourceFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedEvent, setSelectedEvent] =
    useState<IncidentEvent | null>(null);

  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/summary'),
      fetch('http://localhost:3001/api/events'),
      fetch('http://localhost:3001/api/sources'),
      fetch('http://localhost:3001/api/checks'),
    ])
      .then(
        async ([
          summaryResponse,
          eventsResponse,
          sourcesResponse,
          checksResponse,
        ]) => {
          if (
            !summaryResponse.ok ||
            !eventsResponse.ok ||
            !sourcesResponse.ok ||
            !checksResponse.ok
          ) {
            throw new Error('Backend request failed');
          }

          const summaryData: Summary =
            await summaryResponse.json();

          const eventsData: IncidentEvent[] =
            await eventsResponse.json();

          const sourcesData: Source[] =
            await sourcesResponse.json();

          const checksData: CheckItem[] =
            await checksResponse.json();

          setSummary(summaryData);
          setEvents(eventsData);
          setSources(sourcesData);
          setChecks(checksData);
        }
      )
      .catch(() => {
        setError('Could not connect to backend.');
      });
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedEvent(null);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const categories = useMemo(() => {
    return [...new Set(events.map((event) => event.category))].sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const statusMatches =
          statusFilter === 'All' ||
          event.status === statusFilter;

        const sourceMatches =
          sourceFilter === 'All' ||
          event.primarySourceId === sourceFilter ||
          event.supportingSourceIds.includes(sourceFilter);

        const categoryMatches =
          categoryFilter === 'All' ||
          event.category === categoryFilter;

        const fromDateMatches =
          !fromDate || event.eventDate >= fromDate;

        const toDateMatches =
          !toDate || event.eventDate <= toDate;

        return (
          statusMatches &&
          sourceMatches &&
          categoryMatches &&
          fromDateMatches &&
          toDateMatches
        );
      })
      .sort((a, b) => {
        const dateComparison =
          a.eventDate.localeCompare(b.eventDate);

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return a.id.localeCompare(b.id);
      });
  }, [
    events,
    statusFilter,
    sourceFilter,
    categoryFilter,
    fromDate,
    toDate,
  ]);

  const getSource = (sourceId: string) => {
    return sources.find(
      (source) => source.id === sourceId
    );
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setSourceFilter('All');
    setCategoryFilter('All');
    setFromDate('');
    setToDate('');
  };

  const hasActiveFilters =
    statusFilter !== 'All' ||
    sourceFilter !== 'All' ||
    categoryFilter !== 'All' ||
    fromDate !== '' ||
    toDate !== '';

  if (error) {
    return (
      <div className="state-message error-message">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="state-message">
        Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <main className="dashboard">
        <header className="hero">
          <p className="eyebrow">
            Apart AI Incident Response Sprint
          </p>

          <h1>
            AI Incident Timeline & Evidence Dashboard
          </h1>

          <p className="hero-description">
            A structured reconstruction of the
            OpenAI–Hugging Face incident, separating
            confirmed events from disputed and uncertain
            claims.
          </p>

          <p className="source-count">
            Evidence base: {summary.totalSources} public
            sources
          </p>
        </header>

        <section className="summary-grid">
          <article className="summary-card">
            <span>Total records</span>
            <strong>{summary.totalEvents}</strong>
          </article>

          <article className="summary-card">
            <span>Confirmed</span>
            <strong>
              {summary.byStatus.confirmed}
            </strong>
          </article>

          <article className="summary-card">
            <span>Disputed</span>
            <strong>
              {summary.byStatus.disputed}
            </strong>
          </article>

          <article className="summary-card">
            <span>Uncertain</span>
            <strong>
              {summary.byStatus.uncertain}
            </strong>
          </article>
        </section>

        <section className="checks-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Actionable follow-up
              </p>

              <h2>Checks / Watch Next</h2>
            </div>

            <span className="result-count">
              {checks.length} items
            </span>
          </div>

          <p className="checks-intro">
            Concrete questions derived from the incident
            record that investigators or evaluation teams
            could verify next.
          </p>

          <div className="checks-grid">
            {checks.map((item) => (
              <article
                className="check-card"
                key={item.id}
              >
                <div className="check-card-top">
                  <span
                    className={`check-type ${item.type.toLowerCase()}`}
                  >
                    {item.type}
                  </span>

                  <span className="event-id">
                    {item.id}
                  </span>
                </div>

                <h3>{item.title}</h3>

                <div className="check-block">
                  <span>Question</span>

                  <p>{item.question}</p>
                </div>

                <div className="check-block">
                  <span>Why it matters</span>

                  <p>{item.whyItMatters}</p>
                </div>

                <div className="related-evidence">
                  <span>Related evidence</span>

                  <div className="evidence-links">
                    {item.evidenceIds.map(
                      (evidenceId) => (
                        <button
                          key={evidenceId}
                          onClick={() => {
                            const relatedEvent =
                              events.find(
                                (event) =>
                                  event.id ===
                                  evidenceId
                              );

                            if (relatedEvent) {
                              setSelectedEvent(
                                relatedEvent
                              );
                            }
                          }}
                        >
                          {evidenceId}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="timeline-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Evidence timeline
              </p>

              <h2>Incident record</h2>
            </div>

            <span className="result-count">
              {filteredEvents.length} records
            </span>
          </div>

          <div className="status-filter-block">
            <span className="filter-label">
              Evidence status
            </span>

            <div className="filters">
              {(
                [
                  'All',
                  'Confirmed',
                  'Disputed',
                  'Uncertain',
                ] as StatusFilter[]
              ).map((status) => (
                <button
                  key={status}
                  className={
                    statusFilter === status
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-panel">
            <div className="filter-group">
              <label htmlFor="source-filter">
                Source
              </label>

              <select
                id="source-filter"
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All sources
                </option>

                {sources.map((source) => (
                  <option
                    key={source.id}
                    value={source.id}
                  >
                    {source.id} — {source.publisher}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="category-filter">
                Category
              </label>

              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="from-date">
                From
              </label>

              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="to-date">
                To
              </label>

              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(event) =>
                  setToDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="filter-actions">
              <button
                className="reset-button"
                disabled={!hasActiveFilters}
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <h3>No matching records</h3>

              <p>
                Try changing or resetting the current
                evidence filters.
              </p>
            </div>
          ) : (
            <div className="timeline">
              {filteredEvents.map((event) => (
                <article
                  className="event-card clickable-event"
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                  onKeyDown={(keyboardEvent) => {
                    if (
                      keyboardEvent.key ===
                        'Enter' ||
                      keyboardEvent.key === ' '
                    ) {
                      setSelectedEvent(event);
                    }
                  }}
                >
                  <div className="event-meta">
                    <time>{event.eventDate}</time>

                    <span
                      className={`status-badge ${event.status.toLowerCase()}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className="event-heading">
                    <span className="event-id">
                      {event.id}
                    </span>

                    <span className="category">
                      {event.category}
                    </span>
                  </div>

                  <h3>{event.eventTitle}</h3>

                  <p className="claim">
                    {event.claim}
                  </p>

                  <div className="event-sources">
                    <span>
                      Primary:{' '}
                      {event.primarySourceId}
                    </span>

                    {event.supportingSourceIds
                      .length > 0 && (
                      <span>
                        Supporting:{' '}
                        {event.supportingSourceIds.join(
                          ', '
                        )}
                      </span>
                    )}
                  </div>

                  <span className="view-details">
                    View evidence →
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedEvent && (
        <div
          className="detail-backdrop"
          onClick={() =>
            setSelectedEvent(null)
          }
        >
          <aside
            className="detail-panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="detail-topbar">
              <div>
                <span className="event-id">
                  {selectedEvent.id}
                </span>

                <span
                  className={`status-badge ${selectedEvent.status.toLowerCase()}`}
                >
                  {selectedEvent.status}
                </span>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedEvent(null)
                }
                aria-label="Close evidence panel"
              >
                ×
              </button>
            </div>

            <p className="detail-date">
              {selectedEvent.eventDate}
            </p>

            <h2>
              {selectedEvent.eventTitle}
            </h2>

            <p className="detail-category">
              {selectedEvent.category}
            </p>

            <section className="detail-section">
              <h3>Claim / event</h3>

              <p>{selectedEvent.claim}</p>
            </section>

            <section className="detail-section">
              <h3>Evidence summary</h3>

              <p>
                {selectedEvent.evidenceSummary}
              </p>
            </section>

            <section className="detail-section">
              <h3>Why this status?</h3>

              <p>
                {selectedEvent.whyThisStatus}
              </p>
            </section>

            <section className="detail-section">
              <h3>Uncertainty / conflict</h3>

              <p>
                {selectedEvent.uncertainty}
              </p>
            </section>

            <section className="detail-section">
              <h3>Sources</h3>

              <div className="source-list">
                {[
                  selectedEvent.primarySourceId,
                  ...selectedEvent.supportingSourceIds,
                ]
                  .map((sourceId) =>
                    getSource(sourceId)
                  )
                  .filter(
                    (source): source is Source =>
                      Boolean(source)
                  )
                  .map((source, index) => (
                    <a
                      key={source.id}
                      className="source-card"
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="source-card-top">
                        <strong>
                          {source.id}
                        </strong>

                        <span>
                          {index === 0
                            ? 'Primary'
                            : 'Supporting'}
                        </span>
                      </div>

                      <p className="source-publisher">
                        {source.publisher} ·{' '}
                        {source.published}
                      </p>

                      <p className="source-title">
                        {source.title}
                      </p>
                    </a>
                  ))}
              </div>
            </section>

            <section className="detail-section">
              <h3>Tags</h3>

              <div className="tag-list">
                {selectedEvent.tags.map(
                  (tag) => (
                    <span
                      className="tag"
                      key={tag}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}

export default App;