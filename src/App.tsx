import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { useViewportGuards } from './activity-kit/useViewportGuards'

function App() {
  useViewportGuards()

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
