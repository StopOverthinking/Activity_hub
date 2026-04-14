import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { useViewportGuards } from './activity-kit/useViewportGuards'

function App() {
  useViewportGuards()

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}

export default App
