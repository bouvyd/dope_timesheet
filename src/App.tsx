import { useEffect } from 'react'
import { useMainStore } from './store/main'
import './index.css'
import { Today } from './pages/today'
import Layout from './components/layout'
import UserMenu from './components/userMenu'

function App() {
    const { isAuthenticated, currentView, checkAndSetAuth } = useMainStore()

    useEffect(() => {
        checkAndSetAuth()
    }, [checkAndSetAuth])

    return (
        <Layout>
            {isAuthenticated ? (
                <div className="flex flex-col h-full">
                    <UserMenu />
                    <div className="flex-grow p-4 overflow-y-auto">
                        {currentView === 'today' && <Today />}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="mb-5 flex flex-col items-center">
                        <span className="font-caveat font-bold text-green text-3xl">Dope</span>
                        <span className="text-3xl text-purple">Timesheets</span>
                    </div>
                    <div>
                        <p>Dear <span className="text-red font-semibold">user</span>,</p>
                        <p>Please log in to Odoo to use this extension.</p>
                    </div>
                    <a className="bg-purple text-white px-2 py-1 rounded-sm mt-4" href="https://www.odoo.com/web/login" target="_blank" rel="noopener noreferrer">Log in</a>
                    <button className="bg-green text-white px-2 py-1 rounded-sm mt-2" onClick={checkAndSetAuth}>Check again</button>
                </div>
            )}
        </Layout>
    )
}

export default App