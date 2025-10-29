import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

async function enableMocking() {
  const useMsw = (import.meta && import.meta.env && import.meta.env.VITE_ENABLE_MSW) !== 'false'
  if (!useMsw) {
    return
  }
 
  const { worker } = await import('./mocks/browser')
  const result = await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
  
  // Seed the database
  try {
    const { seedDatabase } = await import('./mocks/seed.ts')
    await seedDatabase()
  } catch (error) {
    console.error('Error seeding database:', error)
  }
  
  return result
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}).catch((error) => {
  console.error('Error starting app:', error)
  document.getElementById("root").innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
      <h2>Application Startup Error</h2>
      <p><strong>Error:</strong> ${error.message}</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
    </div>
  `
})
