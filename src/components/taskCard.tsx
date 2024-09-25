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
            <img src={info.user.avatarUrl} alt={info.user.name} className="w-5 h-5 rounded-full" />
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
        <>
            <motion.div
                layoutId={`task-${task.id}`}
                layout="position"
                onClick={toggleModal}
                className="bg-white shadow-md flex flex-col gap-1 rounded p-2 cursor-pointer hover:shadow-lg transition-shadow"
            >
                <motion.div className="font-semibold text-ellipsis truncate" layout>{task.displayName}</motion.div>
                <motion.div className="flex flex-row gap-3 justify-between align-bottom text-xs text-gray-500" layout>
                    <span className="truncate text-ellipsis">{task.projectId?.displayName}</span>
                    <span className="truncate text-ellipsis">{task.stageId?.displayName}</span>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div

                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleModal}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    >
                        <motion.div
                            layoutId={`task-${task.id}`}
                            className="absolute bg-white rounded shadow-lg p-2 w-11/12 h-5/6 m-2 bg-white overflow-y-auto flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="font-semibold cursor-default">{task.projectId?.displayName}</span>
                            <span className="cursor-default">▶ {task.stageId?.displayName}</span>
                            <button onClick={() => openTask(task)} className="text-lg hover:text-purple font-semibold mb-2 cursor-pointer text-left transition-colors">
                                <span className="text-ellipsis">
                                    {task.displayName}
                                    <span className="text-gray-500 text-sm font-normal"> #{task.id}</span>
                                </span>
                            </button>
                            <div className="mb-5 text-gray-400 text-xs flex flex-col gap-1 items-start truncate text-ellipsis">
                                {task.mntSubscriptionId &&
                                    <button onClick={() => openSubscription(task)} className="hover:text-purple truncate text-ellipsis transition-colors">
                                        {task.mntSubscriptionId.displayName}
                                    </button>
                                }
                                {task.partnerId &&
                                    <button onClick={() => openPartner(task)} className="hover:text-purple truncate text-ellipsis transition-colors">
                                        {task.partnerId.displayName}
                                    </button>
                                }
                            </div>
                            <div className="flex flex-col flex-grow">
                                {timesheets.length > 0 ? (
                                    <>
                                        {aggregateTimesheets(timesheets).map((info, index) => (
                                            <TimesheetStat key={index} info={info} />
                                        ))}
                                        {todayDuration > 0 &&
                                            <motion.div
                                                className="font-bold text-right text-green cursor-default"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >+ {todayDuration} min</motion.div>}
                                    </>
                                ) : (
                                    <span className="text-gray-300">No timesheets found.</span>
                                )}
                                <div className="small w-1/2 self-end flex-col gap-2 mt-2 text-gray-400 cursor-default">
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

                            <div className="w-full flex flex-row gap-2">
                                {currentTimer && currentTimer.taskId === task.id ?
                                    <button
                                        onClick={() => stopTimer(task.id)}
                                        className="py-2 bg-yellow text-white flex-grow rounded"
                                    >
                                        Pause
                                    </button> : <button
                                        onClick={() => startTimer(task.id)}
                                        className="py-2 bg-green text-white flex-grow rounded"
                                    >
                                        Start
                                    </button>
                                }
                                <button
                                    onClick={toggleModal}
                                    className="py-2 flex-grow"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default TaskCard