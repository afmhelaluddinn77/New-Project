import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CommonPortalPage from './components/CommonPortalPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CommonPortalPage />} />
      </Routes>
    </Router>
  )
}

export default App

