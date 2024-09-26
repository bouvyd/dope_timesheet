import { useEffect } from "react"
import { useMainStore } from "../store/main"
import { formatFloatTime } from "../utils/format"

export const Timers = () => {
    const { durationPerTask, tasks, fetchTasks, addDuration, roundDuration, currentTimer } = useMainStore()

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const runningTasks = tasks?.filter(task => durationPerTask.some(duration => duration.taskId === task.id && duration.duration > 0))
    const getTaskDuration = (taskId: number) => {
        const duration = durationPerTask.find(duration => duration.taskId === taskId)
        return Math.ceil(duration?.duration || 0)
    }

    return (
        <div className="p-4">
            {currentTimer && (
                <div className="mb-4 p-4 bg-green-100 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Current Timer</h2>
                    <p>{tasks?.find(task => task.id === currentTimer.taskId)?.displayName}</p>
                    <p>Started: {currentTimer.start.toLocaleTimeString()}</p>
                </div>
            )}
            <h2 className="text-xl font-semibold mb-4">Running Tasks</h2>
            <ul className="space-y-2">
                {runningTasks?.map(task => (
                    <li key={task.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="p-3 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{task.displayName}</h3>
                                <span className="text-sm text-gray-600">{formatFloatTime(getTaskDuration(task.id) / 60)}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => addDuration(task.id, 15)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    +15m
                                </button>
                                <button 
                                    onClick={() => roundDuration(task.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                                >
                                    Round
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}