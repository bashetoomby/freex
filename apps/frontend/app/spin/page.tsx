'use client'

import SpinSlider from "@/components/slider/SpinSlider";
import './Spin.css'
import { CSSProperties, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestWrapper } from '@/functions/api/api'
import { IAuthInfo, ISearchParams, IUserData, IUserDataDto, IVotedDate } from "../interfaces";
import RangeInput from "@/components/rangeInput/RangeInput";
import DoubleRangeInput from "@/components/doubleRangeInput/DoubleRangeInput";
import { useNotifications } from "@/providers/NotificationProvider";
import Link from "next/link";




async function getUsersDataRequest(authInfo: IAuthInfo) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/get-users-data`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}


async function vote(authInfo: IAuthInfo, data: any) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes/write-vote`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'authorization': `Bearer ${authInfo.token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res
}
async function getUserDataById(authInfo: IAuthInfo, data: any) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/get-user-data-by-id`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res
}


const Spin = () => {
    const router = useRouter()
    const searchUrlParams = useSearchParams()

    const [usersData, setUsersData] = useState<IUserDataDto[]>([])
    const [blockUi, setBlockUi] = useState(false)
    const [votedCards, setVotedCards] = useState<IVotedDate[]>([])
    const [activeCardId, setActiveCardId] = useState(0)
    const [frontCard, setFrontCard] = useState<number>(0)
    const [likedCards, setLikedCard] = useState<number[]>([])
    const [dislikedCards, setDislikedCard] = useState<number[]>([])
    const [searchFormActive, setSearchFormActive] = useState(false)
    const [searchParams, setSearchParams] = useState<ISearchParams | null>(null)
    const [loadingCards, setLoadingCards] = useState(true)
    const { setNotification } = useNotifications()

    useEffect(() => {

        setData()
    }, [])
    useEffect(() => {
        const liked = votedCards.map((item) => {
            if (item.vote) return item.votedUserId
            else return NaN
        })
        const disliked = votedCards.map((item) => {
            if (!item.vote) return item.votedUserId
            else return NaN
        })
        setLikedCard(liked)
        setDislikedCard(disliked)

    }, [votedCards])
    useEffect(() => {
        if (frontCard === usersData.length) setActiveCardId(-1)
        else setActiveCardId(usersData[frontCard]?.userId)
    }, [frontCard, usersData])
    useEffect(() => {
        if (searchParams && !searchParams.fullfield) setSearchFormActive(true)
    }, [searchParams])


    async function setData() {
        setBlockUi(true)
        await requestWrapper(getUsersDataRequest, async (res) => {
            try {
                const data: { usersData: IUserDataDto[], usersIdVotes: IVotedDate[] } = await res.json()
                const usersId = data.usersData.map(item => item.userId)


                const urlUserId = searchUrlParams.get('userId')
                const newSearchParams = new URLSearchParams(searchUrlParams.toString())
                newSearchParams.delete('userId')
                router.replace(`?${newSearchParams.toString()}`, { scroll: false })
                if (urlUserId) {
                    const urlUserId = searchUrlParams.get('userId')
                    const userData = data.usersData.find(data => data.userId === Number(urlUserId))
                    if (userData) {
                        setFrontCard(data.usersData.findIndex((data) => data.userId === userData.userId))
                    }

                    else {
                        await requestWrapper(getUserDataById, async (res) => {
                            if (res.status === 201) {
                                const userData: IUserDataDto = await res.json()
                                data.usersData.unshift(userData)
                            }

                        }, () => { }, { userId: urlUserId })
                        setFrontCard(0)
                    }
                }

                setUsersData(data.usersData)
                setVotedCards(data.usersIdVotes)
                if (!urlUserId) {
                    const filteredVotedCards = data.usersIdVotes.filter(item => usersId.includes(item.votedUserId))
                    setFrontCard(filteredVotedCards.length)
                }

            } catch (error) {
                console.log(error);
            }
        }, () => { })

        setLoadingCards(false)

        setLikedCard([])
        setBlockUi(false)
    }

    // Scroll card to next
    function nextCard() {
        setFrontCard(prev => {
            if (frontCard < usersData.length) return prev + 1
            else return usersData.length
        })
    }
    // scroll card to prev
    function prevCard() {
        setFrontCard(prev => {
            if (frontCard > 0) return prev - 1
            else return 0
        })
    }



    async function dislike(id: number) {
        setBlockUi(true)
        if (id === -1) {
            router.push('/chats')
        }
        else {
            await requestWrapper(vote,
                () => { },
                () => { },
                { vote: false, votedUserId: usersData[frontCard]?.userId })
            setDislikedCard(prev => {
                if (!prev.includes(id)) return [...prev, id]
                else return prev
            })
            setLikedCard(prev => {
                if (prev.includes(id)) {
                    return prev.filter(item => item !== id)
                }
                return prev
            })
        }

        setBlockUi(false)
    }
    async function like(id: number) {
        setBlockUi(true)
        if (id === -1) {
            setData()
        }
        else {
            await requestWrapper(vote,
                () => { },
                () => { },
                { vote: true, votedUserId: usersData[frontCard]?.userId })
            setDislikedCard(prev => {
                if (prev.includes(id)) {
                    return prev.filter(item => item !== id)
                }
                return prev
            })
            setLikedCard(prev => {
                if (!prev.includes(id)) return [...prev, id]
                else return prev
            })
        }
        setBlockUi(false)
    }

    return (
        <main className="spin">
            <div className="spin__search-params">
                <button
                    onClick={() => {
                        if (searchParams?.fullfield) setSearchFormActive(prev => !prev)
                        else setNotification({ message: 'To continue, please fill in search parameters.' })
                    }}
                    className="spin__settings-btn"
                >
                    <svg

                        x="0px"
                        y="0px"
                        width="122.88px"
                        height="80.593px"
                        viewBox="0 0 122.88 80.593"
                        xmlSpace="preserve"
                        className={`spin__settings-svg ${searchFormActive && 'spin__settings-svg--active'}`}
                    >
                        <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                    </svg>
                    Search settings
                    <svg
                        version="1.1"
                        id="Layer_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        x="0px"
                        y="0px"
                        width="122.88px"
                        height="122.878px"
                        viewBox="0 0 122.88 122.878"
                        enableBackground="new 0 0 122.88 122.878"
                        xmlSpace="preserve"
                        className={`spin__settings-svg ${searchFormActive && 'spin__settings-svg--active'}`}
                    >
                        <g>
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M101.589,14.7l8.818,8.819c2.321,2.321,2.321,6.118,0,8.439l-7.101,7.101 c1.959,3.658,3.454,7.601,4.405,11.752h9.199c3.283,0,5.969,2.686,5.969,5.968V69.25c0,3.283-2.686,5.969-5.969,5.969h-10.039 c-1.231,4.063-2.992,7.896-5.204,11.418l6.512,6.51c2.321,2.323,2.321,6.12,0,8.44l-8.818,8.819c-2.321,2.32-6.119,2.32-8.439,0 l-7.102-7.102c-3.657,1.96-7.601,3.456-11.753,4.406v9.199c0,3.282-2.685,5.968-5.968,5.968H53.629 c-3.283,0-5.969-2.686-5.969-5.968v-10.039c-4.063-1.232-7.896-2.993-11.417-5.205l-6.511,6.512c-2.323,2.321-6.12,2.321-8.441,0 l-8.818-8.818c-2.321-2.321-2.321-6.118,0-8.439l7.102-7.102c-1.96-3.657-3.456-7.6-4.405-11.751H5.968 C2.686,72.067,0,69.382,0,66.099V53.628c0-3.283,2.686-5.968,5.968-5.968h10.039c1.232-4.063,2.993-7.896,5.204-11.418l-6.511-6.51 c-2.321-2.322-2.321-6.12,0-8.44l8.819-8.819c2.321-2.321,6.118-2.321,8.439,0l7.101,7.101c3.658-1.96,7.601-3.456,11.753-4.406 V5.969C50.812,2.686,53.498,0,56.78,0h12.471c3.282,0,5.968,2.686,5.968,5.969v10.036c4.064,1.231,7.898,2.992,11.422,5.204 l6.507-6.509C95.471,12.379,99.268,12.379,101.589,14.7L101.589,14.7z M61.44,36.92c13.54,0,24.519,10.98,24.519,24.519 c0,13.538-10.979,24.519-24.519,24.519c-13.539,0-24.519-10.98-24.519-24.519C36.921,47.9,47.901,36.92,61.44,36.92L61.44,36.92z"
                            />
                        </g>
                    </svg>
                </button>

                <SearchParamsForm
                    action={setData}
                    setSearchParams={setSearchParams}
                    isActive={searchFormActive}
                />
            </div>




            <div className={`spin__slider ${searchFormActive && 'spin__slider--hide'} `} >
                <SpinSlider
                    activeCardId={activeCardId}
                    like={like}
                    dislike={dislike}
                    blockUi={blockUi}
                    frontCard={frontCard}
                    setFrontCard={setFrontCard}
                    nextCard={nextCard}
                >
                    {[
                        ...usersData.map((item, id) => (
                            <SpinCard
                                key={id}
                                id={id}
                                isLiked={likedCards.includes(item.userId)}
                                isDisliked={dislikedCards.includes(item.userId)}
                                like={like}
                                dislike={dislike}
                                userData={item}
                                nextCard={nextCard}
                                prevCard={prevCard}
                                didDisplayed={id === frontCard}
                            />
                        )),
                        <LastSpinCard
                            key="last-card"
                            isLoading={loadingCards}
                        />
                    ]}

                </SpinSlider>
            </div>
        </main >
    );
}


const inputStyles: CSSProperties = {
    borderBottom: '1px dashed var(--shadowcolor)'
}



async function setUserDataRequset(authInfo: IAuthInfo, data: any) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search-params/set-params`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'authorization': `Bearer ${authInfo.token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res
}
async function getSearchParamsRequset(authInfo: IAuthInfo) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/search-params/get-params`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}

const SearchParamsForm = (
    { action,
        setSearchParams,
        isActive
    }:
        {
            action: () => void,
            setSearchParams: Dispatch<SetStateAction<ISearchParams | null>>
            isActive: boolean
        }) => {


    const [actionIsLoading, setActionIsLoading] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    const [genderChecked, setGenderChecked] = useState<string | null>(null)
    const [minAge, setMinAge] = useState(18)
    const [maxAge, setMaxAge] = useState(99)
    const [distance, setDistance] = useState(80)
    const [location, setLocation] = useState(false)
    const { setNotification } = useNotifications()

    useEffect(() => {
        requestWrapper(getSearchParamsRequset, async (res) => {
            try {
                const params: { searchParams: ISearchParams, location: boolean } = await res.json()
                setGenderChecked(params.searchParams.gender || null)
                setMinAge(params.searchParams.minAge || 18)
                setMaxAge(params.searchParams.maxAge || 99)
                setDistance(params.searchParams.distance || 999)
                setSearchParams(params.searchParams)
                setLocation(params.location)
                console.log(params);
            } catch (error) {
                console.log(error);
            }
        }, () => { })
    }, [])

    useEffect(() => {
        if (isLoaded === true) {
            setTimeout(() => {
                setIsLoaded(false)
            }, 1500)
        }

    }, [isLoaded])

    if (!isActive) return null
    return (
        <form
            autoComplete="off"
            className={`searh-p-form ${isActive && 'searh-p-form--active'}`}
            action={async () => {
                setActionIsLoading(true)
                const data: ISearchParams = {
                    distance: Number(distance),
                    gender: genderChecked || null,
                    maxAge: Number(maxAge),
                    minAge: Number(minAge)
                }
                await requestWrapper(setUserDataRequset, async (res) => {
                    try {
                        const params: ISearchParams = await res.json()
                        setSearchParams(params)
                    } catch (error) {

                    }
                    setIsLoaded(true)
                }, () => { }, data)
                setActionIsLoading(false)
                action()
            }}
        >



            <div className="gender-wrapper" style={inputStyles}>

                <label htmlFor="gender-man" className='gender__label'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        shapeRendering="geometricPrecision"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        viewBox="0 0 512 511.01"
                        className={`gender__svg ${genderChecked === 'man' && 'gender__svg--active'} `}
                    >
                        <path
                            fillRule="nonzero"
                            d="m456.72 96.62-115.49 115.5c22.46 31.03 35.72 69.17 35.72 110.41 0 52.04-21.1 99.17-55.2 133.27-34.11 34.1-81.23 55.21-133.28 55.21-52.03 0-99.17-21.11-133.27-55.21C21.1 421.7 0 374.57 0 322.53c0-52.04 21.1-99.17 55.2-133.27 34.1-34.1 81.23-55.21 133.27-55.21 42.91 0 82.47 14.35 114.16 38.5L419.89 55.28h-62.84V0H512v158.91h-55.28V96.62zM282.66 228.35c-24.1-24.1-57.41-39.02-94.19-39.02s-70.08 14.92-94.18 39.02c-24.1 24.1-39.01 57.4-39.01 94.18 0 36.78 14.91 70.09 39.01 94.19 24.1 24.1 57.4 39.01 94.18 39.01 36.78 0 70.09-14.91 94.19-39.01 24.1-24.1 39.01-57.41 39.01-94.19s-14.91-70.08-39.01-94.18z"
                        />
                    </svg>

                    <input
                        onChange={(e) => setGenderChecked(e.currentTarget.value)}
                        type="radio"
                        name='gender'
                        id='gender-man'
                        className='gender__input'
                        value='man'
                        checked={genderChecked === 'man'}
                    />
                    Man
                </label>

                <label htmlFor="gender-woman" className='gender__label'>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        shapeRendering="geometricPrecision"
                        textRendering="geometricPrecision"
                        imageRendering="optimizeQuality"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        viewBox="0 0 361 511.42"
                        className={`gender__svg ${genderChecked === 'woman' && 'gender__svg--active'} `}
                    >
                        <path
                            fillRule="nonzero"
                            d="M203.64 359.53v44.17h78.58v52.94h-78.58v54.78H150.7v-54.78H72.13V403.7h78.57v-45.15c-37.91-6.3-71.82-24.41-97.83-50.42C20.21 275.47 0 230.35 0 180.5c0-49.84 20.21-94.97 52.87-127.63S130.65 0 180.5 0c49.84 0 94.97 20.21 127.63 52.87S361 130.66 361 180.5c0 49.84-20.21 94.97-52.87 127.63-27.52 27.52-63.9 46.2-104.49 51.4zM270.7 90.3c-23.08-23.08-54.98-37.36-90.2-37.36-35.23 0-67.12 14.28-90.2 37.36s-37.36 54.98-37.36 90.2c0 35.23 14.28 67.12 37.36 90.2s54.97 37.36 90.2 37.36c35.22 0 67.12-14.28 90.2-37.36s37.36-54.97 37.36-90.2c0-35.22-14.28-67.12-37.36-90.2z"
                        />
                    </svg>

                    <input
                        onChange={(e) => setGenderChecked(e.currentTarget.value)}
                        type="radio"
                        name='gender'
                        id='gender-woman'
                        className='gender__input'
                        value='woman'
                        checked={genderChecked === 'woman'}
                    />
                    Woman
                </label>
            </div>

            <div className="search-p-form__age">
                <DoubleRangeInput
                    min={18}
                    max={99}
                    setActualMaxValue={setMaxAge}
                    setActualMinValue={setMinAge}
                    minValue={minAge}
                    maxValue={maxAge}
                    title="Age"
                    styles={inputStyles}
                />
            </div>

            <div className="search-p-form__distance">
                {!location && <button
                    onClick={(e) => {
                        e.preventDefault()
                        setNotification({ message: 'Enable location access to use distance filtering!' })
                    }}
                    className="distance__block-btn">

                </button>}
                <RangeInput
                    min={0}
                    max={999}
                    setValue={setDistance}
                    value={distance}
                    title="Distance"
                />
            </div>

            <button
                type='submit'
                className={`userdata__form-btn ${isLoaded && 'userdata__form-btn--activated'}`}
                disabled={actionIsLoading}
                onClick={(e) => {
                    if (isLoaded) e.preventDefault()
                }}
            >
                {isLoaded
                    ? "Saved!"
                    : actionIsLoading
                        ? <>
                            Saving...
                        </>
                        : "Save"
                }


            </button>


        </form>
    );
}



const SpinCard = ({ userData, nextCard, prevCard, isLiked, isDisliked, like, dislike, didDisplayed, id }: {
    userData: IUserDataDto,
    nextCard: () => void,
    prevCard: () => void,
    isLiked: boolean,
    isDisliked: boolean,
    like: (id: number) => Promise<void>,
    dislike: (id: number) => Promise<void>,
    didDisplayed: boolean,
    id: number
}) => {
    const router = useRouter()


    const [isDisplayed, setIsDisplayed] = useState(false)
    const [photos, setPhotos] = useState(0)

    useEffect(() => {
        if (!isDisplayed && didDisplayed) setIsDisplayed(true)
    }, [didDisplayed])
    useEffect(() => {

    }, [userData])
    if (!isDisplayed && !isLiked && !isDisliked) return <div className="spin-card"></div>
    return (
        <div className={`spin-card ${isLiked && 'spin-card--liked'} ${isDisliked && 'spin-card--disliked'}`}>
            <div className="spin-card__images">
                {userData.images.length > 0
                    ? <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/images/${userData.images[photos]?.fileName}`}
                        alt=""
                        className="spin-card__image"
                    />
                    : <p className="images__empty-title">No Photo</p>
                }
                <button
                    onClick={() => {
                        setPhotos(prev => {
                            if (prev < userData.images.length - 1) return ++prev
                            else return prev
                        })
                    }}
                    className="images__next-btn">

                </button>
                <button
                    onClick={() => {
                        setPhotos(prev => {
                            if (prev > 0) return --prev
                            else return prev
                        })
                    }}
                    className="images__prev-btn">

                </button>

                <div className="spin-card__info-title">
                    {userData.gender === 'man' ?
                        <svg
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            imageRendering="optimizeQuality"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            viewBox="0 0 512 511.01"
                            className="info-title__gender-svg"
                        >
                            <path
                                fillRule="nonzero"
                                d="m456.72 96.62-115.49 115.5c22.46 31.03 35.72 69.17 35.72 110.41 0 52.04-21.1 99.17-55.2 133.27-34.11 34.1-81.23 55.21-133.28 55.21-52.03 0-99.17-21.11-133.27-55.21C21.1 421.7 0 374.57 0 322.53c0-52.04 21.1-99.17 55.2-133.27 34.1-34.1 81.23-55.21 133.27-55.21 42.91 0 82.47 14.35 114.16 38.5L419.89 55.28h-62.84V0H512v158.91h-55.28V96.62zM282.66 228.35c-24.1-24.1-57.41-39.02-94.19-39.02s-70.08 14.92-94.18 39.02c-24.1 24.1-39.01 57.4-39.01 94.18 0 36.78 14.91 70.09 39.01 94.19 24.1 24.1 57.4 39.01 94.18 39.01 36.78 0 70.09-14.91 94.19-39.01 24.1-24.1 39.01-57.41 39.01-94.19s-14.91-70.08-39.01-94.18z"
                            />
                        </svg>
                        :
                        <svg
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            imageRendering="optimizeQuality"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            viewBox="0 0 361 511.42"
                            className="info-title__gender-svg"
                        >
                            <path
                                fillRule="nonzero"
                                d="M203.64 359.53v44.17h78.58v52.94h-78.58v54.78H150.7v-54.78H72.13V403.7h78.57v-45.15c-37.91-6.3-71.82-24.41-97.83-50.42C20.21 275.47 0 230.35 0 180.5c0-49.84 20.21-94.97 52.87-127.63S130.65 0 180.5 0c49.84 0 94.97 20.21 127.63 52.87S361 130.66 361 180.5c0 49.84-20.21 94.97-52.87 127.63-27.52 27.52-63.9 46.2-104.49 51.4zM270.7 90.3c-23.08-23.08-54.98-37.36-90.2-37.36-35.23 0-67.12 14.28-90.2 37.36s-37.36 54.98-37.36 90.2c0 35.23 14.28 67.12 37.36 90.2s54.97 37.36 90.2 37.36c35.22 0 67.12-14.28 90.2-37.36s37.36-54.97 37.36-90.2c0-35.22-14.28-67.12-37.36-90.2z"
                            />
                        </svg>
                    }

                    <h2>{userData.name}, {userData.age}</h2>

                </div>
                {userData.images.length > 1 &&
                    <div className="images__point-btns">
                        {userData.images.map((image, index) => {
                            return <div key={image.fileName}
                                className={`images__point-btn ${index === photos && 'images__point-btn--active'}`}>

                            </div>
                        })}
                    </div>}
                {userData.images.length > 1 && <>
                    <button
                        onClick={() => {
                            setPhotos(prev => prev < userData.images.length - 1 ? ++prev : prev)
                        }}
                        className="images__next-photo">
                    </button>
                    <button
                        onClick={() => {
                            setPhotos(prev => prev > 0 ? --prev : prev)
                        }}
                        className="images__prev-photo">
                    </button>
                </>}
                {id !== 0 &&
                    <button
                        onClick={() => { prevCard() }}
                        className="spin-card__prev-btn">
                        <svg
                            className="spin-card__prev-svg"
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            imageRendering="optimizeQuality"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            viewBox="0 0 512 326.85"
                        >
                            <path
                                fillRule="nonzero"
                                d="M204.44 25.35c-.51-10.06-3.9-17.21-10.19-21.36-15.76-10.52-31.28 1.96-42.64 12.06L9.5 143.81c-12.67 11.46-12.67 27.77 0 39.22L148.38 307.9c11.9 10.68 28.78 26.38 45.87 14.98 6.29-4.17 9.68-11.33 10.19-21.38v-76.3h301.23c3.48 0 6.33-2.86 6.33-6.34V107.98c0-3.47-2.86-6.33-6.33-6.33H204.44v-76.3z"
                            />
                        </svg>
                    </button>
                }
            </div>


            <div className="spin-card__city">
                <svg
                    className="spin-card__city-svg"
                    version="1.1"
                    id="Layer_1"
                    x="0px"
                    y="0px"
                    viewBox="0 0 92.25 122.88"
                    xmlSpace="preserve"
                >
                    <g>
                        <path
                            className="st0"
                            d="M68.51,106.28c-5.59,6.13-12.1,11.62-19.41,16.06c-0.9,0.66-2.12,0.74-3.12,0.1 c-10.8-6.87-19.87-15.12-27-24.09C9.14,86.01,2.95,72.33,0.83,59.15c-2.16-13.36-0.14-26.22,6.51-36.67 c2.62-4.13,5.97-7.89,10.05-11.14C26.77,3.87,37.48-0.08,48.16,0c10.28,0.08,20.43,3.91,29.2,11.92c3.08,2.8,5.67,6.01,7.79,9.49 c7.15,11.78,8.69,26.8,5.55,42.02c-3.1,15.04-10.8,30.32-22.19,42.82V106.28L68.51,106.28z M46.12,23.76 c12.68,0,22.95,10.28,22.95,22.95c0,12.68-10.28,22.95-22.95,22.95c-12.68,0-22.95-10.27-22.95-22.95 C23.16,34.03,33.44,23.76,46.12,23.76L46.12,23.76z"
                        />
                    </g>
                </svg>
                <h3 className="spin-card__city-title">{userData.city}</h3>
            </div>
            {Number(userData.description?.length) > 0 &&
                <div className="spin-card__desc">
                    <h5 className='spin-card__desc-title'>About me</h5>
                    {userData.description}
                </div>
            }
            <div className="spin-card__btn-link">
                <button
                    onClick={() => {
                        const params = new URLSearchParams()
                        params.set('userId', String(userData?.userId))
                        router.push(`/chats?${params.toString()}`)
                    }}
                    className="spin-card__chat-link">
                    Send a message
                </button>
            </div>



            <div className="spin-card__vote-btns">
                <button
                    onClick={async () => {
                        await dislike(userData.userId)
                        nextCard()
                    }}
                    className={`spin-card__vote-btn vote-btn__dislike ${isDisliked && 'vote-btn--disliked'}`}>
                    <svg
                        className="vote-btn__dislike-svg"
                        version="1.1"
                        id="Layer_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        x="0px"
                        y="0px"
                        viewBox="0 0 122.88 122.88"
                        xmlSpace="preserve"
                    >
                        <g>
                            <path
                                className="st0"
                                d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0 l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55 c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0 L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"
                            />
                        </g>
                    </svg>

                </button>
                <button
                    onClick={async () => {
                        await like(userData.userId)
                        nextCard()
                    }}
                    className={`spin-card__vote-btn vote-btn__like ${isLiked && 'vote-btn--liked'}`}>
                    <svg
                        className="vote-btn__like-svg"
                        version="1.1"
                        id="Layer_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        x="0px"
                        y="0px"
                        viewBox="0 0 122.88 107.41"
                        xmlSpace="preserve"
                    >
                        <g>
                            <path
                                className="st0"
                                d="M60.83,17.19C68.84,8.84,74.45,1.62,86.79,0.21c23.17-2.66,44.48,21.06,32.78,44.41 c-3.33,6.65-10.11,14.56-17.61,22.32c-8.23,8.52-17.34,16.87-23.72,23.2l-17.4,17.26L46.46,93.56C29.16,76.9,0.95,55.93,0.02,29.95 C-0.63,11.75,13.73,0.09,30.25,0.3C45.01,0.5,51.22,7.84,60.83,17.19L60.83,17.19L60.83,17.19z"
                            />
                        </g>
                    </svg>
                </button>

            </div>

        </div >
    );
}




const LastSpinCard = ({ isLoading }: {
    isLoading: boolean
}) => {

    return (
        <div className="spin-card spin-card__last">
            {!isLoading && <button
                onClick={() => {

                }}
                className="spin-card__subtitle-wrapper">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="122.88px"
                    height="80.593px"
                    viewBox="0 0 122.88 80.593"
                    xmlSpace="preserve"
                    className='spin-card__arrow spin-card__arrow--top'
                >
                    <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                </svg>
                <p className="spin-card__subtitle">Load More</p>
            </button>}

            <div className="spin-card__title">{
                isLoading ?
                    <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        className="spin-card__loading-btn"
                        viewBox="0 0 122.61 122.88"
                    >
                        <title>update</title>
                        <path d="M111.9,61.57a5.36,5.36,0,0,1,10.71,0A61.3,61.3,0,0,1,17.54,104.48v12.35a5.36,5.36,0,0,1-10.72,0V89.31A5.36,5.36,0,0,1,12.18,84H40a5.36,5.36,0,1,1,0,10.71H23a50.6,50.6,0,0,0,88.87-33.1ZM106.6,5.36a5.36,5.36,0,1,1,10.71,0V33.14A5.36,5.36,0,0,1,112,38.49H84.44a5.36,5.36,0,1,1,0-10.71H99A50.6,50.6,0,0,0,10.71,61.57,5.36,5.36,0,1,1,0,61.57,61.31,61.31,0,0,1,91.07,8,61.83,61.83,0,0,1,106.6,20.27V5.36Z" />
                    </svg>



                    : 'That`s all'}</div>

            {!isLoading && <Link href='/chats' className="spin-card__subtitle-wrapper">
                <p className="spin-card__subtitle">Go to chats</p>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="122.88px"
                    height="80.593px"
                    viewBox="0 0 122.88 80.593"
                    xmlSpace="preserve"
                    className='spin-card__arrow spin-card__arrow--bottom'
                >
                    <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                </svg>
            </Link>}



        </div>
    );
}

export default Spin