"use client"

import { CSSProperties, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import "./DoubleRangeInput.css"


const DoubleRangeInput = (
    { min,
        max,
        setActualMinValue,
        setActualMaxValue,
        title,
        styles,
        minValue,
        maxValue
    }
        :
        {
            minValue: number,
            maxValue: number,
            min: number,
            max: number,
            setActualMinValue: Dispatch<SetStateAction<number>>,
            setActualMaxValue: Dispatch<SetStateAction<number>>,
            title: string,
            styles?: CSSProperties
        }
) => {

    const minValueRef = useRef<HTMLInputElement>(null);
    const maxValueRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);

    // Используем значения из пропсов напрямую
    const [inputValueMin, setInputValueMin] = useState<number>(minValue);
    const [inputValueMax, setInputValueMax] = useState<number>(maxValue);

    // Синхронизируем input значения с пропсами
    useEffect(() => {
        setInputValueMin(minValue);
    }, [minValue]);

    useEffect(() => {
        setInputValueMax(maxValue);
    }, [maxValue]);

    const getPercent = useCallback((value: number) => {
        return Math.round(((value - min) / (max - min)) * 100);
    }, [min, max]);

    // Обновляем визуальное отображение диапазона
    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minValue);
            const maxPercent = getPercent(maxValue);

            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minValue, maxValue, getPercent]);

    const handleMinChange = useCallback((value: number) => {
        const newValue = Math.min(Math.max(value, min), maxValue - 1);
        setActualMinValue(newValue);
    }, [min, maxValue, setActualMinValue]);

    const handleMaxChange = useCallback((value: number) => {
        const newValue = Math.max(Math.min(value, max), minValue + 1);
        setActualMaxValue(newValue);
    }, [max, minValue, setActualMaxValue]);

    const handleInputMinChange = useCallback((value: number) => {
        if (!Number.isNaN(value)) {
            setInputValueMin(value);
            if (value >= min && value < maxValue) {
                handleMinChange(value);
            }
        }
    }, [min, maxValue, handleMinChange]);

    const handleInputMaxChange = useCallback((value: number) => {
        if (!Number.isNaN(value)) {
            setInputValueMax(value);
            if (value <= max && value > minValue) {
                handleMaxChange(value);
            }
        }
    }, [max, minValue, handleMaxChange]);

    return (
        <div className="rangeinput" style={styles}>
            <h3 className="rangeinput__title">{title}</h3>
            <div className="rangeinput__slider">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minValue}
                    ref={minValueRef}
                    onChange={(event) => {
                        const value = parseInt(event.target.value);
                        handleMinChange(value);
                    }}
                    className={minValue === max - 1 ? "rangeinput__thumb rangeinput__thumb--zindex-5" : "rangeinput__thumb rangeinput__thumb--zindex-3"}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxValue}
                    ref={maxValueRef}
                    onChange={(event) => {
                        const value = parseInt(event.target.value);
                        handleMaxChange(value);
                    }}
                    className="rangeinput__thumb rangeinput__thumb--zindex-4"
                />
                <div className="rangeinput__slider">
                    <div className="rangeinput__track" />
                    <div ref={range} className="rangeinput__range" />
                </div>
            </div>
            <div className="rangeinput__inputs">
                <input
                    className="rangeinput__input"
                    type="number"
                    value={inputValueMin}
                    onChange={(event) => {
                        handleInputMinChange(parseInt(event.target.value) || min);
                    }}
                    onBlur={() => {
                        const value = Math.max(min, Math.min(inputValueMin, maxValue - 1));
                        handleMinChange(value);
                        setInputValueMin(value);
                    }}
                    onFocus={(e) => e.target.select()}
                    onKeyUp={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur();
                        }
                    }}
                />

                <input
                    className="rangeinput__input"
                    type="number"
                    value={inputValueMax}
                    onChange={(event) => {
                        handleInputMaxChange(parseInt(event.target.value) || maxValue);
                    }}
                    onBlur={() => {
                        const value = Math.min(max, Math.max(inputValueMax, minValue + 1));
                        handleMaxChange(value);
                        setInputValueMax(value);
                    }}
                    onFocus={(e) => e.target.select()}
                    onKeyUp={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur();
                        }
                    }}
                />
            </div>
        </div>
    );
};



export default DoubleRangeInput;