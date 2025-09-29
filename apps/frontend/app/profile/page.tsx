"use client"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import './userdata.css'

import { refreshToken, requestWrapper } from '@/functions/api/api'
import { IAuthInfo, IImages, IUserDataDto } from '../interfaces'
import { useRouter } from 'next/navigation'
import { useSession } from '@/providers/SessionProviders'
import { useNotifications } from '@/providers/NotificationProvider'









async function getUserDataRequest(authInfo: IAuthInfo) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/get-user-data`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}
async function setUserDataRequest(authInfo: IAuthInfo, data: IUserDataDto) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/set-data`, {
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




const Profile = () => {

    const router = useRouter()
    const session = useSession()

    const [isLoading, setIsloading] = useState(true)
    const [genderChecked, setGenderChecked] = useState('')
    const [inputName, setInputName] = useState('')
    const [inputAge, setInputAge] = useState<number | null>(null)
    const [inputCity, setInputCity] = useState('')
    const [inputDesc, setInputDesc] = useState('')
    const [images, setImages] = useState<IImages[]>([])
    const [isLoadingGeo, setIsLoadingGeo] = useState(false)
    const [isSavedGeo, setIsSavedGeo] = useState(false)
    const [isUserDataSaved, setIsUserDataSaved] = useState(false)
    const { notification, setNotification } = useNotifications()

    const descInputRef = useRef<HTMLDivElement>(null)



    const geolocation = navigator.geolocation

    useEffect(() => {
        if (isSavedGeo) setTimeout(() => { setIsSavedGeo(false) }, 1000)
    }, [isSavedGeo])

    useEffect(() => {
        async function setData() {

            await requestWrapper(getUserDataRequest, async (res: Response) => {
                try {
                    const data = await res.json()
                    setGenderChecked(data.gender || '');
                    setInputName(data.name || '')
                    setInputAge(data.age || null)
                    setInputCity(data.city || '')
                    setInputDesc(data.description || '')
                    setImages(data.images || [])
                    setIsloading(false)
                } catch (error) {
                    console.log(error);
                }
            }, () => { })

        }
        setData()

    }, [])

    useEffect(() => {
        if (isUserDataSaved) setTimeout(() => { setIsUserDataSaved(false) }, 1000)
    }, [isUserDataSaved])

    return (
        <main className="userdata">
            <div className="userdata__container">
                <button
                    disabled={isLoading}
                    className={`userdata__geo-btn ${isLoadingGeo && 'btn-loading'} ${isSavedGeo && 'btn-loaded'}`}
                    onClick={async () => {
                        if (!isLoading) geolocation.getCurrentPosition(async (position) => {

                            let latitude = position.coords.latitude;
                            let longitude = position.coords.longitude;
                            let coord = latitude + ' ' + longitude
                            setIsLoadingGeo(true)
                            await requestWrapper(setUserDataRequest, async (res) => {
                                const { fullfield } = await res.json()
                                if (session && !session.userdata.fullfield && fullfield) {
                                    if (notification?.message === 'To continue, please fill in all required fields.') {
                                        setNotification(null)
                                    }
                                    await refreshToken()
                                    // router.refresh()
                                }
                                setIsSavedGeo(true)
                            }, () => { }, { location: coord })
                            setIsLoadingGeo(false)

                        }, (e) => {
                            console.log(e.code);
                        })
                    }}
                >
                    <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        className='geo-btn__svg'
                        viewBox="0 0 92.53 122.88"
                    >
                        <defs>
                            <style dangerouslySetInnerHTML={{ __html: ".cls-1{fill-rule:evenodd;}" }} />
                        </defs>
                        <path
                            className="cls-1"
                            d="M46.27,24.08A22.75,22.75,0,1,1,23.52,46.83,22.75,22.75,0,0,1,46.27,24.08Zm1.36,91.62A82.87,82.87,0,0,0,64,101.81,85.44,85.44,0,0,0,84.56,62.23c2.81-13.67,1.5-27-4.75-37.34a36.74,36.74,0,0,0-6.63-8.06C65.62,9.93,57,6.64,48.23,6.56,39.07,6.49,29.77,10,21.55,16.5a38.54,38.54,0,0,0-8.63,9.56C7.15,35.15,5.41,46.43,7.31,58.24c1.94,12,7.66,24.61,16.77,36A102.46,102.46,0,0,0,47.63,115.7Zm21.24-9.46a89.32,89.32,0,0,1-19.33,16,3.28,3.28,0,0,1-3.71.13,109.25,109.25,0,0,1-26.9-24c-9.8-12.31-16-26-18.1-39.1C-1.33,45.89.7,33,7.36,22.53a45.3,45.3,0,0,1,10.1-11.18C26.85,3.87,37.6-.09,48.29,0,58.6.09,68.79,3.92,77.6,12a43.1,43.1,0,0,1,7.82,9.52c7.15,11.8,8.71,26.83,5.57,42.05a92.2,92.2,0,0,1-22.12,42.7Z"
                        />
                    </svg>
                    Update geolocation
                </button>


                <ImageBox images={images} setImages={setImages} />


                <Input
                    isUserDataSaved={isUserDataSaved}
                    isLoading={isLoading}
                    inputLabel='gender'
                    inputTitle='Gender'
                    inputValue={genderChecked}
                    required={true}>
                    <>
                        <label htmlFor="gender-man" className='gender-label'>
                            <svg
                                shapeRendering="geometricPrecision"
                                textRendering="geometricPrecision"
                                imageRendering="optimizeQuality"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                viewBox="0 0 512 511.01"
                                className={`gender-svg ${genderChecked === 'man' && 'gender-svg--active'} `}
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
                                className='gender-input'
                                value='man'
                                checked={genderChecked === 'man'}
                            />
                            Man
                        </label>

                        <label htmlFor="gender-woman" className='gender-label'>
                            <svg
                                shapeRendering="geometricPrecision"
                                textRendering="geometricPrecision"
                                imageRendering="optimizeQuality"
                                fillRule="evenodd"
                                clipRule="evenodd"
                                viewBox="0 0 361 511.42"
                                className={`gender-svg ${genderChecked === 'woman' && 'gender-svg--active'} `}
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
                                className='gender-input'
                                value='woman'
                                checked={genderChecked === 'woman'}
                            />
                            Woman
                        </label>
                    </>
                </Input>

                <Input
                    isUserDataSaved={isUserDataSaved}
                    isLoading={isLoading}
                    inputLabel='name'
                    inputTitle='Name'
                    inputValue={inputName}
                    required={true}>
                    <input
                        className={`userdata__input`}
                        type="text"
                        name='name'
                        id='name'
                        maxLength={15}
                        value={inputName}
                        onChange={(e) => { setInputName(e.currentTarget.value) }}
                    />
                </Input>

                <Input
                    isUserDataSaved={isUserDataSaved}
                    isLoading={isLoading}
                    inputLabel='age'
                    inputTitle='Age'
                    inputValue={inputAge || ''}
                    required={true}
                >
                    <input
                        className={`userdata__input`}
                        type="number"
                        name='age'
                        min={18}
                        max={99}
                        id='age'
                        value={inputAge ?? ''}
                        onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value);
                            setInputAge(value || Number(''))
                        }}

                    />
                </Input>


                <Input
                    isUserDataSaved={isUserDataSaved}
                    isLoading={isLoading}
                    inputLabel='city'
                    inputTitle='City'
                    inputValue={inputCity}
                    required={true}>
                    <input
                        className={`userdata__input`}
                        type="text"
                        name='city'
                        id='city'
                        maxLength={15}
                        value={inputCity}
                        onChange={(e) => { setInputCity(e.currentTarget.value) }}
                    />
                </Input>

                <Input
                    isUserDataSaved={isUserDataSaved}
                    inputLabel='description'
                    inputTitle='Description'
                    inputValue={inputDesc}
                    isLoading={isLoading}
                    required={false}
                >
                    <>
                        <div
                            ref={descInputRef}
                            suppressContentEditableWarning={true}
                            className='userdata__input'
                            contentEditable="true"
                            onBlur={(e) => setInputDesc(e.currentTarget.textContent || '')}
                        >
                            {inputDesc}
                        </div>
                        <input
                            id='description'
                            type="text"
                            className='content-edit'
                            name='description'
                            value={inputDesc || ''}
                            readOnly
                        />
                    </>
                </Input>

                <button
                    disabled={isLoading}
                    onClick={async () => {
                        setIsloading(true)
                        await requestWrapper(setUserDataRequest, async (res) => {
                            if (res.status === 200) {
                                setIsUserDataSaved(true)
                                const { fullfield } = await res.json()
                                if (session && !session.userdata.fullfield && fullfield) {
                                    if (notification?.message === 'To continue, please fill in all required fields.') {
                                        setNotification(null)
                                    }
                                    await refreshToken()
                                }
                            }
                        }, () => { }, {
                            age: inputAge,
                            city: inputCity,
                            description: inputDesc,
                            gender: genderChecked,
                            name: inputName,
                        })
                        setIsloading(false)
                    }}
                    className={`userdata__save-all ${isUserDataSaved && 'userdata__save-all--saved'}`}>
                    Save All
                </button>

            </div>
        </main >
    );
}




////////////////////////////////////////////////

async function setPhotoRequest(authInfo: IAuthInfo, data: File) {
    const formData = new FormData()
    formData.append('profileImage', data)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/set-image`, {
        body: formData,
        method: 'POST',
        headers: {
            'authorization': `Bearer ${authInfo.token}`,
        },
        credentials: "include"
    })
    return res
}
async function deleteImageRequest(authInfo: IAuthInfo, fileName: string) {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/delete-image`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authInfo.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: fileName }),
        credentials: "include"
    });
    return res;
}

const ImageBox = ({ images, setImages }: { images: IImages[], setImages: Dispatch<SetStateAction<IImages[]>> }) => {

    const [newImage, setNewImage] = useState<File | null>(null)
    const [newImageUrl, setNewImageUrl] = useState<string | null>()
    const [frontPhoto, setFrontPhoto] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (newImage) {
            const url = URL.createObjectURL(newImage);
            setNewImageUrl(url);
            setFrontPhoto(images.length)
            return () => {
                URL.revokeObjectURL(url);
            };
        }
        else setNewImageUrl(null)
    }, [newImage])


    useEffect(() => {
        if (isSaved) setTimeout(() => { setIsSaved(false) }, 1000)
    }, [isSaved])


    return (
        <article className="image-article">
            <div
                className="image-box"
                style={{
                    zIndex: images.length
                }}
            >

                {images.map((image, index) => {

                    let scale = Math.pow(0.8, (index - frontPhoto < 0 ? (index - frontPhoto) * -1 : index - frontPhoto))
                    let offset = 100 - (scale * 100)
                    if (index - frontPhoto < 0) {
                        offset = -1 * offset
                    }
                    let zIndex = images.length - index
                    if (index - frontPhoto === 0) zIndex = images.length
                    if (index - frontPhoto < 0) zIndex = index - frontPhoto
                    return <div
                        style={
                            {
                                left: offset + '%',
                                transform: `scale(${scale})`,
                                zIndex: zIndex,
                            }}
                        className='image-box__image-wrapper'
                        key={index}
                    >
                        <img src={process.env.NEXT_PUBLIC_API_URL + '/images/' + image.fileName} className="image-box__image" />
                        {
                            frontPhoto === index &&
                            <button
                                onClick={async () => {
                                    const result = confirm('Delete this photo?')
                                    if (result) await requestWrapper(deleteImageRequest, async (res) => {
                                        if (res.status === 200) {
                                            try {
                                                const json: { fileName: string } = await res.json()
                                                setImages([...images.filter((image) => image.fileName !== json.fileName)])
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        }
                                    }, () => { }, image.fileName)
                                }}
                                className='image__delete-btn'
                            >
                                <svg
                                    className='image__delete-svg'
                                    version="1.1"
                                    id="Layer_1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    viewBox="0 0 122.88 122.88"
                                    xmlSpace="preserve"
                                >
                                    <style
                                        type="text/css"
                                        dangerouslySetInnerHTML={{
                                            __html: ".st0{fill-rule:evenodd;clip-rule:evenodd;}"
                                        }}
                                    />
                                    <g>
                                        <path
                                            className="st0"
                                            d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0 l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55 c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0 L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"
                                        />
                                    </g>
                                </svg>
                            </button>
                        }
                    </div>
                })}


                <div
                    onClick={() => {
                        if (!newImage) fileInputRef.current?.click()
                    }}
                    style={{
                        cursor: newImageUrl ? 'default' : 'pointer',
                        left: 100 - (Math.pow(0.8, (images.length - frontPhoto < 0 ? (images.length - frontPhoto) * -1 : images.length - frontPhoto)) * 100) + '%',
                        transform: `scale(${Math.pow(0.8, (images.length - frontPhoto < 0 ? (images.length - frontPhoto) * -1 : images.length - frontPhoto))})`,
                        zIndex: 0,
                    }}
                    className="image-box__image-wrapper image-box__image-attach">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files && e.target.files[0]) {
                                setNewImage(e.target.files[0]);
                            }
                        }}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                    />
                    {newImageUrl ?
                        <img
                            className='image-box__image'
                            src={newImageUrl}
                        />
                        : <>
                            <h2>

                                Click here to upload photo
                            </h2>
                            <svg
                                className='image-attach__svg'
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 122.88 90.78"
                                xmlSpace="preserve"
                            >
                                <style
                                    type="text/css"
                                    dangerouslySetInnerHTML={{
                                        __html: ".st0{fill-rule:evenodd;clip-rule:evenodd;}"
                                    }}
                                />
                                <g>
                                    <path
                                        className="st0"
                                        d="M46.86,0.05h43.63l9.94,17.7h20.48c1.09,0,1.98,0.92,1.98,1.98v69.08c0,1.06-0.91,1.98-1.98,1.98H1.98 C0.92,90.78,0,89.89,0,88.81l0-69.08c0-1.09,0.89-1.98,1.98-1.98h9.21V11.4h11.38v6.35h12.36c2.57-5.08,5.14-10.15,7.71-15.23 C44.2-0.57,43.34,0.05,46.86,0.05L46.86,0.05z M110.07,26.5c3.26,0,5.9,2.64,5.9,5.9c0,3.26-2.64,5.9-5.9,5.9 c-3.26,0-5.9-2.64-5.9-5.9C104.18,29.14,106.82,26.5,110.07,26.5L110.07,26.5L110.07,26.5z M66.64,33.37 c9.87,0,17.88,8.01,17.88,17.88c0,9.87-8.01,17.88-17.88,17.88c-9.87,0-17.88-8.01-17.88-17.88 C48.76,41.38,56.77,33.37,66.64,33.37L66.64,33.37z M66.64,21.73c16.31,0,29.53,13.22,29.53,29.53c0,16.3-13.22,29.53-29.53,29.53 c-16.3,0-29.53-13.23-29.53-29.53C37.12,34.95,50.34,21.73,66.64,21.73L66.64,21.73z"
                                    />
                                </g>
                            </svg>
                        </>

                    }
                    {
                        newImage && frontPhoto === images.length &&
                        <button
                            className='image__delete-btn'
                            onClick={() => {
                                setNewImage(null)
                            }}
                        >
                            <svg
                                className='image__delete-svg'
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 122.88 122.88"
                                xmlSpace="preserve"
                            >
                                <style
                                    type="text/css"
                                    dangerouslySetInnerHTML={{
                                        __html: ".st0{fill-rule:evenodd;clip-rule:evenodd;}"
                                    }}
                                />
                                <g>
                                    <path
                                        className="st0"
                                        d="M1.63,97.99l36.55-36.55L1.63,24.89c-2.17-2.17-2.17-5.73,0-7.9L16.99,1.63c2.17-2.17,5.73-2.17,7.9,0 l36.55,36.55L97.99,1.63c2.17-2.17,5.73-2.17,7.9,0l15.36,15.36c2.17,2.17,2.17,5.73,0,7.9L84.7,61.44l36.55,36.55 c2.17,2.17,2.17,5.73,0,7.9l-15.36,15.36c-2.17,2.17-5.73,2.17-7.9,0L61.44,84.7l-36.55,36.55c-2.17,2.17-5.73,2.17-7.9,0 L1.63,105.89C-0.54,103.72-0.54,100.16,1.63,97.99L1.63,97.99z"
                                    />
                                </g>
                            </svg>
                        </button>
                    }
                </div>



                {
                    frontPhoto !== 0 &&
                    <button
                        onClick={() => {
                            if (frontPhoto > 0) setFrontPhoto(prev => --prev)
                        }}
                        className="image-box__prev-btn">
                        <svg
                            className='image-box__arrow-svg'
                            id="Layer_1"
                            data-name="Layer 1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 122.88 108.06"
                        >
                            <path d="M58.94,24.28a14.27,14.27,0,0,1,20.35-20l39.49,40.16a14.28,14.28,0,0,1,0,20L80.09,103.79a14.27,14.27,0,1,1-20.35-20L74.82,68.41l-60.67-.29a14.27,14.27,0,0,1,.24-28.54l59.85.28L58.94,24.28Z" />
                        </svg>
                    </button>
                }
                {
                    frontPhoto !== images.length &&
                    <button
                        onClick={() => {
                            if (frontPhoto < images.length) setFrontPhoto(prev => ++prev)
                        }}
                        className="image-box__next-btn">
                        <svg
                            className='image-box__arrow-svg'
                            id="Layer_1"
                            data-name="Layer 1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 122.88 108.06"
                        >
                            <path d="M58.94,24.28a14.27,14.27,0,0,1,20.35-20l39.49,40.16a14.28,14.28,0,0,1,0,20L80.09,103.79a14.27,14.27,0,1,1-20.35-20L74.82,68.41l-60.67-.29a14.27,14.27,0,0,1,.24-28.54l59.85.28L58.94,24.28Z" />
                        </svg>
                    </button>
                }

            </div >

            <button
                disabled={isLoading}
                className={`image-article__load-btn ${isLoading && 'btn-loading'} ${isSaved && 'btn-loaded'}`}
                onClick={async () => {
                    if (!newImage && !newImageUrl) {
                        fileInputRef.current?.click()
                    }

                    if (newImage && newImageUrl) {
                        setIsLoading(true)
                        await requestWrapper(setPhotoRequest, async (res) => {
                            if (res.status === 201) {
                                try {
                                    const json: { fileName: string } = await res.json()
                                    setImages([...images, { fileName: json.fileName }])

                                    setNewImage(null)
                                    setIsSaved(true)
                                } catch (error) {

                                }

                            }
                        }, () => { }, newImage)
                        setIsLoading(false)
                    }
                }}
            >
                {newImage && newImageUrl ? 'Save Photo' : 'Upload Photo'}
            </button>
        </article>
    );
}



/////////////////////////

const Input = (
    {
        children,
        isLoading,
        inputValue,
        required,
        inputTitle,
        inputLabel,
        isUserDataSaved
    }: {
        children: React.ReactNode
        isLoading: boolean,
        inputValue: string | number,
        required: boolean,
        inputTitle: string,
        inputLabel: string,
        isUserDataSaved: boolean
    }) => {
    const [isUploading, setIsUploading] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const session = useSession()

    const { notification, setNotification } = useNotifications()
    useEffect(() => {
        (async () => {
            if (isSaved) {
                setTimeout(() => {
                    setIsSaved(false)
                }, 1000)
            }
        })()
    }, [isSaved])

    useEffect(() => {
        setIsUploading(isLoading)
    }, [isLoading])

    return (
        <form
            onSubmit={() => {
                if (String(inputValue).length !== 0) setIsUploading(true)
            }}
            action={async () => {
                if (String(inputValue).length !== 0) {
                    await requestWrapper(setUserDataRequest, async (res) => {
                        if (res.status === 200) setIsSaved(true)
                        const { fullfield } = await res.json()
                        if (session && !session.userdata.fullfield && fullfield) {
                            if (notification?.message === 'To continue, please fill in all required fields.') {
                                setNotification(null)
                            }
                            await refreshToken()
                            // router.refresh()
                        }
                    }, () => { }, { [inputLabel]: inputValue })

                    setIsUploading(false)
                }

            }}
            className='userdata__form'>
            <h2 className="userdata__form-title">
                {required && <span className='red-star'>*</span>}{inputTitle}
            </h2>

            <div className={`userdata__input-field ${isSaved && 'userdata__input-field--saved'}`}>
                {children}



                {(isUploading || isLoading)
                    &&
                    <div className="skeleton">
                        <div className="skeleton__span">

                        </div>
                    </div>
                }
            </div>

            <button className={`userdata__save-btn `
                + `${(isSaved || isUserDataSaved) && 'userdata__save-btn--saved'} `
                + `${isUploading && 'userdata__save-btn--uploading'} `
            } disabled={isUploading || isLoading}>
                <svg
                    className={`save-btn__svg ${(isSaved || isUserDataSaved) && 'save-btn__svg--saved'}`}
                    x="0px"
                    y="0px"
                    width="122.877px"
                    height="101.052px"
                    viewBox="0 0 122.877 101.052"
                    enableBackground="new 0 0 122.877 101.052"
                    xmlSpace="preserve"
                >
                    <g>
                        <path d="M4.43,63.63c-2.869-2.755-4.352-6.42-4.427-10.11c-0.074-3.689,1.261-7.412,4.015-10.281 c2.752-2.867,6.417-4.351,10.106-4.425c3.691-0.076,7.412,1.255,10.283,4.012l24.787,23.851L98.543,3.989l1.768,1.349l-1.77-1.355 c0.141-0.183,0.301-0.339,0.479-0.466c2.936-2.543,6.621-3.691,10.223-3.495V0.018l0.176,0.016c3.623,0.24,7.162,1.85,9.775,4.766 c2.658,2.965,3.863,6.731,3.662,10.412h0.004l-0.016,0.176c-0.236,3.558-1.791,7.035-4.609,9.632l-59.224,72.09l0.004,0.004 c-0.111,0.141-0.236,0.262-0.372,0.368c-2.773,2.435-6.275,3.629-9.757,3.569c-3.511-0.061-7.015-1.396-9.741-4.016L4.43,63.63 L4.43,63.63z" />
                    </g>
                </svg>
            </button>
        </form>
    );
}



export default Profile;


