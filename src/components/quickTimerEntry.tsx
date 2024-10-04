import React, { useState } from "react";
import { useMainStore } from "../store/main";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faPlus, faX, faClock } from "@fortawesome/free-solid-svg-icons";
import useRemoteResource from "../hooks/remoteResource";
import { Timer } from "../global/types";

const QuickTimerEntry = () => {
    const { addTimer } = useMainStore()

    const [isOpen, setIsOpen] = useState(false)
    const [type, setType] = useState<"task" | "project">("task")
    const [id, setId] = useState<number>(0)
    const [duration, setDuration] = useState<number>(15)
    const [description, setDescription] = useState<string>("")

    const { isLoading, isResourceValid, name, errorMsg, setName } = useRemoteResource(id, type);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (id === 0) {
            return
        }

        if (isResourceValid) {
            addTimer({ resourceName: name, resourceId: id, resourceType: type, start: null, previousDuration: duration, description } as Timer)
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
        <div>
            <button
                onClick={() => setIsOpen(true)}
                title="Add a timer by Task/Project ID"
                className="text-xs text-gray-500 hover:text-green-500 rounded transition-colors"
            >
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                Quick Entry
            </button>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            key="add-timer-backdrop"
                            onClick={handleClose}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-10"
                        >
                        </motion.div>
                        <motion.div
                            key="add-timer-modal"
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            className="bg-white shadow flex flex-col rounded p-2 w-4/5 absolute top-[5rem] left-[10%] cursor-default z-10"
                        >
                            <div className="flex flex-row justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Add Timer</h2>
                                <button onClick={handleClose} className="text-gray-400">
                                    <FontAwesomeIcon icon={faX} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-2 items-center">
                                        <label htmlFor="type" className="w-1/4">Type</label>
                                        <input className="border border-gray-300 rounded p-1" type="radio" name="type" value="task" id="task" checked={type === "task"} onChange={handleTypeChange} />
                                        <label htmlFor="task">Task</label>
                                        <input className="border border-gray-300 rounded p-1 ml-2" type="radio" name="type" value="project" id="project" checked={type === "project"} onChange={handleTypeChange} />
                                        <label htmlFor="project">Project</label>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <label htmlFor="id" className="w-1/4">ID</label>
                                        <input autoFocus className="border border-gray-300 rounded p-1 bg-gray-100" type="number" id="id" value={id} onChange={handleIDChange} />
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <label htmlFor="name" className="w-1/4">Name</label>
                                        <input className="border border-gray-300 rounded p-1 bg-gray-100" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <label htmlFor="duration" className="w-1/4">Duration</label>
                                        <input className="border border-gray-300 rounded p-1 bg-gray-100" type="number" min="0" id="duration" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <label htmlFor="description" className="w-1/4">Description</label>
                                        <input className="border border-gray-300 rounded p-1 bg-gray-100" type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
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
        </div>
    )
}

export default QuickTimerEntry