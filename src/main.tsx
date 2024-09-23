import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div className="text-3xl flex flex-col items-center justify-center h-full w-full text-purple">
            <span className=" font-caveat font-bold text-green">Dope</span>
            <span>Timesheets</span>
        </div>
    </StrictMode>,
)
