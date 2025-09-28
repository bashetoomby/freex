"use client"
import Link from 'next/link';
import './registration.css'
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IUserCredentials } from '@/app/interfaces';

const Registration = () => {

    async function restApiRegistration(user: IUserCredentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/registration`, {
            body: JSON.stringify(user),
            method: 'POST',
            headers: {
                "Content-type": "application/json",
            },
            credentials: "include"
        })
        return res
    }

    async function nextApiLogin(data: { token: string }) {
        const nextApiResponse = await fetch('/api/auth/login', {
            body: JSON.stringify({
                isAuth: true,
                token: data.token
            }),
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
        })
        return nextApiResponse
    }

    const router = useRouter()

    const [formErr, setFormErr] = useState<string[]>([])
    const [nicknameErr, setNicknameErr] = useState(false)
    const [passErr, setPassErr] = useState(false)
    const [passReapeatErr, setRepeatPassErr] = useState(false)

    function clearErrors() {
        setFormErr([])
        setNicknameErr(false)
        setPassErr(false)
        setRepeatPassErr(false)
    }

    return (
        <main className="registration">
            <div className="registration__container">
                <div className="registraion__aside">

                    <svg
                        className="registration__logo-svg"
                        viewBox="0 0 128 64"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M 72.681 23.223 C 72.661 22.663 61.671 5.028 60.335 2.86 C 59.645 1.739 59.261 0.849 60.512 0.052 C 62.01 -0.018 67.619 3.107 69.286 3.891 L 96.192 16.795 C 97.992 17.652 101.625 19.073 103.056 20.332 C 104.166 19.482 106.664 16.805 107.957 15.622 C 110.592 13.21 114.265 8.436 118.274 10.413 C 119.491 11.014 126.193 16.762 127.527 18.069 C 128.298 18.824 127.967 20.091 126.888 20.296 C 125.724 20.519 122.32 20.335 120.932 20.332 C 120.98 20.736 112.996 40.871 112.367 42.37 C 111.121 45.354 109.038 43.499 106.379 42.706 L 97.956 40.205 C 95.922 39.602 93.886 38.911 91.796 38.566 C 92.837 39.244 97.368 47.293 98.354 48.907 C 99.166 50.238 104.208 56.403 101.305 57.239 C 98.365 58.086 93.944 58.659 90.823 59.274 L 80.886 61.251 C 78.844 61.663 76.788 62.135 74.729 62.444 C 74.08 62.762 70.398 63.34 69.409 63.533 C 68.181 63.771 64.901 65.145 65.123 62.713 C 65.292 60.876 68.153 55.001 67.96 54.086 L 9.321 54.088 C 6.801 54.088 4.231 54.198 1.717 54.058 C -0.422 53.941 0.232 50.612 0.232 49.071 L 0.235 31.026 C 0.218 21.494 -1.399 23.217 7.76 23.221 L 72.681 23.223 Z M 64.454 4.554 C 65.595 6.594 75.779 22.713 75.751 23.223 L 80.224 23.215 C 80.97 23.213 81.772 23.138 82.51 23.223 C 83.357 23.748 88.501 32.602 88.458 33.095 C 89.21 32.737 95.026 27.672 95.162 27.16 C 95.756 26.804 100.53 22.519 100.772 22.013 C 100.136 21.508 99.135 21.167 98.403 20.817 L 72.86 8.53 C 71.768 8.006 65.198 4.658 64.454 4.554 M 115.712 12.637 C 113.99 13.171 112.571 14.926 111.255 16.128 L 94.93 30.962 C 93.908 31.895 90.936 34.81 89.987 35.256 C 91.167 35.446 99.477 37.745 100.135 38.193 C 101.095 38.394 109.845 40.956 110.03 41.113 C 110.74 40.177 111.429 37.774 111.885 36.592 C 112.711 34.444 118.352 19.338 119.357 18.057 C 119.897 17.369 122.186 17.702 122.927 17.703 C 122.743 17.193 117.633 12.362 115.712 12.637 M 2.747 25.845 L 2.747 51.429 L 82.51 51.429 C 82.317 51.019 72.49 40.684 71.997 40.465 C 71.57 41.376 66.901 47.234 64.811 46.3 C 63.651 42.869 69.586 40.928 70.19 38.566 C 69.692 37.407 65.664 34.516 64.764 32.85 C 64.155 31.721 65.211 30.423 66.392 30.872 C 66.857 31.05 71.873 36.212 71.997 36.648 C 72.388 36.406 81.338 27.127 81.607 26.601 C 81.578 26.338 81.411 25.989 81.192 25.844 L 2.747 25.845 Z M 82.882 29.071 C 82.701 29.456 74.193 38.327 73.717 38.565 C 74.532 39.064 84.355 49.622 84.427 49.883 C 86.546 50.367 88.731 51.306 90.893 51.429 C 93.056 52.189 96.274 52.829 98.149 53.643 C 97.9 52.287 89.269 38.97 87.858 36.705 L 84.856 31.818 C 84.31 30.924 83.788 29.957 83.151 29.132 L 82.882 29.071 Z M 86.142 53.122 C 85.82 54.785 79.205 54.045 77.858 54.086 C 77.678 54.494 71.745 60.156 71.19 60.434 C 73.855 60.018 76.576 59.107 79.257 58.981 C 84.436 57.481 90.284 56.803 95.589 55.689 C 94.772 55.311 86.715 53.067 86.142 53.122 M 70.613 54.086 C 70.676 54.872 69.449 58.404 68.878 58.981 C 69.286 58.753 70.769 57.549 70.901 57.114 C 71.53 56.751 73.935 54.732 74.104 54.086 C 73.006 54.076 71.686 53.912 70.613 54.086" />
                        <path d="M 10.097 40.162 C 10.093 41.539 10.524 45.206 9.686 46.05 C 6.847 48.912 7.593 39.958 7.593 39.401 L 7.593 34.713 C 7.595 33.278 7.231 31.875 8.396 30.877 C 9.989 30.704 16.131 30.711 17.592 30.929 C 18.898 31.126 19.043 33.284 17.7 33.523 C 16.885 33.67 15.952 33.581 15.119 33.583 L 10.097 33.577 L 10.097 37.518 C 11.694 37.529 16.034 36.859 17.085 38.193 C 17.787 40.491 15.067 40.192 13.735 40.18 L 10.097 40.162 Z" />
                        <path d="M 24.057 41.562 C 24.024 42.667 24.46 45.309 23.592 46.126 C 20.411 49.115 21.445 37.312 21.445 36.429 C 21.445 34.622 20.809 31.902 22.261 30.877 C 24 30.746 27.992 30.711 29.621 31.324 C 34.305 33.076 34.671 38.904 29.868 41.113 C 30.869 42.138 32.223 43.149 33.028 44.332 C 33.877 45.577 32.659 46.608 31.483 46.3 C 30.167 45.306 28.056 42.837 26.804 41.56 L 24.057 41.562 Z M 24.057 33.577 L 24.057 38.929 C 25.865 38.938 28.335 39.302 29.868 38.193 C 30.948 37.079 31.066 35.674 29.929 34.52 C 28.581 33.15 25.822 33.56 24.057 33.577" />
                        <path d="M 39.311 43.612 C 40.964 43.607 47.051 43.156 47.865 44.287 C 50.23 47.569 38.339 46.368 37.72 46.248 C 36.048 45.916 36.809 39.807 36.807 38.257 C 36.804 36.404 36.056 32.002 37.688 30.877 C 39.621 30.766 47.936 30.213 47.984 32.133 C 48.03 34.077 45.43 33.591 44.25 33.588 L 39.311 33.577 L 39.311 37.279 C 40.913 37.279 46.191 36.588 46.404 38.37 C 46.688 40.745 40.856 39.871 39.311 39.864 C 39.221 41.086 39.308 42.382 39.311 43.612" />
                        <path d="M 53.365 43.612 C 55.017 43.618 59.98 43.395 61.248 43.708 C 62.729 44.076 62.303 46.219 60.859 46.313 C 59.786 46.383 52.235 46.384 51.638 46.189 C 50.181 45.711 50.817 40.376 50.818 39.092 C 50.821 37.043 49.983 31.846 51.795 30.877 L 61.306 30.877 C 61.737 31.168 62.171 31.531 62.193 32.119 C 62.274 34.085 59.674 33.591 58.491 33.587 L 53.365 33.577 C 53.348 34.81 53.365 36.046 53.365 37.279 C 54.947 37.282 60.58 36.622 60.595 38.588 C 60.615 40.818 54.873 39.861 53.366 39.864 L 53.365 43.612 Z" />
                    </svg>
                    <h3 className="registration__title">Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, hic!</h3>
                </div>
                <form
                    autoComplete='off'
                    onChange={clearErrors}
                    className='registration__form'
                    action={async (formData):Promise<void> => {

                        if (String(formData.get('password')) !== String(formData.get('reapeat-password'))) {
                            setFormErr([...formErr, 'Password mismatch'])
                            setRepeatPassErr(true)
                            return 
                        }

                        const user = {
                            nickname: String(formData.get('nickname')),
                            password: String(formData.get('password'))
                        }
                        const restApiResponse = await restApiRegistration(user)

                        if (restApiResponse.status === 201) {
                            const json = await restApiResponse.json()
                            const apiResponse = await nextApiLogin(json)
                            if (apiResponse.status === 201) router.refresh()
                        }
                        else if (restApiResponse.status === 406) {
                            const err: string[] = await restApiResponse.json()
                            setFormErr([...err])
                            if (err.includes('nickname - No less than four and no more than twelve')) setNicknameErr(true)
                            if (err.includes('password - No less than four and no more than sixteen')) setPassErr(true)
                        }
                        else if (restApiResponse.status === 409) {
                            setNicknameErr(true)
                            setFormErr(['User with this nickname already exist'])
                        }
                    }}
                >
                    <h3 className="form__title">Registration</h3>

                    <div className="input-field registration__input-field">
                        <input
                            type="text"
                            className={nicknameErr ? "input registration__input-err registration__input" : 'input registration__input'}
                            id='nickname'
                            name="nickname"
                            placeholder=' '
                            required
                        />

                        <label
                            htmlFor="nickname"
                            className={nicknameErr ? "input-label registration__input-label-err" : 'input-label'}
                        >
                            nickname
                        </label>
                    </div>



                    <div className="input-field registration__input-field">
                        <input
                            type="password"
                            className={passErr ? "input registration__input-err registration__input" : 'input registration__input'}
                            id='password'
                            name="password"
                            placeholder=' '
                            required
                        />

                        <label
                            htmlFor="password"
                            className={passErr ? "input-label registration__input-label-err" : 'input-label '}
                        >
                            Password
                        </label>
                    </div>



                    <div className="input-field registration__input-field">
                        <input
                            type="password"
                            className={passReapeatErr ? "input registration__input-err registration__input" : 'input registration__input'}
                            id='reapeat-password'
                            name="reapeat-password"
                            placeholder=' '
                            required
                        />

                        <label
                            htmlFor="reapeat-password"
                            className={passReapeatErr ? "input-label registration__input-label-err" : 'input-label '}
                        >
                            Repeat password
                        </label>
                    </div>



                    <button className="registration__sibmit-btn">
                        Sign In
                    </button>

                    {formErr.map((err, index) => {
                        return (
                            <strong className='auth__err' key={index}>
                                · {err}
                            </strong>
                        )
                    })}


                    <hr className='registration__decoration-line' />

                    <Link href="/auth/login" className='registration__link-login'>
                        Log In
                    </Link>
                </form>
            </div>
        </main>
    );
}

export default Registration;