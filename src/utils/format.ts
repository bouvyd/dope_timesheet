/**
 * Formats a float time value to HH:MM format.
 * @param time - The float time value to format (e.g., 6.25 for 6 hours and 15 minutes).
 * @returns A string in HH:MM format.
 */
export function formatFloatTime(time: number): string {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
}
