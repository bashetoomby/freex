"use client"

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import './SpinSlider.css'

const SpinSlider = ({
    children, setFrontCard, frontCard, nextCard, like, dislike, activeCardId, blockUi
}: {
    activeCardId: number,
    children: React.ReactNode[],
    setFrontCard: Dispatch<SetStateAction<number>>,
    frontCard: number,
    nextCard: () => void,
    like: (id: number) => Promise<void>,
    dislike: (id: number) => Promise<void>,
    blockUi: boolean
}) => {


    const [frontCoordY, setFrontCoordY] = useState<number>(0)
    const [mousePos, setMousePos] = useState<number>(0)


    return (
        <div className="spin-wrapper">
            {children.map((card, id) => {
                return (

                    <div
                        onDragStart={(e) => e.preventDefault()}
                        onMouseDown={(e) => {
                            if (id === frontCard) setMousePos(e.pageY)
                        }}

                        onMouseMove={(e) => {
                            if (mousePos !== 0) {
                                const frontCoordY = e.pageY - mousePos
                                setFrontCoordY(frontCoordY)
                            }
                        }}

                        onMouseUp={async () => {
                            setMousePos(0)
                            setFrontCoordY(0)
                            if (frontCoordY >= 100) {
                                await dislike(activeCardId)
                                nextCard()
                            }
                            else if (frontCoordY <= -100) {
                                await like(activeCardId)
                                nextCard()
                            }
                            if (id !== frontCard && !blockUi) setFrontCard(id)
                        }}
                        
                        
                        key={id}
                        className={`card-wrapper ${frontCard === id ? 'card-wrapper-front' : ''}`}
                        style={{
                            transition: id === frontCard && mousePos !== 0 ? '0s' : '',
                            zIndex: frontCard === id ? children.length + 1 : id > frontCard ? children.length - id : id,
                            left: id !== frontCard ? `${id > frontCard ? `${(id - frontCard) * 150}px` : `-${(frontCard - id) * 150}px`}` : '0px',
                            top: id !== frontCard ? `${id > frontCard ? `${(id - frontCard) * 10}px` : `${(frontCard - id) * 10}px`}` : `${frontCoordY}px`,

                        }}

                    >
                        {card}
                        {frontCard !== id && <div className="spin-stub"></div>}
                        {frontCoordY !== 0 && frontCard === id && < div className="spin-stub"></div>}
                    </div>

                )
            })}

        </div >
    );
}

export default SpinSlider;