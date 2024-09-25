import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Timesheet, User } from '../global/types';
import odooApi, { OdooAPI } from '../api/odoo';
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
            <img src={info.user.avatarUrl} alt={info.user.name} className="w-4 h-4 rounded-full" />
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

const TaskCard = ({ task }: { task: Task }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [todayDuration, setTodayDuration] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const { startTimer, stopTimer, currentTimer, durationPerTask, userInfo } = useMainStore()

    useEffect(() => {
        if (isOpen) {
            odooApi.getTaskTimesheet(task.id).then((timesheets) => {
                setTimesheets(timesheets);
            });
        }
    }, [task, isOpen]);

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

    const toggleModal = () => setIsOpen(!isOpen);

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <motion.div
                layoutId={`task-${task.id}`}
                className="bg-white shadow-md flex flex-col rounded cursor-pointer hover:shadow-lg transition-shadow"
            >
                <div className="flex flex-row gap-1 justify-between">
                    <div className="flex flex-col truncate flex-grow p-2" onClick={toggleModal}>
                        <button onClick={() => openTask(task)} className="hover:text-purple font-semibold mb-2 flex flex-row gap-1 cursor-pointer text-left transition-colors text-ellipsis truncate">
                            <span className="text-ellipsis truncate">
                                {task.displayName}
                            </span>
                            <span className="text-gray-500 text-sm font-normal"> #{task.id}</span>
                        </button>
                        <div className="flex flex-row gap-3 justify-between align-bottom text-xs text-gray-500">
                            <span className="truncate text-ellipsis">{task.projectId?.displayName}</span>
                            <span className="truncate text-ellipsis">{task.stageId?.displayName}</span>
                        </div>
                    </div>
                    <AnimatePresence>
                        {(todayDuration > 0 || isHovered) && <motion.div
                            className={`text-xs text-white ${getTimerColor()} ${isOpen ? 'rounded-full' : 'rounded-r'} aspect-square flex-shrink-0 flex items-center justify-center transition-shadow transition-colors ${getHoveredShadowColor()} hover:shadow-[0_0_8px_3px]`}
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
                <AnimatePresence>
                    {isOpen && (
                        <motion.div className="flex flex-col flex-grow p-2"
                            initial={{
                                height: 0,
                                opacity: 0,
                            }}
                            animate={{
                                height: 'auto',
                                opacity: 1,
                                transition: {
                                    height: {
                                        duration: 0.4,
                                    },
                                    opacity: {
                                        duration: 0.4,
                                    },
                                },
                            }}
                            exit={{
                                height: 0,
                                opacity: 0,
                                transition: {
                                    height: {
                                        duration: 0.4,
                                    },
                                    opacity: {
                                        duration: 0.4,
                                    },
                                },
                            }}>
                            <div className="flex flex-row gap-8">
                                {(timesheets.length > 0 || todayDuration > 0) ? (
                                    <div className="flex flex-col my-1 self-end">
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
                                <div className="small w-1/2 self-end flex-col gap-2 my-2 text-gray-400">
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default TaskCard