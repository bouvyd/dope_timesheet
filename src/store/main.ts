import { create } from 'zustand'
import odooApi from '../api/odoo'
import { Task, User } from '../global/types'



interface MainState {
  isAuthenticated: boolean
  currentView: 'today' | 'inTheZone' | 'report'
  tasks: Task[]
  userInfo: User
  setIsAuthenticated: (value: boolean) => void
  setCurrentView: (view: 'today' | 'inTheZone' | 'report') => void
  addTask: (task: Task) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  removeTask: (id: number) => void
  fetchTasks: () => Promise<void>
  checkAndSetAuth: () => Promise<void>
  setUserInfo: (userInfo: User) => void
}

export const useMainStore = create<MainState>()(
    (set) => ({
      isAuthenticated: false,
      currentView: 'today',
      tasks: [],
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
      checkAndSetAuth: async () => {
        try {
            const userInfo = await odooApi.getUserInfo()
            odooApi.uid = userInfo.id
            set({ isAuthenticated: true, userInfo })
        } catch (error) {
            console.warn(error)
            set({ isAuthenticated: false, userInfo: {
                id: '',
                name: '',
                username: '',
                avatarUrl: '',
            } })
        }
      },
      setUserInfo: (userInfo) => set({ userInfo }),
    }
  )
)