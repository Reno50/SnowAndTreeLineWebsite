import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"
const geoUrlTwo = "/assets/world_atlas.json"

function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <ComposableMap
        projectionConfig={{
          scale: 200, // higher = zoom in
          center: [0, 0] // [longitude, latitude]
        }}
        width={1200}
        height={600}
      >
        <Geographies geography="/world_atlas.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} />
            ))
          }
        </Geographies>
      </ComposableMap>
      </div>
  )
}

export default App
