import PortfolioSummary from './components/PortfolioSummary'
import './App.css'

function App() {
 
  return (
    <div className="App">
      <header className="app-header">
        <h1>Portfolio Dashboard</h1>
        <p>Track your investments</p>
      </header>
      <main>
        <PortfolioSummary />
      </main>
    </div>

  )
}

export default App
