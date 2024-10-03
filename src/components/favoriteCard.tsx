import React from 'react'
import { useMainStore } from '../store/main'
import { Favorite } from '../global/types'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlay } from '@fortawesome/free-solid-svg-icons'
interface FavoriteProps {
    favorite: Favorite
    editionMode: boolean
}

export const FavoriteCard: React.FC<FavoriteProps> = ({ favorite, editionMode = false }) => {
    const { removeFavorite, startTimer } = useMainStore()

    return (
        <motion.div
            initial={ false }
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, x: "100%" }}
            className="bg-white shadow flex flex-row rounded hover:shadow-lg transition-shadow cursor-default w-full"
        >
            <div className="flex flex-col truncate flex-grow p-2 truncate">
                <div className="font-semibold mb-2 flex flex-row gap-1 text-left text-ellipsis truncate">
                    <span className="text-ellipsis truncate" title={favorite.name}>
                        {favorite.name}
                    </span>
                </div>
                <span className="text-gray-500 text-xs font-normal capitalize">{favorite.type} <span className="text-gray-300">#{favorite.id}</span></span>
            </div>
            <AnimatePresence>
                {!editionMode && (
                    <motion.div
                        className="aspect-square w-1/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                        key={`add15-${favorite.id}`}
                        initial={ false }
                        animate={{ opacity: 1, width: "20%" }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        <button className="bg-green-300 aspect-square p-2 w-full h-full" onClick={() => startTimer(favorite.id, favorite.type, favorite.name, 15)}>+15'</button>
                    </motion.div>
                )}
                {!editionMode && (
                    <motion.div
                        className="aspect-square w-1/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                        key={`add60-${favorite.id}`}
                        initial={ false }
                        animate={{ opacity: 1, width: "20%" }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        <button className="bg-green-500 rounded-r aspect-square text-white p-2 w-full h-full" onClick={() => startTimer(favorite.id, favorite.type, favorite.name, 0)}><FontAwesomeIcon icon={faPlay} /></button>
                    </motion.div>
                )}
                {editionMode && (
                    <motion.div
                        className="aspect-square w-1/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                        key={`remove-${favorite.id}`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "20%" }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        <button className="bg-red-500 rounded-r aspect-square text-white p-2 w-full h-full" onClick={() => removeFavorite(favorite)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}