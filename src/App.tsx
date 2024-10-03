import React, { useEffect, useState, useRef } from 'react'
import { useMainStore } from './store/main'
import './index.css'
import { Tasks } from './pages/tasks'
import { Timers } from './pages/timers'
import Layout from './components/layout'
import { Timer } from './global/types'
import odooApi from './api/odoo'
import { motion, AnimatePresence } from 'framer-motion'


function App() {
    const { currentView } = useMainStore()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [shouldCheckAuth, setShouldCheckAuth] = useState(true)
    const [showLoginInfo, setShowLoginInfo] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const initializeStore = async () => {
            // Check authentication status
            let userInfo
            let isUserAuthenticated
            try {
                userInfo = await odooApi.getUserInfo()
                odooApi.uid = userInfo.id
                isUserAuthenticated = true
            } catch (error) {
                isUserAuthenticated = false
                userInfo = {
                    id: 0,
                    name: '',
                    username: '',
                    avatarUrl: '',
                }
                return
            }

            let restoredState = {
                userInfo: userInfo
            }
            // Load persisted state from localStorage
            const persistedState = localStorage.getItem(`mainStore-${userInfo.id}`)
            if (persistedState) {
                const parsedState = JSON.parse(persistedState)
                restoredState = {
                    ...restoredState,
                    ...parsedState,
                    timers: parsedState.timers.map((timer: Timer) => ({
                        ...timer,
                        start: timer.start ? new Date(timer.start) : null
                    }))
                }
                useMainStore.setState(restoredState)
            }
            // Subscribe to store changes and persist to localStorage
            const unsubscribe = useMainStore.subscribe((state) => {
                const stateToPersist = {
                    favorites: state.favorites,
                    tasks: state.tasks,
                    currentView: state.currentView,
                    timers: state.timers.map(timer => ({
                        ...timer,
                        start: timer.start ? timer.start.toISOString() : null
                    })),
                }
                localStorage.setItem(`mainStore-${userInfo.id}`, JSON.stringify(stateToPersist))
            })
            setIsAuthenticated(true)

            // Cleanup subscription on unmount
            return () => unsubscribe()
        }
        if (shouldCheckAuth) {
            setShouldCheckAuth(false)
            initializeStore()
        }
    }, [shouldCheckAuth])

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0
        }
    }, [currentView])

    useEffect(() => {
        // show buttons after 3 seconds, time to check if the user is authenticated
        setTimeout(() => {
            setShowLoginInfo(true)
        }, 3000)
    }, [])

    return (
        <Layout showHeader={isAuthenticated}>
            {isAuthenticated ? (
                <div className="flex flex-col h-full">
                    <div ref={contentRef} className="flex-grow p-4 overflow-y-auto">
                        {currentView === 'tasks' && <Tasks />}
                        {currentView === 'timers' && <Timers />}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="mb-5 flex flex-col items-center">
                        <span className="font-caveat font-bold text-green text-3xl">Dope</span>
                        <span className="text-3xl text-purple">Timesheets</span>
                    </div>
                    <AnimatePresence>
                        {showLoginInfo && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="mt-4"
                            >
                                <div>
                                    <p>Dear <span className="text-red font-semibold">False</span>,</p>
                                    <p>Please log in to Odoo to use this extension.</p>
                                </div>
                                <div className="flex flex-row gap-2 mt-4">
                                    <a
                                        className="bg-purple text-white text-center rounded p-1 flex-grow"
                                        href="https://www.test.odoo.com/web/login"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Log in
                                    </a>
                                    <button
                                        className="bg-green text-white text-center rounded p-1 flex-grow"
                                        onClick={() => setShouldCheckAuth(true)}
                                    >
                                        Check again
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </Layout>
    )
}

export default App