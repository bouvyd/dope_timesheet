import { useEffect, useState } from "react"
import { useMainStore } from "../store/main"
import Lottie from "lottie-react";
import blob from "../assets/animations/blob.json";
import success from "../assets/animations/success.json";
import { FavoriteCard } from "../components/favoriteCard";
import { AnimatePresence } from "framer-motion";
import { formatDuration } from "../utils/format";
import { findRunningTimer, roundDuration } from "../utils/utils";
import { TimerCard } from "../components/timerCard";
import { Favorite } from "../global/types";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheck, faCog } from "@fortawesome/free-solid-svg-icons";
import AddFavorite from "../components/addFavorite";
import QuickTimerEntry from "../components/quickTimerEntry";

export const Timers = () => {
    const { timers, fetchTasks, favorites, submitTimers } = useMainStore()
    const [editionMode, setEditionMode] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

    const currentTimer = findRunningTimer(timers)

    const matchesSearch = (favorite: Favorite) => {
        return favorite.name.toLowerCase().replace(/\s/g, '').includes(debouncedSearchQuery.toLowerCase().replace(/\s/g, ''));
    }
    const sortedFavorites = favorites.map(favorite => {
        return { ...favorite, matchesSearch: matchesSearch(favorite) };
    }).sort((a, b) => {
        if (a.matchesSearch === b.matchesSearch) return 0;
        return a.matchesSearch ? -1 : 1;
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const totalTime = () => {
        let total = 0;
        let roundedTotal = 0;
        timers.map((timer) => {
            total += timer.previousDuration
            roundedTotal += roundDuration(timer.previousDuration, 15)
        })
        return { total, roundedTotal }
    }

    const submitAllTimers = () => {
        setIsSubmitting(true)
        submitTimers().then(() => {
            setIsSubmitting(false)
            setHasSubmitted(timers.length === 0)
        })
    }

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="page-timers"
        >
            <div className="flex flex-row justify-between items-start">
                <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-green-200">Timers</span>
                <div className="flex flex-col items-end mt-3">
                    <QuickTimerEntry />
                    <span className="text-2xl leading-1 font-semibold">{formatDuration(totalTime().total)}</span>
                    <span className="leading-1 font-semibold text-gray-500" title="With all timers rouded">({formatDuration(totalTime().roundedTotal)})</span>
                </div>
            </div>
            <AnimatePresence>
                {timers.length > 0 && (
                    <motion.div
                        className="cursor-default flex flex-row justify-between items-baseline mb-3"
                        key="total-time"
                        initial={false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >

                    </motion.div>
                )}
                {timers.length === 0 && !hasSubmitted && (
                    <motion.div
                        className="flex flex-col items-center justify-center opacity-50 cursor-default"
                        key="empty-timers"
                        initial={false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Lottie animationData={blob} loop={true} className="w-1/2 my-4" />
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
                {timers.length > 0 && (
                    <motion.div
                        key="submit-timers"
                        initial={false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <button className="bg-green-500 hover:bg-green-700 text-white rounded w-full p-2 disabled:opacity-50 transition-opacity" onClick={() => submitAllTimers()} disabled={isSubmitting}>{isSubmitting && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}Submit Timers</button>
                    </motion.div>
                )}
            </motion.div>
            <motion.div
                className="flex flex-col gap-2 mt-5 overflow-x-clip"
                initial={false}
                animate={{ height: "auto" }}
            >
                <div className="cursor-default flex flex-row justify-between items-center">
                    <span className="text-2xl pt-2 leading-1 font-semibold highlight-marker active before:bg-yellow-200">Favorites</span>
                    <button className={`pt-2 text-xs text-gray-500 hover:${editionMode ? "text-green-500" : "text-yellow-800"} rounded`} onClick={() => setEditionMode(!editionMode)}>{editionMode ? <><FontAwesomeIcon className="mr-2" icon={faCheck} />Done</> : <><FontAwesomeIcon className="mr-2" icon={faCog} />Manage</>}</button>
                </div>
                <AnimatePresence>
                    {editionMode ?
                        (<AddFavorite key="add-favorite" />) :
                        (<motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <input
                                type="text"
                                placeholder="Search favorites"
                                value={searchQuery}
                                key="search-input"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-purple-200 rounded w-full px-2 py-1 focus:outline-none focus:ring focus:ring-purple-200 focus:shadow-inner"
                            />
                        </motion.div>)
                    }
                </AnimatePresence>
                <AnimatePresence>
                    {sortedFavorites.map(favorite => (
                        <FavoriteCard
                            key={`${favorite.type}-${favorite.id}`}
                            favorite={favorite}
                            editionMode={editionMode}
                            faded={!matchesSearch(favorite)}
                        />
                    ))}
                    {favorites.length === 0 && (
                        <motion.div
                            key="no-favorites"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <p className="text-gray-500">Add your favorite tasks or projects to easily start a timer.</p>
                        </motion.div>
                    )}
                    {favorites.length > 0 && sortedFavorites.every(f => !f.matchesSearch) && (
                        <motion.div
                            key="no-matches"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <p className="text-gray-500">🤔 That name doesn't ring a bell...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}