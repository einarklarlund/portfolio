import { createContext, useContext, useState } from 'react'

const DitherContext = createContext()

export function DitherProvider({ children }) {
  const [config, setConfig] = useState({
    waveColor: [0.5, 0.5, 0.5],
    backgroundColor: [0, 0, 0],
    sdfs: [],
  })
  return (
    <DitherContext.Provider value={{ config, setDitherConfig: setConfig }}>
      {children}
    </DitherContext.Provider>
  )
}

export function useDitherContext() {
  return useContext(DitherContext)
}
