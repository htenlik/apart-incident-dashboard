import express from 'express';
import cors from 'cors';
import fs from 'node:fs';

type EventStatus = 'Confirmed' | 'Disputed' | 'Uncertain';

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

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const eventsPath = new URL('./data/events.json', import.meta.url);
const sourcesPath = new URL('./data/sources.json', import.meta.url);
const checksPath = new URL('./data/checks.json', import.meta.url);

const events: IncidentEvent[] = JSON.parse(
  fs.readFileSync(eventsPath, 'utf-8')
);

const sources: Source[] = JSON.parse(
  fs.readFileSync(sourcesPath, 'utf-8')
);

const checks: CheckItem[] = JSON.parse(
  fs.readFileSync(checksPath, 'utf-8')
);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'apart-incident-dashboard-api',
  });
});

app.get('/api/events', (req, res) => {
  const status =
    typeof req.query.status === 'string'
      ? req.query.status.toLowerCase()
      : null;

  const category =
    typeof req.query.category === 'string'
      ? req.query.category.toLowerCase()
      : null;

  const filteredEvents = events.filter((event) => {
    const statusMatches =
      !status || event.status.toLowerCase() === status;

    const categoryMatches =
      !category || event.category.toLowerCase() === category;

    return statusMatches && categoryMatches;
  });

  res.json(filteredEvents);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find(
    (item) => item.id.toLowerCase() === req.params.id.toLowerCase()
  );

  if (!event) {
    return res.status(404).json({
      error: 'Event not found',
    });
  }

  res.json(event);
});

app.get('/api/sources', (_req, res) => {
  res.json(sources);
});

app.get('/api/sources/:id', (req, res) => {
  const source = sources.find(
    (item) => item.id.toLowerCase() === req.params.id.toLowerCase()
  );

  if (!source) {
    return res.status(404).json({
      error: 'Source not found',
    });
  }

  res.json(source);
});

app.get('/api/checks', (_req, res) => {
  res.json(checks);
});

app.get('/api/summary', (_req, res) => {
  const confirmed = events.filter(
    (event) => event.status === 'Confirmed'
  ).length;

  const disputed = events.filter(
    (event) => event.status === 'Disputed'
  ).length;

  const uncertain = events.filter(
    (event) => event.status === 'Uncertain'
  ).length;

  res.json({
    totalEvents: events.length,
    totalSources: sources.length,
    byStatus: {
      confirmed,
      disputed,
      uncertain,
    },
  });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
