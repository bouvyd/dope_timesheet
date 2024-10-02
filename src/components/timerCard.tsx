import React, { useState } from 'react'
import { Timer } from '../global/types'
import { useMainStore } from '../store/main'
import { motion } from 'framer-motion'
import { getTimerFullDuration } from '../utils/utils'
import { formatDuration } from '../utils/format'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons'

interface TimerCardProps {
    timer: Timer
    isCurrentTimer: boolean
    layout?: boolean
}

export const TimerCard: React.FC<TimerCardProps> = ({ timer, isCurrentTimer, layout }) => {
    const { addDuration, setTimerDescription, startTimer, stopTimer } = useMainStore()

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

    return (
        <motion.div
            className="bg-white shadow hover:shadow-lg rounded overflow-hidden transition-shadow"
            layout={layout}
            initial={false}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
        >
            <div
                className="bg-white shadow-md flex flex-row rounded hover:shadow-lg transition-shadow cursor-default"
            >
                <div className="flex flex-col truncate flex-grow p-2 truncate flex-grow">
                    <div className="font-semibold flex flex-row text-left text-ellipsis truncate p-1">
                        <span className="text-ellipsis truncate" title={timer.resourceName}>
                            {timer.resourceName}
                        </span>
                    </div>
                    <span className="text-xs">
                        <input placeholder="Add a description..." className="border-none focus:outline-none focus:bg-gray-100 hover:bg-gray-100 border-gray-200 rounded p-1" type="text" value={description} onChange={handleDescriptionChange} />
                    </span>
                </div>
                <div className="flex flex-col w-1/6">
                    <button className="bg-green-100 hover:bg-green-200 px-2 cursor-pointer flex-grow" onClick={() => addDuration(timer.resourceId, timer.resourceType, 15)}>+15'</button>
                    <button className="bg-green-100 hover:bg-green-200 px-2 cursor-pointer flex-grow" onClick={() => addDuration(timer.resourceId, timer.resourceType, 60)}>+1h</button>
                </div>
                <div onClick={handleTimerClick} onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} className={`${isCurrentTimer ? "bg-green-200 hover:bg-yellow-100" : "bg-blue-100 hover:bg-green-200"} rounded-r font-bold p-2 aspect-square w-1/5 flex-shrink-0 flex flex-col items-center justify-center cursor-pointer`} >
                    {
                        isCurrentTimer ?
                            isButtonHovered ? <FontAwesomeIcon icon={faStop} /> : <FontAwesomeIcon icon={faPlay} /> :
                            isButtonHovered ? <FontAwesomeIcon icon={faPlay} /> : <FontAwesomeIcon icon={faStop} />
                    }
                    <span>{formatDuration(getTimerFullDuration(timer))}</span>
                </div>
            </div>
        </motion.div>
    )
}