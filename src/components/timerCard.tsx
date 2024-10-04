import React, { useState, useEffect } from 'react'
import { Timer } from '../global/types'
import { useMainStore } from '../store/main'
import { motion } from 'framer-motion'
import { getTimerFullDuration } from '../utils/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import DurationInput from './durationInput'
import { faPlay, faStop, faTrash } from '@fortawesome/free-solid-svg-icons'
interface TimerCardProps {
    timer: Timer
    isCurrentTimer: boolean
    layout?: boolean
}

export const TimerCard: React.FC<TimerCardProps> = ({ timer, isCurrentTimer, layout }) => {
    const { addDuration, setDuration, setTimerDescription, startTimer, stopTimer, deleteTimer } = useMainStore()

    const [description, setDescription] = useState(timer.description)
    const [isButtonHovered, setIsButtonHovered] = useState(false)

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value)
        setTimerDescription(timer.resourceId, timer.resourceType, e.target.value)
    }

    const handleTimerClick = () => {
        if (isCurrentTimer) {
            stopTimer(timer.resourceId, timer.resourceType)
        } else {
            startTimer(timer.resourceId, timer.resourceType, timer.resourceName, 0)
        }
    }

    // if timer is running, re-render the card every minute
    useEffect(() => {
        if (isCurrentTimer) {
            const interval = setInterval(() => {
                setDuration(timer.resourceId, timer.resourceType, getTimerFullDuration(timer))
            }, 60000)
            return () => clearInterval(interval)
        }
    }, [isCurrentTimer, timer, setDuration])

    return (
        <motion.div
            className="bg-white shadow hover:shadow-lg rounded overflow-hidden transition-shadow"
            layout={layout}
            initial={false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, y: -20 }}
        >
            <div
                className="bg-white shadow-md flex flex-row rounded hover:shadow-lg transition-shadow cursor-default"
            >
                <div className="flex flex-col truncate flex-grow p-2 truncate flex-grow">
                    <div className="font-semibold flex flex-row text-left text-ellipsis truncate p-1 justify-between items-center">
                        <span className="text-ellipsis truncate" title={timer.resourceName}>
                            {timer.resourceName}
                        </span>
                        <FontAwesomeIcon icon={faTrash} title="Delete" className="text-gray-500 hover:text-red-500 cursor-pointer" onClick={() => deleteTimer(timer.resourceId, timer.resourceType)} />
                    </div>
                    <span className="text-xs">
                        <input placeholder="Add a description..." title={description} className="border-none focus:outline-none focus:bg-gray-100 hover:bg-gray-100 border-gray-200 rounded p-1" type="text" value={description} onChange={handleDescriptionChange} />
                    </span>
                    {timer.error && <span className="text-red-500 text-xs truncate text-ellipsis" title={timer.error}>{timer.error}</span>}
                </div>
                <div className="flex flex-col w-1/6">
                    <button className="bg-green-100 hover:bg-green-200 px-2 cursor-pointer flex-grow" title="Add or round up to 15 minutes" onClick={() => addDuration(timer.resourceId, timer.resourceType, 15)}>+15'</button>
                    <button className="bg-green-100 hover:bg-green-200 px-2 cursor-pointer flex-grow" title="Add or round up to 1 hour" onClick={() => addDuration(timer.resourceId, timer.resourceType, 60)}>+1h</button>
                </div>
                <div onClick={handleTimerClick} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} className={`${isCurrentTimer ? "bg-green text-black hover:bg-yellow-100 hover:text-black" : "bg-blue-100 hover:bg-green hover:text-white"} rounded-r font-bold p-2 aspect-square w-1/5 flex-shrink-0 flex flex-col gap-1 items-center justify-center cursor-pointer`} >
                    {
                        isCurrentTimer ?
                            isButtonHovered ? <FontAwesomeIcon icon={faStop} /> : 
                            <FontAwesomeIcon icon={faPlay} className="fa-beat-fade" /> :
                            isButtonHovered ? <FontAwesomeIcon icon={faPlay} /> : <FontAwesomeIcon icon={faStop} />
                    }
                    <DurationInput timer={timer} />
                </div>
            </div>
        </motion.div>
    )
}