import { create } from 'zustand'
import odooApi from '../api/odoo'
import { Task, User, Timer } from '../global/types'



interface MainState {
    isAuthenticated: boolean
    currentView: 'today' | 'inTheZone' | 'report'
    tasks: Task[]
    durationPerTask: { taskId: number, duration: number }[]
    currentTimer: Timer | null
    userInfo: User
    setIsAuthenticated: (value: boolean) => void
    setCurrentView: (view: 'today' | 'inTheZone' | 'report') => void
    addTask: (task: Task) => void
    updateTask: (id: number, updates: Partial<Task>) => void
    removeTask: (id: number) => void
    fetchTasks: () => Promise<void>
    startTimer: (taskId: number) => void
    stopTimer: (taskId: number) => void
    checkAndSetAuth: () => Promise<void>
    setUserInfo: (userInfo: User) => void
}

export const useMainStore = create<MainState>()(
    (set) => ({
        isAuthenticated: false,
        currentView: 'today',
        tasks: [],
        currentTimer: null,
        durationPerTask: [],
        userInfo: {
            id: '',
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
        startTimer: (taskId) => set((state) => {
            const newTimer = {
                taskId,
                start: new Date(),
            }
            if (state.currentTimer) {
                console.log('stopping existing timer', state.currentTimer, taskId)
                const end = new Date()
                // duration in minutes
                let duration = (end.getTime() - state.currentTimer.start.getTime()) / 60000
                // add value for current taskId in list
                state.durationPerTask.forEach((taskDuration) => {
                    if (taskDuration.taskId === taskId) {
                        duration += taskDuration.duration
                    }
                })
                // pop from list
                const newDurationPerTask = state.durationPerTask.filter((taskDuration) => taskDuration.taskId !== taskId)
                return {
                    currentTimer: newTimer,
                    durationPerTask: [...newDurationPerTask, { taskId, duration }]
                }
            }
            return {
                currentTimer: newTimer,
            }
        }),
        stopTimer: (taskId) => set((state) => {
            if (state.currentTimer) {
                console.log('stopping timer', state.currentTimer, taskId)
                const end = new Date()
                // duration in minutes
                const duration = (end.getTime() - state.currentTimer.start.getTime()) / 60000
                let isInList = false
                const newDurationPerTask = state.durationPerTask.map((taskDuration) => {
                    if (taskDuration.taskId === taskId) {
                        isInList = true
                        return {
                            taskId,
                            duration: taskDuration.duration + duration
                        }
                    }
                    return taskDuration
                })
                if (!isInList) {
                    newDurationPerTask.push({ taskId, duration })
                }
                return {
                    currentTimer: null,
                    durationPerTask: newDurationPerTask
                }
            }
            return {}
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
                        id: '',
                        name: '',
                        username: '',
                        avatarUrl: '',
                    }
                })
            }
        },
        setUserInfo: (userInfo) => set({ userInfo }),
    }
    )
)