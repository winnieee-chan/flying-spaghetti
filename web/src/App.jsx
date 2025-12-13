import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupNotification from './components/SetupNotification';
import ViewNotification from './components/ViewNotification';
import GetNotification from './components/GetNotification';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/noti/set" element={<SetupNotification />} />
        <Route path="/noti/view" element={<ViewNotification />} />
        <Route path="/noti/get" element={<GetNotification />} />
      </Routes>
    </Router>
  )
}

export default App
