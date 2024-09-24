import { useMainStore } from "../store/main"
import { useEffect } from "react"

export const Today = () => {
    const { tasks, fetchTasks } = useMainStore()

    console.log(tasks)

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    return (
        <div>
            <h1>Today<button className="text-purple text-sm" onClick={fetchTasks}> (sync)</button></h1>
            <ul>
                {tasks?.map((task) => (
                    <li key={task.id}>{task.displayName}</li>
                ))}
            </ul>
        </div>
    )
}