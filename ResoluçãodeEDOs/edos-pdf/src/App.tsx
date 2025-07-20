import './App.css'
import ODESystemSolver from './ODESystemSolver';
import './index.css';

function App() {

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Resolução de EDOs</h1>
      <ODESystemSolver />
    </div>
  )
}

export default App
