import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupNotification from './components/SetupNotification';
import ViewNotification from './components/ViewNotification';
import GetNotification from './components/GetNotification';
import Dashboard from './components/Dashboard';
import CreateJob from './components/CreateJob';
import JobDetail from './components/JobDetail/JobDetail';
import LandingPage from './pages/LandingPage';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs/new" element={<CreateJob />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/noti/set" element={<SetupNotification />} />
        <Route path="/noti/view" element={<ViewNotification />} />
        <Route path="/noti/get" element={<GetNotification />} />
      </Routes>
    </Router>
  )
}

export default App

