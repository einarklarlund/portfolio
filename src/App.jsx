import { DitherProvider } from './components/DitherContext'
import AppInner from './AppInner'

export default function App() {
  return (
    <DitherProvider>
      <AppInner />
    </DitherProvider>
  )
}
