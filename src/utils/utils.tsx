import { Timer } from "../global/types"

export function findResourceTimer(timers: Timer[], resourceId: number, resourceType: 'task' | 'project') : Timer | undefined {
    return timers.find((timer) => timer.resourceId === resourceId && timer.resourceType === resourceType)
}

export function findRunningTimer(timers: Timer[]) : Timer | undefined {
    return timers.find((timer) => timer.start !== null)
}

export function getTimerFullDuration(timer: Timer): number {
    const previousDuration = timer.previousDuration
    const currentDuration = timer.start ? Math.floor((new Date().getTime() - timer.start.getTime()) / 60000) : 0
    return previousDuration + currentDuration
}

export function roundDuration(duration: number, step: number) {
    return Math.ceil(Math.floor(duration)/step) * step
}