import React, { useState } from "react";
import { useMainStore } from "../store/main";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import useRemoteResource from "../hooks/remoteResource";

const AddFavorite = () => {
    const { addFavorite } = useMainStore()

    const [isOpen, setIsOpen] = useState(false)
    const [type, setType] = useState<"task" | "project">("task")
    const [id, setId] = useState<number>(0)

    const { isLoading, isResourceValid, name, errorMsg, setName } = useRemoteResource(id, type);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (id === 0) {
            return
        }

        if (isResourceValid) {
            addFavorite({ name, type, id })
            setIsOpen(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setId(0)
        setType("task")
    }

    const handleIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setId(parseInt(e.target.value.replace(/^0+/, '')))
    }

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setType(e.target.value as "task" | "project")
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            key="add-favorite"
        >
            <button
                onClick={() => setIsOpen(true)}
                className="bg-green-500 hover:bg-green-700 text-white rounded w-full p-2 disabled:opacity-50 transition-opacity"
                
            >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Favorite
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            key="add-favorite-backdrop"
                            onClick={handleClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-2"
                        >
                        </motion.div>
                        <motion.div
                            key="add-favorite-modal"
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            className="bg-white shadow flex flex-col rounded p-2 w-4/5 absolute top-[5rem] left-[10%] cursor-default"
                        >
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Add Favorite</h2>
                                <button onClick={handleClose} className="text-gray-400">
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-2">
                                        <label htmlFor="type" className="w-1/4">Type</label>
                                        <input className="border border-gray-300 rounded p-1" type="radio" name="type" value="task" id="task" checked={type === "task"} onChange={handleTypeChange} />
                                        <label htmlFor="task">Task</label>
                                        <input className="border border-gray-300 rounded p-1 ml-2" type="radio" name="type" value="project" id="project" checked={type === "project"} onChange={handleTypeChange} />
                                        <label htmlFor="project">Project</label>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <label htmlFor="id" className="w-1/4">ID</label>
                                        <input autoFocus className="border border-gray-300 rounded p-1 bg-gray-100" type="number" id="id" value={id} onChange={handleIDChange} />
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        <label htmlFor="name" className="w-1/4">Name</label>
                                        <input className="border border-gray-300 rounded p-1 bg-gray-100" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <AnimatePresence>
                                        {errorMsg && (
                                            <motion.div
                                                key="does-not-exist"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <span className="text-red-500">{errorMsg}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <button type="submit" className={`bg-green text-white rounded p-2 ${isLoading || !isResourceValid ? "opacity-50" : ""}`} disabled={isLoading || !isResourceValid}>{isLoading && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}Add</button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default AddFavorite