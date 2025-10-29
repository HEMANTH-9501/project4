import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import Layout from './components/Layout'
import JobsPage from './pages/JobsPage'
import CandidatesPage from './pages/CandidatesPage'
import AssessmentsPage from './pages/AssessmentsPage'
import JobDetailPage from './pages/JobDetailPage'
import CandidateDetailPage from './pages/CandidateDetailPage'
import ErrorBoundary from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <Router>
            <div className="app">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<JobsPage />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="jobs/:id" element={<JobDetailPage />} />
                  <Route path="candidates" element={<CandidatesPage />} />
                  <Route path="candidates/:id" element={<CandidateDetailPage />} />
                  <Route path="assessments" element={<AssessmentsPage />} />
                  <Route path="assessments/:jobId" element={<AssessmentsPage />} />
                </Route>
              </Routes>
              <ToastContainer />
            </div>
          </Router>
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
