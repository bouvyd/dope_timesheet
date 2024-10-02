import { useEffect, useState } from "react"
import { useMainStore } from "../store/main"
import Lottie from "lottie-react";
import empty from "../assets/animations/empty.json";
import success from "../assets/animations/success.json";
import { FavoriteCard } from "../components/favoriteCard";
import { AnimatePresence } from "framer-motion";
import { formatDuration } from "../utils/format";
import { findRunningTimer, roundDuration } from "../utils/utils";
import { TimerCard } from "../components/timerCard";
import { motion } from "framer-motion";

export const Timers = () => {
    const { timers, fetchTasks, favorites, submitTimers } = useMainStore()
    const [editionMode, setEditionMode] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    const currentTimer = findRunningTimer(timers)

    const totalTime = () => {
        let total = 0;
        timers.map((timer) => {
            total += roundDuration(timer.previousDuration, 15)
        })
        return total
    }

    const submitAllTimers = () => {
        setIsSubmitting(true)
        submitTimers().then(() => {
            setIsSubmitting(false)
            setHasSubmitted(true)
        })
    }

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])


    return (
        <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="page-timers"
        >
            <AnimatePresence>
                {timers.length > 0 && (
                        <motion.div
                            className="cursor-default flex flex-row justify-between items-baseline mb-3"
                            key="total-time"
                            initial={ false }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-green-200">Current Timers</span>
                            <span className="text-2xl pt-2 leading-1 font-semibold">{formatDuration(totalTime())}</span>
                        </motion.div>
                )}
                {timers.length > 0 && (
                        <motion.div 
                            key="submit-timers"
                            initial={ false }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <button className="text-xs text-gray-500 hover:text-green-500 rounded w-full p-2" onClick={() => submitAllTimers()}>Submit Timers</button>
                        </motion.div>
                )}
                {timers.length === 0 && !hasSubmitted && (
                    <motion.div
                        className="flex flex-col items-center justify-center opacity-50 cursor-default"
                        key="empty-timers"
                        initial={ false }
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Lottie animationData={empty} loop={true} className="w-1/2 my-4" />
                        <p className="text-gray-500">No running timers</p>
                        <p className="text-gray-500 self-start mt-3">Go to the tasks page to start a timer, or pick a favorite below.</p>
                    </motion.div>
                )}
                {timers.length === 0 && hasSubmitted && (
                    <motion.div
                        className="flex flex-col items-center justify-center opacity-50 cursor-default"
                        key="submitted-timers"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Lottie animationData={success} loop={false} className="w-1/3 my-4" />
                        <p className="text-gray-500">All timers submitted!</p>
                        <p className="text-gray-500 self-start mt-3">Go to the tasks page to start a new timer, or pick a favorite below.</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div className="flex flex-col gap-2" layout>
                <AnimatePresence>
                    {timers.map(timer => (
                        <TimerCard
                            key={`timer${timer.resourceType}-${timer.resourceId}`}
                            timer={timer}
                            layout={true}
                            isCurrentTimer={currentTimer?.resourceId === timer.resourceId && currentTimer?.resourceType === timer.resourceType}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
            <div className="flex flex-col gap-2 mt-5">
                <div className="cursor-default flex flex-row justify-between items-baseline">
                    <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-yellow-200">Favorites</span>
                    <button className={`text-xs text-gray-500 hover:${editionMode ? "text-green-500" : "text-yellow-800"} rounded`} onClick={() => setEditionMode(!editionMode)}>{editionMode ? "✓ Done" : "Manage"}</button>
                </div>
                {favorites?.map(favorite => (
                    <FavoriteCard key={`${favorite.type}-${favorite.id}`} favorite={favorite} editionMode={editionMode} />
                ))}
            </div>
        </motion.div>
    )
}