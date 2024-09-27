import { create } from 'zustand'
import odooApi from '../api/odoo'
import { Task, User, Timer, Timesheet, Favorite } from '../global/types'
import { findRunningTimer, findResourceTimer, roundDuration } from '../utils/utils'



interface MainState {
    isAuthenticated: boolean
    currentView: 'tasks' | 'timers'
    tasks: Task[]
    favorites: Favorite[]
    timers: Timer[]
    userInfo: User
    setIsAuthenticated: (value: boolean) => void
    setCurrentView: (view: 'tasks' | 'timers') => void
    addTask: (task: Task) => void
    updateTask: (id: number, updates: Partial<Task>) => void
    removeTask: (id: number) => void
    fetchTasks: () => Promise<void>
    startTimer: (resourceId: number, resourceType: 'task' | 'project', resourceName: string, duration: number) => void
    stopTimer: (resourceId: number, resourceType: 'task' | 'project') => void
    setTimerDescription: (resourceId: number, resourceType: 'task' | 'project', description: string) => void
    checkAndSetAuth: () => Promise<void>
    setUserInfo: (userInfo: User) => void
    addDuration: (resourceId: number, resourceType: 'task' | 'project', duration: number) => void
    fetchTimesheets: (taskId: number) => Promise<Timesheet[]>
    addFavorite: (favorite: Favorite) => void
    removeFavorite: (id: number) => void
}

export const useMainStore = create<MainState>()(
    (set) => ({
        isAuthenticated: false,
        currentView: 'timers',
        tasks: [],
        favorites: [{
            name: 'Dope Timesheets',
            type: 'project',
            id: 1,
        }, {
            name: 'Dope Task',
            type: 'task',
            id: 2,
        }],
        timers: [],
        userInfo: {
            id: 0,
            name: '',
            username: '',
            avatarUrl: '',
        },
        setIsAuthenticated: (value) => set({ isAuthenticated: value }),
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
        checkAndSetAuth: async () => {
            try {
                const userInfo = await odooApi.getUserInfo()
                odooApi.uid = userInfo.id
                set({ isAuthenticated: true, userInfo })
            } catch (error) {
                console.warn(error)
                set({
                    isAuthenticated: false, userInfo: {
                        id: 0,
                        name: '',
                        username: '',
                        avatarUrl: '',
                    }
                })
            }
        },
        setUserInfo: (userInfo) => set({ userInfo }),
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
        fetchTimesheets: async (taskId) => {
            try {
                const timesheets = await odooApi.getTaskTimesheet(taskId)
                return timesheets
            } catch (error) {
                console.warn(error)
                return []
            }
        },
        addFavorite: (favorite) => set((state) => ({ favorites: [...state.favorites, favorite] })),
        removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((favorite) => favorite.id !== id) })),
    })
)
