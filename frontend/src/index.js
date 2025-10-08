import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './style/theme.css'
import './style/Test.css'
import Upbar from './component/Upbar'
import Home from './pages/Home'
import Pointage from './pages/Pointage'
import Planning from './pages/Planning'
import Calendrier from './pages/Calendrier'
import Profil from './pages/Profil'
import ParamTre from './pages/Parametre'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'pointage':
        return <Pointage />
      case 'planning':
        return <Planning />
      case 'calendrier':
        return <Calendrier />
      case 'profil':
        return <Profil />
      case 'parameter':
        return <ParamTre />
      default:
        return <Home />
    }
  }

  return (
    <div className="App">
      <Upbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
