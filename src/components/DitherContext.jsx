import { createContext, useContext, useRef, useCallback } from 'react'

const DitherContext = createContext()

export function DitherProvider({ children }) {
  const ditherStateRef = useRef({
    waveColor: [0.216, 0.208, 0.243],
    backgroundColor: [0, 0, 0],
    sdfs: {},
  })

  const registerSdf = useCallback((id, sdf) => {
    ditherStateRef.current.sdfs[id] = sdf
  }, [])

  const unregisterSdf = useCallback((id) => {
    delete ditherStateRef.current.sdfs[id]
  }, [])

  return (
    <DitherContext.Provider value={{ ditherStateRef, registerSdf, unregisterSdf }}>
      {children}
    </DitherContext.Provider>
  )
}

export function useDitherContext() {
  return useContext(DitherContext)
}
