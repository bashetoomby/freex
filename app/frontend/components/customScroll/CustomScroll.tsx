
import { CSSProperties, useEffect, useRef, useState } from 'react';
import './CustomScroll.css'

const CustomScroll = ({ children, wrapperStyles }:
    { children: React.ReactNode, wrapperStyles: CSSProperties, contentStyles: CSSProperties }) => {

    const [scrollPos, setScrollPost] = useState(0)
    const thumbRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    return (

        <div className="scroll-wrapper" style={wrapperStyles}>

            <div
                className="custom-scroll"
            >
                <div
                    className="scroll-content"
    
                >
                    {children}
                </div>  

            </div >

        </div>

    );
}

export default CustomScroll;