import { useEffect } from "react"
import TaskCard from "../components/taskCard"
import { useMainStore } from "../store/main"

export const Today = () => {
    const { tasks, fetchTasks } = useMainStore()

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    return (
        <div>
            <button className="text-purple text-sm" onClick={fetchTasks}> (sync)</button>
            <div className="flex flex-col gap-2">
                {tasks?.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div>
        </div>
    )
}