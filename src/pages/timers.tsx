import { useEffect, useState } from "react"
import { useMainStore } from "../store/main"
import Lottie from "lottie-react";
import empty from "../assets/animations/empty.json";
import { FavoriteCard } from "../components/favoriteCard";
import { AnimatePresence } from "framer-motion";
import { formatDuration } from "../utils/format";
import { findRunningTimer, roundDuration } from "../utils/utils";
import { TimerCard } from "../components/timerCard";
import { motion } from "framer-motion";

export const Timers = () => {
    const { timers, fetchTasks, favorites } = useMainStore()
    const [editionMode, setEditionMode] = useState(false)

    const currentTimer = findRunningTimer(timers)

    const totalTime = () => {
        let total = 0;
        timers.map((timer) => {
            total += roundDuration(timer.previousDuration, 15)
        })
        return total
    }

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])


    return (
        <div>
            <AnimatePresence>
                {timers.length > 0 && (
                    <motion.div
                        className="cursor-default flex flex-row justify-between items-baseline mb-3"
                        key="total-time"
                        initial={{ height: 0, opacity:0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-green-200">Hours today</span>
                        <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-green-200">{formatDuration(totalTime())}</span>
                    </motion.div>
                )}
                {timers.length === 0 && (
                    <motion.div
                        className="flex flex-col items-center justify-center opacity-50 cursor-default"
                        key="empty-timers"
                        initial={{ height: 0, opacity:0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Lottie animationData={empty} loop={true} className="w-1/2 my-4" />
                        <p className="text-gray-500">No running timers</p>
                        <p className="text-gray-500 self-start mt-3">Go to the tasks page to start a timer, or pick a favorite below.</p>
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
        </div>
    )
}