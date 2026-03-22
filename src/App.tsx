/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { StudyBuddy } from './pages/StudyBuddy';
import { Summarizer } from './pages/Summarizer';
import { Quizverse } from './pages/Quizverse';
import { Planner } from './pages/Planner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/study-buddy" element={<StudyBuddy />} />
              <Route path="/summarizer" element={<Summarizer />} />
              <Route path="/quiz" element={<Quizverse />} />
              <Route path="/planner" element={<Planner />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
