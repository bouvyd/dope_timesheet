import { create } from 'zustand'
import odooApi from '../api/odoo'
import { Task, User, Timer, Timesheet, Favorite } from '../global/types'
import { findRunningTimer, findResourceTimer, roundDuration } from '../utils/utils'



interface MainState {
    currentView: 'tasks' | 'timers'
    tasks: Task[]
    favorites: Favorite[]
    timers: Timer[]
    userInfo: User
    setCurrentView: (view: 'tasks' | 'timers') => void
    addTask: (task: Task) => void
    updateTask: (id: number, updates: Partial<Task>) => void
    removeTask: (id: number) => void
    fetchTasks: () => Promise<void>
    startTimer: (resourceId: number, resourceType: 'task' | 'project', resourceName: string, duration: number) => void
    stopTimer: (resourceId: number, resourceType: 'task' | 'project') => void
    deleteTimer: (resourceId: number, resourceType: 'task' | 'project') => void
    submitTimers: () => Promise<void>
    setTimerDescription: (resourceId: number, resourceType: 'task' | 'project', description: string) => void
    addDuration: (resourceId: number, resourceType: 'task' | 'project', duration: number) => void
    setDuration: (resourceId: number, resourceType: 'task' | 'project', duration: number) => void
    fetchTimesheets: (taskId: number) => Promise<Timesheet[]>
    addFavorite: (favorite: Favorite) => void
    removeFavorite: (favorite: Favorite) => void
    setFavoriteName: (favorite: Favorite, name: string) => void
}

export const useMainStore = create<MainState>()(
    (set, get) => ({
        isAuthenticated: false,
        currentView: 'timers',
        tasks: [],
        favorites: [
            {
                id: 12331,
                name: '(BS) COACHING',
                type: 'project',
            },
            {
                id: 12332,
                name: '(BS) IMPROVEMENTS',
                type: 'project',
            },
            {
                id: 12330,
                name: '(BS) KNOWLEDGE',
                type: 'project',
            },
            {
                id: 12329,
                name: '(BS) LEARNING & DEVELOPMENT',
                type: 'project',
            },
            {
                id: 12336,
                name: '(BS) MEETING',
                type: 'project',
            },
            {
                id: 12337,
                name: '(BS) MISC',
                type: 'project',
            },
            {
                id: 12355,
                name: '(BS) RECRUITMENT',
                type: 'project',
            },
            {
                id: 12335,
                name: '(BS) SELF-TRAINING',
                type: 'project',
            },
        ],
        timers: [],
        userInfo: {
            id: 0,
            name: '',
            username: '',
            avatarUrl: '',
        },
        setCurrentView: (view) => set({ currentView: view }),
        addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
        updateTask: (id, updates) =>
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? { ...task, ...updates } : task
                ),
            })),
        removeTask: (id) =>
            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== id),
            })),
        fetchTasks: async () => {
            try {
                const tasks = await odooApi.getTasks()
                set({ tasks })
            } catch (error) {
                console.warn(error)
            }
        },
        startTimer: (resourceId, resourceType, resourceName, duration = 0) => set((state) => {
            const prevTimer = findResourceTimer(state.timers, resourceId, resourceType)
            let newTimer
            let newTimers = state.timers
            if (prevTimer) {
                newTimer = {    
                    ...prevTimer,
                    start: new Date(),
                    previousDuration: prevTimer.previousDuration + duration,
                }
                // pop
                newTimers = state.timers.filter((timer) => timer.resourceId !== resourceId || timer.resourceType !== resourceType)
            } else {
                newTimer = {
                    resourceId,
                    resourceType,
                    resourceName,
                    start: new Date(),
                    previousDuration: duration,
                    description: '',
                } as Timer
            }
            const currentTimer = findRunningTimer(state.timers)
            if (currentTimer && currentTimer.resourceId === resourceId && currentTimer.resourceType === resourceType) {
                newTimer = {
                    ...currentTimer,
                    previousDuration: currentTimer.previousDuration + duration,
                }
            }
            if (currentTimer && currentTimer.start) {
                const end = new Date()
                // duration in minutes
                const  newDuration = (end.getTime() - currentTimer.start.getTime()) / 60000
                currentTimer.previousDuration += newDuration
                currentTimer.start = null
                // pop from list
            }
            return {
                timers: [newTimer, ...newTimers]
            }
        }),
        stopTimer: (resourceId, resourceType) => set((state) => {
            const currentTimer = findRunningTimer(state.timers)
            if (!currentTimer) {
                return {}
            }
            const end = new Date()
            // duration in minutes
            const duration = (end.getTime() - (currentTimer.start?.getTime() ?? end.getTime())) / 60000
            let isInList = false
            const newTimers = state.timers.map((timer) => {
                if (timer.resourceId === resourceId && timer.resourceType === resourceType) {
                    isInList = true
                    return {
                        resourceId,
                        resourceType,
                        resourceName: currentTimer?.resourceName ?? '',
                        previousDuration: timer.previousDuration + duration,
                        start: null,
                        description: ''
                    }
                }
                return timer
            })
            if (!isInList) {
                newTimers.push({ resourceId, resourceType, resourceName: currentTimer.resourceName, previousDuration: duration, start: null, description: '' })
            }
            return {
                currentTimer: null,
                timers: newTimers
            }
        }),
        deleteTimer: (resourceId, resourceType) => set((state) => {
            const newTimers = state.timers.filter((timer) => timer.resourceId !== resourceId || timer.resourceType !== resourceType)
            return {
                timers: newTimers
            }
        }),
        submitTimers: async () => {
            // stop the running timer and save the duration
            const currentTimer = findRunningTimer(get().timers)
            if (currentTimer && currentTimer.start) {
                const startTime = currentTimer.start.getTime()
                currentTimer.previousDuration += (new Date().getTime() - startTime) / 60000
                currentTimer.start = null
            }
            // round all timers to the upper 15min
            const roundedTimers = get().timers.map((timer) => {
                return {
                    ...timer,
                    previousDuration: roundDuration(timer.previousDuration, 15)
                }
            })
            // submit to odoo
            const failedTimers = await odooApi.submitTimers(roundedTimers)
            return set({
                timers: failedTimers
            })
        },
        setTimerDescription: (resourceId, resourceType, description) => set((state) => {
            const newTimers = state.timers.map((timer) => {
                if (timer.resourceId === resourceId && timer.resourceType === resourceType) {
                    return {
                        ...timer,
                        description
                    }
                }
                return timer
            })
            return {
                timers: newTimers
            }
        }),
        addDuration: (resourceId, resourceType, duration) => set((state) => {
            const newTimers = state.timers.map((timer) => {
                if (timer.resourceId === resourceId && timer.resourceType === resourceType) {
                    const currentDuration = timer.previousDuration;
                    const remainder = currentDuration % duration;
                    const newDuration = remainder === 0
                        ? currentDuration + duration
                        : roundDuration(currentDuration, duration);
                    return {
                        ...timer,
                        previousDuration: newDuration
                    };
                }
                return timer;
            });
            return {
                timers: newTimers
            };
        }),
        setDuration: (resourceId, resourceType, duration) => set((state) => {
            // set a specific duration for a timer
            // if the timer is running, we need to remove the current duration from the total duration
            const newTimers = state.timers.map((timer) => {
                if (timer.resourceId === resourceId && timer.resourceType === resourceType) {
                    if (timer.start) {
                        // reset the timer to now
                        timer.start = new Date()
                    }
                    return {
                        ...timer,
                        previousDuration: duration
                    };
                }
                return timer
            })
            return {
                timers: newTimers
            }
        }),
        fetchTimesheets: async (taskId) => {
            try {
                const timesheets = await odooApi.getTaskTimesheet(taskId)
                return timesheets
            } catch (error) {
                console.warn(error)
                return []
            }
        },
        addFavorite: (favorite) => set((state) => {
            // no dupe check
            const isDupe = state.favorites.some((f) => f.id === favorite.id && f.type === favorite.type)
            if (isDupe) {
                return {
                    favorites: state.favorites
                }
            }
            return {
                favorites: [...state.favorites, favorite]
            }
        }),
        removeFavorite: (favorite) => set((state) => ({ favorites: state.favorites.filter((f) => f.id !== favorite.id || f.type !== favorite.type) })),
        setFavoriteName: (favorite, name) => set((state) => ({ favorites: state.favorites.map((f) => f.id === favorite.id && f.type === favorite.type ? { ...f, name } : f) })),
    })
)