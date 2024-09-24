import { useMainStore } from '../store/main'

const NavigationBar = () => {
    const { currentView, setCurrentView } = useMainStore()

    return (
        <nav className="border-b border-purple p-4 w-full h-8 flex items-center justify-center shadow-sm" id="navigation-bar">
            <div className="flex space-x-4 font-semibold">
                <button
                    className={`px-2 py-1 ${currentView === 'today' ? 'active text-white' : ''}`}
                    onClick={() => setCurrentView('today')}
                >
                    Today
                </button>
                <button
                    className={`px-2 py-1 ${currentView === 'inTheZone' ? 'active text-white' : ''}`}
                    onClick={() => setCurrentView('inTheZone')}
                >
                    In the Zone
                </button>
                <button
                    className={`px-2 py-1 ${currentView === 'report' ? 'active text-white' : ''}`}
                    onClick={() => setCurrentView('report')}
                >
                    Report
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