import { useEffect, useState } from "react"
import TaskCard from "../components/taskCard"
import { useMainStore } from "../store/main"
import { Task, M2OTuple } from "../global/types"
import { AnimatePresence } from "framer-motion"


export const Today = () => {
    const { userInfo, tasks, fetchTasks } = useMainStore()
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("")

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }, [searchQuery])

    const filteredTasks = tasks?.filter((task) => {
        // search on task name and id
        return task.displayName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || task.id.toString().includes(debouncedSearchQuery)
    })

    const extractUserIds = (task: Task): number[] => {
        return task.userIds.map((user: M2OTuple) => user.id)
    }

    const assignedTasks = filteredTasks?.filter(task => extractUserIds(task).includes(userInfo?.id))
    const numAssignedTasks = assignedTasks?.length  
    const reviewedTasks = filteredTasks?.filter(task => task.reviewerId?.id === userInfo?.id)
    const numReviewedTasks = reviewedTasks?.length
    const ownedTasks = filteredTasks?.filter(task => task.xOwnerId?.id === userInfo?.id)
    const numOwnedTasks = ownedTasks?.length


    return (
        <div>
            <input
                type="text"
                placeholder="Search tasks"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value || "")}
                className="border border-purple-200 rounded w-full px-2 py-1 mb-3 focus:outline-none focus:ring focus:ring-purple-200 focus:shadow-inner"
            />
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <div className="cursor-default">
                        <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-yellow-200">As assignee</span>
                        {numAssignedTasks > 0 && <span className="pl-2 text-gray-400 text-lg">{numAssignedTasks}</span>}
                    </div>
                    <AnimatePresence>
                        {numAssignedTasks === 0 && <div key="assigned-empty" className="text-gray-400 cursor-default">No tasks found.</div>}
                        {assignedTasks?.map((task) => (<TaskCard key={`assigned-${task.id}`} task={task} />))}
                    </AnimatePresence>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="cursor-default">
                        <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-blue-200">As reviewer</span>
                        {numReviewedTasks > 0 && <span className="pl-2 text-gray-400 text-lg">{numReviewedTasks}</span>}
                    </div>
                    <AnimatePresence>
                        {numReviewedTasks === 0 && <div key="reviewed-empty" className="text-gray-400 cursor-default">No tasks found.</div>}
                        {reviewedTasks?.map((task) => (<TaskCard key={`reviewed-${task.id}`} task={task} />))}
                    </AnimatePresence>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="cursor-default">
                        <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-green-200">As task owner</span>
                        {numOwnedTasks > 0 && <span className="pl-2 text-gray-400 text-lg">{numOwnedTasks}</span>}
                    </div>
                    <AnimatePresence>
                        {numOwnedTasks === 0 && <div key="owned-empty" className="text-gray-400 cursor-default">No tasks found.</div>}
                        {ownedTasks?.map((task) => (<TaskCard key={`owned-${task.id}`} task={task} />))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}