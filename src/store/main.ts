import { create } from 'zustand'
import odooApi from '../api/odoo'
import { Task, User, Timer, Timesheet } from '../global/types'



interface MainState {
    isAuthenticated: boolean
    currentView: 'today' | 'timers' | 'report'
    tasks: Task[]
    durationPerTask: { taskId: number, duration: number }[]
    currentTimer: Timer | null
    userInfo: User
    setIsAuthenticated: (value: boolean) => void
    setCurrentView: (view: 'today' | 'timers' | 'report') => void
    addTask: (task: Task) => void
    updateTask: (id: number, updates: Partial<Task>) => void
    removeTask: (id: number) => void
    fetchTasks: () => Promise<void>
    startTimer: (taskId: number) => void
    stopTimer: (taskId: number) => void
    checkAndSetAuth: () => Promise<void>
    setUserInfo: (userInfo: User) => void
    addDuration: (taskId: number, duration: number) => void
    roundDuration: (taskId: number) => void
    fetchTimesheets: (taskId: number) => Promise<Timesheet[]>
}

export const useMainStore = create<MainState>()(
    (set) => ({
        isAuthenticated: false,
        currentView: 'today',
        tasks: [],
        currentTimer: null,
        durationPerTask: [],
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
                        id: 0,
                        name: '',
                        username: '',
                        avatarUrl: '',
                    }
                })
            }
        },
        setUserInfo: (userInfo) => set({ userInfo }),
        addDuration: (taskId, duration) => set((state) => ({
            durationPerTask: state.durationPerTask.map((taskDuration) => 
                taskDuration.taskId === taskId
                  ? { ...taskDuration, duration: taskDuration.duration + duration }
                  : taskDuration
            )
        })),
        roundDuration: (taskId) => set((state) => {
            const newDurationPerTask = state.durationPerTask.map((taskDuration) => {
                if (taskDuration.taskId === taskId) {
                    return {
                        taskId,
                        duration: Math.ceil(taskDuration.duration / 15) * 15
                    }
                }
                return taskDuration
            })
            return {
                durationPerTask: newDurationPerTask
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
        }
    })
)