import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupNotification from './components/SetupNotification';
import ViewNotification from './components/ViewNotification';
import Dashboard from './components/Dashboard';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/noti/set" element={<SetupNotification />} />
        <Route path="/noti/view" element={<ViewNotification />} />
      </Routes>
    </Router>
  )
}

export default App

