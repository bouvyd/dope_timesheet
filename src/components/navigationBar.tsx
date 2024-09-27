import React from 'react'
import { useMainStore } from '../store/main'

const NavigationBar = () => {
    const { currentView, setCurrentView } = useMainStore()

    return (
        <nav className="text-lg p-4 w-full h-8 flex items-center justify-center" id="navigation-bar">
            <div className="flex space-x-4 font-semibold">
                <button
                    className={`px-2 py-1 highlight-marker ${currentView === 'timers' ? 'active text-white' : ''} before:bg-purple`}
                    onClick={() => setCurrentView('timers')}
                >
                    Timers
                </button>
                <button
                    className={`px-2 py-1 highlight-marker ${currentView === 'tasks' ? 'active text-white' : ''} before:bg-purple`}
                    onClick={() => setCurrentView('tasks')}
                >
                    Tasks
                </button>

            </div>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="svg-filters" style={{display: 'none'}}>
                <defs>
                    <filter id="marker-shape">
                        <feTurbulence type="fractalNoise" baseFrequency="0 0.15" numOctaves="1" result="warp" />
                        <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30" in="SourceGraphic" in2="warp" />
                    </filter>
                </defs>
            </svg>
        </nav>
    )
}

export default NavigationBar