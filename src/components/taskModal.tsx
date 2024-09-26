import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Timesheet, User } from '../global/types';
import { OdooAPI } from '../api/odoo';
import { formatFloatTime } from '../utils/format';
import { useMainStore } from '../store/main';

const TimesheetStat = ({ info }: {
    info: {
        user: User,
        totalHours: number,
        totalBillable: number
    }
}) => {
    return (
        <div className="flex flex-row gap-2 cursor-default my-1">
            <img src={info.user.avatarUrl} alt={info.user.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="text-gray-700 flex-grow truncate text-ellipsis">{info.user.name}</span>
            {info.totalBillable !== info.totalHours && <span className="text-gray-300 hover:text-gray-500 transition-colors">
                ({formatFloatTime(info.totalBillable)})
            </span>}
            <span className="text-gray-500">
                {formatFloatTime(info.totalHours)}
            </span>
        </div>
    )
}

const TaskModal = ({ task, onClose }: { task: Task, onClose: () => void }) => {
    const [todayDuration, setTodayDuration] = useState(0)
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [isHovered, setIsHovered] = useState(false)

    const { startTimer, stopTimer, currentTimer, durationPerTask, userInfo, fetchTimesheets } = useMainStore()

    useEffect(() => {
        fetchTimesheets(task.id).then(setTimesheets)
    }, [fetchTimesheets, task.id])

    function aggregateTimesheets(timesheets: Timesheet[]) {
        const result: {
            user: User,
            totalHours: number,
            totalBillable: number
        }[] = [];
        let currentUser: User | null = null;
        let currentTotalHours = 0;
        let currentTotalBillable = 0;

        timesheets.forEach((timesheet) => {
            if (currentUser && currentUser.id !== timesheet.user.id) {
                result.push({
                    user: currentUser,
                    totalHours: currentTotalHours,
                    totalBillable: currentTotalBillable
                });
                currentTotalHours = 0;
                currentTotalBillable = 0;
            }
            currentUser = timesheet.user;
            currentTotalHours += timesheet.unitAmount;
            currentTotalBillable += timesheet.billable ? timesheet.unitAmount : 0;
        });

        if (currentUser) {
            result.push({
                user: currentUser,
                totalHours: currentTotalHours,
                totalBillable: currentTotalBillable
            });
        }
        // reorder so current user is last, then preserve previous order
        return result.sort((a, b) => a.user.id === userInfo.id ? 1 : b.user.id === userInfo.id ? -1 : 0);
    }

    function openTask(task: Task) {
        const url = OdooAPI.baseUrl + `/odoo/all-tasks/${task.id}`;
        window.open(url, '_blank');
    }

    function openSubscription(task: Task) {
        const url = OdooAPI.baseUrl + `/odoo/subscriptions/${task.mntSubscriptionId?.id}`;
        window.open(url, '_blank');
    }

    function openPartner(task: Task) {
        const url = OdooAPI.baseUrl + `/odoo/contacts/${task.partnerId?.id}`;
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


    return (
        <AnimatePresence>
            <motion.div key="backdrop"onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-2"
            >
            </motion.div>
            <motion.div
                key={`task-modal-${task.id}`}
                className="bg-white shadow-md flex flex-col rounded p-2 mx-3 my-8 fixed inset-0 cursor-default"
            >
                <div className="flex flex-row gap-1 justify-between">
                    <div className="flex flex-col truncate flex-grow p-3">
                        <div className="flex flex-row gap-3 justify-between align-bottom text-xs text-gray-500">
                            <span className="truncate text-ellipsis w-1/2" title={task.projectId?.displayName}>{task.projectId?.displayName}</span>
                            <span className="truncate text-ellipsis w-1/2" title={task.stageId?.displayName}>▶ {task.stageId?.displayName}</span>
                        </div>
                        <button onClick={() => openTask(task)} className="text-lg hover:text-purple font-semibold mb-2 flex flex-row items-baseline gap-1 cursor-pointer text-left transition-colors text-ellipsis truncate">
                            <span className="text-ellipsis truncate" title={task.displayName}>
                                {task.displayName}
                            </span>
                            <span className="text-gray-500 text-sm font-normal"> #{task.id}</span>
                        </button>
                        <div className="flex flex-row gap-2 w-full">
                            <div className="flex flex-col truncate flex-grow">
                                <button onClick={() => openSubscription(task)} className="hover:text-purple font-semibold flex flex-row gap-1 cursor-pointer text-left transition-colors text-ellipsis truncate">
                                    <span className="text-ellipsis truncate" title={task.mntSubscriptionId?.displayName}>
                                        {task.mntSubscriptionId?.displayName}
                                    </span>
                                </button>
                                <button onClick={() => openPartner(task)} className="hover:text-purple font-semibold flex flex-row gap-1 cursor-pointer text-left transition-colors text-ellipsis truncate">
                                    <span className="text-ellipsis truncate" title={task.partnerId?.displayName}>
                                        {task.partnerId?.displayName}
                                    </span>
                                </button>
                            </div>
                            <div
                                className={"w-1/6 flex-shrink-0 flex items-center justify-center"}
                                onClick={toggleTimer}
                            >
                                <div
                                    className={`flex items-center justify-center ${getTimerColor()} cursor-pointer w-full text-xs text-white rounded-full aspect-square transition-shadow transition-colors ${getHoveredShadowColor()} hover:shadow-[0_0_8px_3px]`}
                                    onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                                >
                                    {isHovered ?
                                        isTimerRunning() ? "Pause" : "Start" :
                                        `+${todayDuration}min`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-grow p-2">
                    {(timesheets.length > 0 || todayDuration > 0) ? (
                        <div className="flex flex-col my-1 self-end w-full">
                            {aggregateTimesheets(timesheets).map((info, index) => (
                                <TimesheetStat key={index} info={info} />
                            ))}
                            {todayDuration > 0 &&
                                <div className="font-bold text-right text-green">
                                    + {todayDuration} min
                                </div>}
                        </div>
                    ) : (
                        <span className="text-gray-300">No timesheets found.</span>
                    )}
                    <div className="small w-1/2 self-end flex-col gap-2 my-2 mt-3 text-gray-400">
                        <div className="flex flex-row gap-2 text-bolder justify-between">
                            <span className="flex-grow">Allocated</span>
                            <span>{formatFloatTime(task.allocatedHours)}</span>
                        </div>
                        <div className="flex flex-row gap-2 text-bolder justify-between">
                            <span className="flex-grow">Spent</span>
                            <span>{formatFloatTime(task.effectiveHours)}</span>
                        </div>
                        <div className="flex flex-row gap-2 text-bolder justify-between">
                            <span className="flex-grow">Remaining</span>
                            <span>{formatFloatTime(task.remainingHours)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onClose}
                        className="self-end px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TaskModal