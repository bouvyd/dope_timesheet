import React, { useState, useEffect } from 'react';
import { useMainStore } from '../store/main';
import { formatDuration } from '../utils/format';
import { Timer } from '../global/types';
import { getTimerFullDuration } from '../utils/utils';

interface DurationInputProps {
    timer: Timer;
}

const DurationInput: React.FC<DurationInputProps> = ({ timer }) => {
    const { setDuration } = useMainStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [currentDuration, setCurrentDuration] = useState(getTimerFullDuration(timer));

    useEffect(() => {
        setCurrentDuration(getTimerFullDuration(timer));
    }, [timer]);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDuration = parseInt(e.target.value, 10);
        if (!isNaN(newDuration)) {
            setCurrentDuration(newDuration);
            setDuration(timer.resourceId, timer.resourceType, newDuration);
        }
    };

    const preventClickPropagation = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
    };

    const showInput = isHovered || isFocused;

    return (
        <span
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={preventClickPropagation}
            className="w-full text-center"
        >
            {showInput ? (
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={Math.floor(currentDuration)}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="w-full text-center bg-gray-100 rounded focus:outline-none text-black"
                />
            ) : (
                formatDuration(currentDuration)
            )}
        </span>
    );
};

export default DurationInput;
