import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupNotification from './components/SetupNotification';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/noti/set" element={<SetupNotification />} />
        
      </Routes>
    </Router>
  )
}

export default App
