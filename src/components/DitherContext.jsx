import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const DitherContext = createContext()

export function DitherProvider({ children }) {
  const [colorConfig, setColorConfig] = useState({
    waveColor: [0.216, 0.208, 0.243],
    backgroundColor: [0, 0, 0],
  })
  const [sdfMap, setSdfMap] = useState({})

  const registerSdf = useCallback((id, sdf) => {
    setSdfMap(prev => {
      const existing = prev[id]
      if (existing &&
        existing.x === sdf.x && existing.y === sdf.y &&
        existing.width === sdf.width && existing.height === sdf.height
      ) return prev
      return { ...prev, [id]: sdf }
    })
  }, [])

  const unregisterSdf = useCallback((id) => {
    setSdfMap(prev => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const config = useMemo(() => ({
    ...colorConfig,
    sdfs: Object.values(sdfMap),
  }), [colorConfig, sdfMap])

  return (
    <DitherContext.Provider value={{ config, setDitherConfig: setColorConfig, registerSdf, unregisterSdf }}>
      {children}
    </DitherContext.Provider>
  )
}

export function useDitherContext() {
  return useContext(DitherContext)
}
