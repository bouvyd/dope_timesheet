import React from 'react'
import { useMainStore } from '../store/main'
import { Favorite } from '../global/types'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlay } from '@fortawesome/free-solid-svg-icons'
import odooApi from '../api/odoo'

interface FavoriteProps {
    favorite: Favorite
    editionMode: boolean
    faded?: boolean
}

export const FavoriteCard: React.FC<FavoriteProps> = ({ favorite, editionMode = false, faded = false }) => {
    const { removeFavorite, startTimer, setFavoriteName } = useMainStore()

    const onSetName = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            setFavoriteName(favorite, e.target.value)
        } else {
            const favInfo = await odooApi.getResourceInfo(favorite.id, favorite.type)
            if (favInfo) {
                setFavoriteName(favorite, favInfo.displayName)
            } else {
                setFavoriteName(favorite, favorite.name)
            }
        }
    }

    return (
        <motion.div
            initial={false}
            animate={{ height: "auto" }}
            exit={{ opacity: 0, height: 0, x: "100%" }}
            className={`bg-white shadow flex flex-row rounded hover:shadow-lg transition-shadow cursor-default w-full ${faded ? "opacity-25" : ""}`}
            layout
        >
            <div className="flex flex-col truncate flex-grow p-2 truncate">
                <div className="font-semibold flex flex-row gap-1 text-left text-ellipsis truncate">
                    {editionMode ?
                        <input type="text" className="border-none focus:outline-none bg-gray-100 border-gray-200 rounded p-1" value={favorite.name} onChange={onSetName} />
                        :
                        <span className="text-ellipsis truncate py-1" title={favorite.name}>
                            {favorite.name}
                        </span>
                    }
                </div>
                <span className="text-gray-500 text-xs font-normal capitalize">{favorite.type} <span className="text-gray-300">#{favorite.id}</span></span>
            </div>
            <AnimatePresence>
                {!editionMode && (
                    <motion.div
                        className="aspect-square w-1/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                        key={`add15-${favorite.id}`}
                        initial={false}
                        animate={{ opacity: 1, width: "20%" }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        <button className="bg-green-300 hover:bg-green-400 aspect-square p-2 w-full h-full" onClick={() => startTimer(favorite.id, favorite.type, favorite.name, 15)}>+15'</button>
                    </motion.div>
                )}
                {!editionMode && (
                    <motion.div
                        className="aspect-square w-1/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                        key={`add60-${favorite.id}`}
                        initial={false}
                        animate={{ opacity: 1, width: "20%" }}
                        exit={{ opacity: 0, width: 0 }}
                    >
                        <button className="bg-green-500 hover:bg-green-600 rounded-r aspect-square text-white p-2 w-full h-full" onClick={() => startTimer(favorite.id, favorite.type, favorite.name, 0)}><FontAwesomeIcon icon={faPlay} /></button>
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
                        <button className="bg-red-500 hover:bg-red-600 rounded-r aspect-square text-white p-2 w-full h-full" onClick={() => removeFavorite(favorite)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}