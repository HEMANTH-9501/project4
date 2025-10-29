# TalentFlow - Mini Hiring Platform

A modern, front-end-only React application for managing jobs, candidates, and assessments. Built with React 18, JavaScript, Vite, and MSW for API simulation.

## Features

### Jobs Management
- **CRUD Operations**: Create, read, update, and delete job postings
- **Drag-and-Drop Reordering**: Reorder jobs with optimistic updates and rollback on failure
- **Archive/Unarchive**: Toggle job status between active and archived
- **Filtering & Search**: Filter by status and search by title
- **Pagination**: Server-like pagination with 10 jobs per page
- **Deep Linking**: Direct access to job details via `/jobs/:jobId`

### Candidates Management
- **Virtualized List**: Efficiently display 1000+ candidates
- **Dual Views**: Switch between table and kanban board views
- **Search & Filter**: Search by name/email and filter by stage
- **Kanban Board**: Drag-and-drop candidates between stages (applied → screen → tech → offer → hired/rejected)
- **Candidate Profiles**: View detailed candidate information with status timeline
- **Notes System**: Add notes to candidates with timestamps

### Assessments
- **Assessment Builder**: Create multi-section assessments with various question types
- **Question Types**: 
  - Short text (with max length validation)
  - Long text
  - Single choice
  - Multi-choice
  - Numeric (with min/max range)
  - File upload (stub)
- **Live Preview**: Real-time preview of assessment forms
- **Validation Rules**: Required fields, numeric ranges, text length limits
- **Conditional Questions**: Show/hide questions based on responses (extensible)

### Technical Features
- **Local Persistence**: All data stored in IndexedDB via Dexie
- **API Simulation**: MSW (Mock Service Worker) with realistic latency (200-1200ms) and 5-10% error rate
- **Error Handling**: Comprehensive error handling with toast notifications
- **Responsive Design**: Mobile-friendly interface
- **State Management**: React Query for data fetching and caching

## Tech Stack

- **Frontend Framework**: React 18 (Pure JavaScript)
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **Data Fetching**: React Query v3
- **Forms**: React Hook Form
- **Local Storage**: Dexie (IndexedDB wrapper)
- **API Simulation**: MSW (Mock Service Worker)
- **Styling**: CSS3 with utility classes
- **UUID Generation**: uuid v9

## Project Structure

\`\`\`
src/
├── components/
│   ├── Layout.jsx              # Main layout with navigation
│   ├── Toast.jsx               # Toast notification component
│   ├── ToastContainer.jsx       # Toast container
│   ├── jobs/
│   │   ├── JobsList.jsx         # Jobs grid with drag-and-drop
│   │   └── JobModal.jsx         # Job creation/edit modal
│   ├── candidates/
│   │   ├── CandidatesList.jsx   # Candidates table view
│   │   └── KanbanBoard.jsx      # Kanban board view
│   └── assessments/
│       └── AssessmentBuilder.jsx # Assessment builder with preview
├── pages/
│   ├── JobsPage.jsx             # Jobs listing page
│   ├── JobDetailPage.jsx        # Job detail page
│   ├── CandidatesPage.jsx       # Candidates listing page
│   ├── CandidateDetailPage.jsx  # Candidate detail page
│   └── AssessmentsPage.jsx      # Assessment builder page
├── hooks/
│   └── useToast.js              # Toast notification hook
├── db/
│   └── index.js                 # Dexie database setup
├── mocks/
│   ├── browser.js               # MSW browser setup
│   ├── handlers.js              # API route handlers
│   └── seed.js                  # Database seeding
├── types/
│   └── index.js                 # Type definitions (JSDoc)
├── App.jsx                      # Main app component
├── main.jsx                     # Entry point
└── index.css                    # Global styles
\`\`\`

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd talentflow
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## API Endpoints

All endpoints are simulated with MSW and store data in IndexedDB.

### Jobs
- `GET /api/jobs?search=&status=&page=&pageSize=&sort=` - List jobs with pagination
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/reorder` - Reorder jobs

### Candidates
- `GET /api/candidates?search=&stage=&page=&pageSize=` - List candidates
- `PATCH /api/candidates/:id` - Update candidate stage
- `GET /api/candidates/:id/timeline` - Get candidate status timeline

### Assessments
- `GET /api/assessments/:jobId` - Get assessment for job
- `PUT /api/assessments/:jobId` - Create/update assessment
- `POST /api/assessments/:jobId/submit` - Submit assessment responses

## Seed Data

The application automatically seeds the database on first load with:
- **25 Jobs**: Mix of active and archived positions with various tags
- **1,000 Candidates**: Randomly distributed across jobs and stages
- **3 Assessments**: Complete assessments with 10+ questions each
- **Timeline Events**: Sample status transitions for candidates

## Data Persistence

All data is persisted locally using IndexedDB through Dexie:
- Jobs, candidates, assessments, and timeline events are stored locally
- Data persists across browser sessions
- MSW intercepts API calls and reads/writes to IndexedDB
- On page refresh, data is restored from IndexedDB

## Error Handling

- **Network Errors**: 5-10% simulated error rate on write operations
- **Validation**: Client-side validation for required fields and unique constraints
- **Toast Notifications**: User-friendly error and success messages
- **Optimistic Updates**: UI updates immediately with rollback on failure
- **Retry Logic**: Failed operations can be retried

## Known Issues & Limitations

1. **File Upload**: File upload is a stub implementation (no actual file storage)
2. **Mentions**: @mention suggestions are rendered but not fully implemented
3. **Conditional Questions**: Framework is in place but not fully utilized
4. **Real-time Sync**: No real-time synchronization between tabs
5. **Search Performance**: Large dataset searches may have slight delays
6. **Mobile Optimization**: Some features (like kanban board) may need adjustment on very small screens

## Technical Decisions

### Why MSW?
- Provides realistic API simulation with latency and error rates
- Allows testing error scenarios without a real backend
- Easy to extend with new endpoints
- Works in browser without additional server setup

### Why Dexie?
- Simple, promise-based IndexedDB wrapper
- Excellent querying and indexing
- Efficient data management
- Automatic schema management

### Why React Query?
- Powerful data fetching and caching
- Automatic background refetching
- Built-in error handling and retry logic
- Excellent developer experience

### State Management
- React Query for server state (API data)
- React hooks for local UI state
- No need for Redux/Zustand for this scope

### Pure JavaScript (No TypeScript)
- Simpler setup and faster development
- Reduced build complexity
- JSDoc for optional type hints
- Easier for rapid prototyping

## Performance Optimizations

1. **Pagination**: Limits data fetched per request
2. **Virtualization Ready**: Structure supports virtual scrolling for large lists
3. **Query Caching**: React Query caches data to reduce API calls
4. **Optimistic Updates**: UI updates before server confirmation
5. **Lazy Loading**: Components load on demand

## Accessibility

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast compliance
- Form labels and error messages

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with IndexedDB support

## Future Enhancements

1. **Real Backend Integration**: Replace MSW with actual API
2. **Authentication**: Add user authentication and authorization
3. **Advanced Filtering**: More sophisticated search and filter options
4. **Bulk Operations**: Bulk candidate updates and job management
5. **Analytics**: Hiring funnel analytics and reporting
6. **Export**: Export candidates and assessments to CSV/PDF
7. **Notifications**: Real-time notifications for status changes
8. **Integrations**: Slack, email, calendar integrations
9. **Mobile App**: React Native version
10. **Accessibility**: Enhanced accessibility features

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel automatically detects Vite configuration
4. Deploy with one click

\`\`\`bash
npm run build
# Vercel automatically runs this and deploys the dist/ folder
\`\`\`

### Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ using React, JavaScript, and Vite**
