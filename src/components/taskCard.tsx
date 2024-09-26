import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../global/types';
import { OdooAPI } from '../api/odoo';
import { useMainStore } from '../store/main';
import TaskModal from './taskModal';


const TaskCard = ({ task }: { task: Task }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [todayDuration, setTodayDuration] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const { startTimer, stopTimer, currentTimer, durationPerTask, } = useMainStore()


    function openTask(task: Task) {
        const url = OdooAPI.baseUrl + `/odoo/all-tasks/${task.id}`;
        window.open(url, '_blank');
    }

    function toggleTimer() {
        if (isTimerRunning()) {
            stopTimer(task.id)
        } else {
            startTimer(task.id)
        }
    }

    function isTimerRunning() {
        return currentTimer && currentTimer.taskId === task.id
    }

    function getTimerColor() {
        if (isHovered) {
            return isTimerRunning() ? 'bg-yellow' : 'bg-green'
        }
        return isTimerRunning() ? 'bg-green' : 'bg-blue/50'
    }

    function getHoveredShadowColor() {
        return isTimerRunning() ? 'hover:shadow-yellow/40' : 'hover:shadow-green/40'
    }

    useEffect(() => {
        const updateDuration = () => {
            let duration = 0
            const taskDuration = durationPerTask.find((taskDuration) => taskDuration.taskId === task.id)
            if (taskDuration) {
                duration += taskDuration.duration
            }
            if (currentTimer && currentTimer.taskId === task.id) {
                duration += (new Date().getTime() - currentTimer.start.getTime()) / 60000
            }
            setTodayDuration(Math.ceil(duration))
        }

        updateDuration() // Initial call

        const intervalId = setInterval(updateDuration, 60000) // Run every 60 seconds

        return () => clearInterval(intervalId) // Cleanup on unmount
    }, [currentTimer, durationPerTask, task.id])

    const toggleModal = () => setIsOpen(!isOpen);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            className="bg-white shadow-md flex flex-col rounded cursor-pointer hover:shadow-lg transition-shadow"
        >
            <div className="flex flex-row gap-1 justify-between">
                <div className="flex flex-col truncate flex-grow p-2" onClick={toggleModal}>
                    <div className="font-semibold mb-2 flex flex-row gap-1 cursor-pointer text-left transition-colors text-ellipsis truncate">
                        <span className="text-ellipsis truncate" title={task.displayName}>
                            {task.displayName}
                        </span>
                        <span className="text-gray-500 text-sm font-normal"> #{task.id}</span>
                    </div>
                    <div className="flex flex-row gap-3 justify-between align-bottom text-xs text-gray-500">
                        <span className="truncate text-ellipsis" title={task.projectId?.displayName}>{task.projectId?.displayName}</span>
                        <span className="truncate text-ellipsis" title={task.stageId?.displayName}>▶ {task.stageId?.displayName}</span>
                    </div>
                </div>
                <AnimatePresence>
                    {(todayDuration > 0 || isHovered) && <motion.div
                        className={`text-xs text-white ${getTimerColor()} rounded-r aspect-square flex-shrink-0 flex items-center justify-center transition-shadow transition-colors ${getHoveredShadowColor()} hover:shadow-[0_0_8px_3px]`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '60px' }}
                        exit={{ opacity: 0, width: 0 }}
                        onClick={toggleTimer}
                    >
                        {isHovered ?
                            isTimerRunning() ? "Pause" : "Start" :
                            `+${todayDuration}min`
                        }
                    </motion.div>}
                </AnimatePresence>
            </div>
            {isOpen && <TaskModal task={task} onClose={toggleModal} />}
        </div>
    );
};

export default TaskCard