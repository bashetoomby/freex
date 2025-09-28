"use client"

import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import "./Chats.css"
import { requestWrapper } from "@/functions/api/api";
import { IAuthInfo, IChat, IMessage, IUserData } from './../interfaces';
import { useSession } from "@/providers/SessionProviders";
import { useSocket } from "@/providers/SocketProvider";
import { useDebounceAsync } from "@/hooks/useDebounceAsync";
import { useRouter, useSearchParams } from "next/navigation";


enum chatEvent {
    addMessage = 'addMessage',
    switchChat = 'switchChat'
}


function addDayDataToMessages(messages: IMessage[]) {
    const newMessages: IMessage[] = []
    newMessages.push({
        chatId: '',
        updatedAt: '',
        id: -1,
        status: '',
        createdAt: 'date',
        messageType: 'system',
        systemType: 'date',
        userId: null,
        message: `${new Date(messages[0]?.createdAt).toLocaleString('default', { month: 'long' })} ${new Date(messages[0]?.createdAt).getDate()}`,
        repliedTo: null,
    })
    for (let i = 0; i < messages.length - 1; i++) {
        const messageDateA = new Date(messages[i].createdAt)
        const messageDateB = new Date(messages[i + 1].createdAt)
        newMessages.push(messages[i])
        if (messageDateB.getDate() - messageDateA.getDate() > 0
            || messageDateB.getMonth() - messageDateA.getMonth() > 0
            || messageDateB.getFullYear() - messageDateA.getFullYear() > 0
        ) {
            newMessages.push({
                chatId: '',
                updatedAt: '',
                id: -1,
                status: '',
                createdAt: messages[i].createdAt + 'date',
                messageType: 'system',
                systemType: 'date',
                userId: null,
                repliedTo: null,
                message: `${new Date(messages[i + 1]?.createdAt).toLocaleString('default', { month: 'long' })} ${new Date(messages[i + 1]?.createdAt).getDate()}`,
            })
        }
    }
    newMessages.push(messages[messages.length - 1])
    return newMessages
}
function formatDate(date: Date): string {
    const now = new Date();
    const inputDate = new Date(date);

    if (
        inputDate.getDate() === now.getDate() &&
        inputDate.getMonth() === now.getMonth() &&
        inputDate.getFullYear() === now.getFullYear()
    ) {
        return `${inputDate.getHours().toString().padStart(2, '0')}:${inputDate.getMinutes().toString().padStart(2, '0')}`;
    }

    if (inputDate.getFullYear() === now.getFullYear()) {
        return `${inputDate.getDate().toString().padStart(2, '0')}/${(inputDate.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    return `${inputDate.getDate().toString().padStart(2, '0')}/${(inputDate.getMonth() + 1).toString().padStart(2, '0')}/${inputDate.getFullYear()}`;
}

async function getChatsApi(authInfo: IAuthInfo) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/get`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}
async function sendMessage(authInfo: IAuthInfo, data: { userId: number, message: string, repliedToId?: number }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send-message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'authorization': `Bearer ${authInfo.token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res
}

function sortChatsByLastMessage(chats: IChat[]) {
    return chats.sort((chatA, chatB) => {
        return Date.parse(chatB.messages.at(-1)?.createdAt || '') - Date.parse(chatA.messages.at(-1)?.createdAt || '')
    })
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


const Chats = () => {
    const { socket, isConnected } = useSocket();
    const session = useSession();
    const searchParams = useSearchParams()
    const router = useRouter()

    const [isMobile, setIsMobile] = useState(true)
    const [replyMessage, setReplyMessage] = useState<IMessage | null>(null)
    const [isHighlightedMessageId, setIsHighlightedMessageId] = useState<number>(-1)
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [spamList, setSpamList] = useState(false)
    const [chats, setChats] = useState<IChat[]>([])
    const [inputValue, setInputValue] = useState('')
    const [activeChat, setActiveChat] = useState<IChat>({
        chatId: '',
        chatType: 'spam',
        createdAt: '',
        id: -1,
        messages: [],
        updatedAt: '',
        userId1: -1,
        userId2: -1,
    })

    const inputRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const previousChatId = useRef<string | null>(null);

    const unreadMessageIdsRef = useRef<Set<number>>(new Set());


    function addMessageAndUpdateState(data: { chat: IChat, message: IMessage }, eventType: string) {
        if (previousChatId.current === data.chat.chatId) {

            setActiveChat((prevActiveChat) => ({
                ...prevActiveChat,
                messages: [...prevActiveChat.messages, data.message],
                event: chatEvent.addMessage,
                chatType: data.chat.chatType
            }))
            setSpamList(data.chat.chatType === 'spam')


        }
        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.chatId === data.chat.chatId) {
                    return { ...chat, messages: [...chat.messages, data.message], lastEventType: eventType, chatType: data.chat.chatType }
                }
                else return chat
            })
        )

    };

    function updateMessagesStatus(messages: IMessage[], eventType: string) {
        if (previousChatId.current === messages[0].chatId) {
            setActiveChat((prevActiveChat) => ({
                ...prevActiveChat,
                messages: prevActiveChat.messages.map((message) => {
                    const matchMessage = messages.find(msg => msg.id === message.id)
                    return matchMessage ? matchMessage : message
                }),
                event: '',
            }))
        }
        setChats((prevChats) =>
            prevChats.map((chat) => {
                if (chat.chatId === messages[0].chatId) {
                    return {
                        ...chat, messages: chat.messages.map((message) => {
                            const matchMessage = messages.find(msg => msg.id === message.id)
                            return matchMessage ? matchMessage : message
                        }), lastEventType: eventType
                    }
                }
                else return chat
            })
        )
    }
    // updateMessageStatus
    const updateMessageStatusApi = useCallback(async (idSet: Array<number>) => {

        if (idSet.length > 0) {
            requestWrapper(async (authInfo) => {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/update-message-status`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        "authorization": `Bearer ${authInfo.token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify(idSet)
                })
                return res
            }, async (res) => {
                try {
                    const messages: IMessage[] = await res.json()
                    unreadMessageIdsRef.current = new Set()
                    updateMessagesStatus(messages, 'updateMessagesStatus')
                } catch (error) {
                    console.log(error);
                }

            }, () => { })
        }





    }, []);

    const debouncedSend = useDebounceAsync(updateMessageStatusApi, 500);

    const addToUnreadVisibleMessages = useCallback((id: number) => {

        unreadMessageIdsRef.current.add(id);

        debouncedSend(Array.from(unreadMessageIdsRef.current));
    }, [debouncedSend]);


    useEffect(() => {


        async function getChats() {
            await requestWrapper(getChatsApi, async (res) => {
                if (res.status === 200) {
                    const chats: IChat[] = await res.json()
                    const userId = searchParams.get('userId')
                    const newSearchParams = new URLSearchParams(searchParams.toString())
                    newSearchParams.delete('userId')
                    router.replace(`?${newSearchParams.toString()}`, { scroll: false })

                    if (userId) {

                        const chat = chats.find(chat => chat.chatId === `${session?.userdata.id}-${userId}` || chat.chatId === `${userId}-${session?.userdata.id}`)
                        if (chat) {
                            if (chat?.chatType === 'spam') setSpamList(true)
                            setChats([...chats])
                            setActiveChat({ ...chat, event: chatEvent.switchChat })
                        }
                        else {
                            await requestWrapper(getUserDataById, async (res) => {
                                if (res.status === 201) {
                                    const userData = await res.json()
                                    const newChat = {
                                        chatId: `${session?.userdata.id}-${userId}`,
                                        chatType: 'spam',
                                        createdAt: '',
                                        id: -2,
                                        messages: [],
                                        updatedAt: '',
                                        userId1: Number(session?.userdata.id),
                                        userId2: Number(userId),
                                        userData: userData,

                                    }
                                    setChats([newChat, ...chats])
                                    setActiveChat(newChat)
                                    setChats([newChat, ...chats])
                                    setSpamList(true)
                                }

                            }, () => { }, { userId: userId })
                        }
                    }
                    else setChats([...chats])
                }


            }, () => { })

        }

        getChats()




        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 700);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);

    }, [])

    useEffect(() => {


        if (activeChat?.event === chatEvent.switchChat) {
            setInputValue('')
            setReplyMessage(null)
            if (inputRef.current) {
                inputRef.current.innerHTML = ''
            }
            const firstUnreadMessage = activeChat.messages.find(message =>
                message.status === 'new'
                && message.userId
                && message.userId !== session?.userdata.id
            )
            if (firstUnreadMessage) {
                const unreadMessageElement = document.getElementById(`message-${firstUnreadMessage?.createdAt}`);
                if (unreadMessageElement) unreadMessageElement.scrollIntoView({ behavior: 'instant', block: 'end' })
            }
            else messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' })
        }

        if (activeChat?.event === chatEvent.addMessage) {
            const scrollBottom = (chatContainerRef.current?.scrollHeight || 0)
                - (chatContainerRef.current?.scrollTop || 0)
                - (chatContainerRef.current?.clientHeight || 0)
            setShowScrollBtn(scrollBottom > 300);
            if (activeChat.messages.at(-1)?.userId === session?.userdata.id) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
            else {
                const lastMessage = document.getElementById(`message-${activeChat.messages.at(-1)?.createdAt}`)
                if ((chatContainerRef.current?.scrollHeight || 0)
                    - (chatContainerRef.current?.scrollTop || 0)
                    - (chatContainerRef.current?.clientHeight || 0)
                    - (lastMessage?.scrollHeight || 0) < 20) {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
            }
        }

        previousChatId.current = activeChat.chatId

        const handleScroll = () => {
            const scrollBottom = (chatContainerRef.current?.scrollHeight || 0)
                - (chatContainerRef.current?.scrollTop || 0)
                - (chatContainerRef.current?.clientHeight || 0)
            setShowScrollBtn(scrollBottom > 300);
        };

        chatContainerRef?.current?.addEventListener('scroll', handleScroll);

        return () => chatContainerRef?.current?.removeEventListener('scroll', handleScroll);

    }, [activeChat])

    //Socket
    useEffect(() => {
        if (!socket || !isConnected) return;



        const handleSendMessage = (content: any) => {
            addMessageAndUpdateState(content, 'sendMessage');
        };

        const handleReceiveMessage = (content: any) => {
            addMessageAndUpdateState(content, 'receiveMessage');
        };

        const handleStatusUpdate = (content: any) => {
            updateMessagesStatus(content, 'updateMessagesStatus')
        };

        socket.on('sendMessage', handleSendMessage);
        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('updateMessagesStatus', handleStatusUpdate);



        return () => {
            socket.off('sendMessage', handleSendMessage);
            socket.off('receiveMessage', handleReceiveMessage);
            socket.off('updateMessagesStatus', handleStatusUpdate);
        };
    }, [socket, isConnected]);


    return (
        <main className="chats">
            <div
                className={`chats__aside ${isMobile && activeChat.id !== -1 && 'hidden'}`}>
                <div className="chats__aside-buttons">
                    <button
                        className={`chats-list__toggle-btn ${!spamList && 'chats-list__toggle-btn--active'}`}
                        onClick={() => {
                            setSpamList(false)
                        }}
                    >
                        {!spamList && 'Inbox'}
                        <svg
                            id="Layer_1"
                            data-name="Layer 1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 122.88 85.57"
                        >
                            <title>mail</title>
                            <path d="M3.8,0,62.48,47.85,118.65,0ZM0,80.52,41.8,38.61,0,4.53v76ZM46.41,42.37,3.31,85.57h115.9L78,42.37,64.44,53.94h0a3,3,0,0,1-3.78.05L46.41,42.37Zm36.12-3.84,40.35,42.33V4.16L82.53,38.53Z" />
                        </svg>
                    </button>
                    <button
                        className={`chats-list__toggle-btn ${spamList && 'chats-list__toggle-btn--active'}`}
                        onClick={() => {
                            setSpamList(true)
                        }}
                    >
                        <div className="">

                            <svg
                                version="1.1"
                                id="Layer_1"
                                x="0px"
                                y="0px"
                                viewBox="0 0 122.88 95.21"
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
                                        d="M58.7,67.43h5.46v4.83H58.7V67.43L58.7,67.43z M61.44,31.38c7.44,0,14.18,3.02,19.06,7.89 c4.88,4.88,7.89,11.61,7.89,19.06c0,7.44-3.02,14.18-7.89,19.06c-4.88,4.88-11.61,7.89-19.06,7.89c-7.44,0-14.18-3.02-19.06-7.89 c-4.88-4.88-7.89-11.61-7.89-19.06c0-7.44,3.02-14.18,7.89-19.06C47.26,34.4,54,31.38,61.44,31.38L61.44,31.38z M77.15,42.61 c-4.02-4.02-9.58-6.51-15.71-6.51c-6.14,0-11.69,2.49-15.72,6.51c-4.02,4.02-6.51,9.58-6.51,15.71c0,6.14,2.49,11.69,6.51,15.71 c4.02,4.02,9.58,6.51,15.72,6.51c6.14,0,11.69-2.49,15.71-6.51c4.02-4.02,6.51-9.58,6.51-15.71 C83.66,52.19,81.18,46.63,77.15,42.61L77.15,42.61z M2.48,20.74h4.5v-9.86c0-1.37,1.11-2.48,2.48-2.48h4.41V2.48 c0-1.37,1.11-2.48,2.48-2.48h40.26c1.37,0,2.48,1.11,2.48,2.48V8.4h54.3c1.37,0,2.48,1.11,2.48,2.48v9.86h4.53 c1.37,0,2.48,1.11,2.48,2.48c0,0.18-0.02,0.36-0.06,0.52l-8.68,63.81c-0.28,2.08-1.19,4.01-2.59,5.41 c-1.38,1.38-3.21,2.24-5.36,2.24H14.7c-2.16,0-4.03-0.87-5.43-2.26c-1.41-1.41-2.31-3.35-2.54-5.46l-6.72-64 c-0.14-1.36,0.85-2.58,2.21-2.72C2.31,20.75,2.39,20.75,2.48,20.74L2.48,20.74L2.48,20.74L2.48,20.74z M9.46,25.71H5.23l6.44,61.27 c0.1,0.98,0.5,1.85,1.1,2.46c0.5,0.5,1.17,0.81,1.93,0.81h91.5c0.75,0,1.38-0.3,1.87-0.79c0.62-0.62,1.03-1.53,1.17-2.55 l8.32-61.19L9.46,25.71L9.46,25.71L9.46,25.71z M11.94,13.37v7.36l98.97-1.05v-6.31h-54.3c-1.37,0-2.48-1.11-2.48-2.48V4.97h-35.3 v5.92c0,1.37-1.11,2.48-2.48,2.48L11.94,13.37L11.94,13.37L11.94,13.37z M64.16,64.14H58.7c-0.54-6.63-1.68-9.3-1.68-15.93 c0-2.44,1.98-4.42,4.43-4.42c2.44,0,4.43,1.98,4.43,4.42C65.87,54.84,64.71,57.51,64.16,64.14L64.16,64.14L64.16,64.14z"
                                    />
                                </g>
                            </svg>
                        </div>
                        {spamList &&
                            <div className="chats-list__toggle-text">
                                Spam

                            </div>
                        }
                    </button>
                </div>
                <div className="chats__list chats-list">
                    {sortChatsByLastMessage(chats).map((chat => {
                        if (chat.chatType === 'spam' && !spamList || chat.chatType !== 'spam' && spamList) return

                        return <button
                            className={`chat-list__item chat ${activeChat.chatId === chat.chatId && 'chat-list__item--active'}`}
                            key={chat.chatId}
                            onClick={() => {
                                setActiveChat({ ...chat, event: chatEvent.switchChat })
                            }}
                        >
                            {chat.userData?.images[0]?.fileName
                                ? <img src={process.env.NEXT_PUBLIC_API_URL + '/images/' + chat.userData.images[0]?.fileName} alt="" className="chat__photo" />
                                : <div className="chat__photo">?</div>
                            }
                            <div className="chat__name">
                                {chat.userData?.name}
                            </div>
                            {
                                chat.messages.length > 0 &&
                                <span className="last-message__time">

                                    {formatDate(new Date(chat.messages.at(-1)?.createdAt || ''))}
                                </span>
                            }

                            <span className="last-message__status">

                                {chat.messages.at(-1)?.userId === session?.userdata.id &&
                                    <svg
                                        version="1.1"
                                        id="Layer_1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
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
                                }
                                {chat.messages.at(-1)?.userId === session?.userdata.id && chat.messages.at(-1)?.status === 'viewed' &&

                                    <svg
                                        version="1.1"
                                        id="Layer_1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
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

                                }
                            </span>

                            <div className={`chat__last-message ${chat.messages.at(-1)?.status === 'new'
                                &&
                                chat.messages.at(-1)?.userId !== session?.userdata.id
                                &&
                                chat.messages.at(-1)?.userId
                                &&
                                'chat__last-message--unread'
                                }`}>

                                {chat.messages.at(-1)?.messageType === 'system'
                                    ? chat.messages.at(-1)?.message?.replace(`&${session?.userdata.id}&`, `You`).replace(`&${chat.userData?.userId}&`, chat.userData?.name || '')
                                    : chat.messages.at(-1)?.message
                                }


                            </div>

                            {
                                (() => {
                                    const unreadCount = chat.messages.reduce((count, message) =>
                                        (message.status === 'new' && message.recipientId === session?.userdata.id) ? count + 1 : count,
                                        0
                                    );
                                    return unreadCount > 0 ? <span className="chat-list__unread-q">{unreadCount}</span> : <span className="chat-list__unread-q--empty"></span>;
                                })()
                            }

                        </button>
                    }))}
                </div>

            </div>
            {
                activeChat.id === -1
                    ? <div
                        className={`chat__empty  ${isMobile && activeChat.id === -1 && 'hidden'}`}>
                        <h1 className="chat__empty-title">Select a chat to start messaging</h1>
                    </div>
                    : <div
                        className={`chat-main  ${isMobile && activeChat.id === -1 && 'hidden'}`}>
                        <div className="chat-main__header">
                            <button
                                onClick={() => {
                                    setActiveChat({
                                        chatId: '',
                                        chatType: 'spam',
                                        createdAt: '',
                                        id: -1,
                                        messages: [],
                                        updatedAt: '',
                                        userId1: -1,
                                        userId2: -1,
                                    })
                                }}
                                className={`chat-main__back-btn ${!isMobile && 'hidden'}`}>
                                <svg
                                    className="back-btn__svg"
                                    shapeRendering="geometricPrecision"
                                    textRendering="geometricPrecision"
                                    imageRendering="optimizeQuality"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    viewBox="0 0 512 243.58"
                                >
                                    <path
                                        fillRule="nonzero"
                                        d="M138.43 243.58 0 122.84 140.47 0l20.92 23.91-94.92 83 445.53-.42v31.75l-445.54.41 92.89 81.02z"
                                    />
                                </svg>
                            </button>

                            <button
                                onClick={() => {
                                    const params = new URLSearchParams()
                                    params.set('userId', String(activeChat.userData?.userId))
                                    router.push(`/spin?${params.toString()}`)
                                }}
                                className="chat-main__link">
                                {activeChat.userData?.images[0]?.fileName
                                    ? <img
                                        src={process.env.NEXT_PUBLIC_API_URL + '/images/' + activeChat.userData?.images[0]?.fileName || ''}
                                        alt="avatar"
                                        className="chat-main__img"
                                    />
                                    : <div className="chat-main__img">?</div>
                                }

                                <div className="chat-main__name">{activeChat.userData?.name}</div>
                            </button>
                            <button className="chat-main__brg-btn">
                                <svg
                                    className="chat-main__brg-svg"
                                    version="1.1"
                                    id="Layer_1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    width="29.957px"
                                    height="122.88px"
                                    viewBox="0 0 29.957 122.88"
                                    enableBackground="new 0 0 29.957 122.88"
                                    xmlSpace="preserve"
                                >
                                    <g>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M14.978,0c8.27,0,14.979,6.708,14.979,14.979c0,8.27-6.709,14.976-14.979,14.976 C6.708,29.954,0,23.249,0,14.979C0,6.708,6.708,0,14.978,0L14.978,0z M14.978,92.926c8.27,0,14.979,6.708,14.979,14.979 s-6.709,14.976-14.979,14.976C6.708,122.88,0,116.175,0,107.904S6.708,92.926,14.978,92.926L14.978,92.926z M14.978,46.463 c8.27,0,14.979,6.708,14.979,14.979s-6.709,14.978-14.979,14.978C6.708,76.419,0,69.712,0,61.441S6.708,46.463,14.978,46.463 L14.978,46.463z"
                                        />
                                    </g>
                                </svg>
                            </button>
                        </div>


                        <div
                            ref={chatContainerRef}
                            className="chat-main__field">
                            {activeChat.messages.length > 0 && addDayDataToMessages(activeChat.messages).map((message) => {

                                return <ChatMessage
                                    setReplyMessage={setReplyMessage}
                                    message={message}
                                    session={session}
                                    chatUserData={activeChat.userData || null}
                                    key={message?.createdAt}
                                    onVisible={addToUnreadVisibleMessages}
                                    isHighlighted={isHighlightedMessageId}
                                    setIsHighlighted={setIsHighlightedMessageId}
                                    chatContainerRef={chatContainerRef}
                                />
                            })}
                            <div ref={messagesEndRef} />
                        </div>


                        <button
                            className={`chat-main__scroll-btn ${showScrollBtn && 'scroll-btn--visible'}`}
                            onClick={() => {
                                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                            }}
                        >
                            {(() => {
                                const unreadCount = activeChat.messages.reduce((count, message) =>
                                    (message.status === 'new' && message.recipientId === session?.userdata.id) ? count + 1 : count,
                                    0
                                );
                                if (unreadCount > 99) return <span className="chat-main__unread-q">{'99+'}</span>
                                return unreadCount > 0 ? <span className="chat-main__unread-q">{unreadCount}</span> : null;
                            })()}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                x="0px"
                                y="0px"
                                width="122.88px"
                                height="80.593px"
                                viewBox="0 0 122.88 80.593"
                                xmlSpace="preserve"
                            >
                                <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                            </svg>
                        </button>
                        {
                            replyMessage &&
                            <div className="chat-main__reply">
                                <div className="chat-main__reply-icon">
                                    <svg
                                        version="1.1"
                                        id="Layer_1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        x="0px"
                                        y="0px"
                                        viewBox="0 0 120.46 122.88"
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
                                                d="M17.2,0h62.29c4.73,0,9.03,1.93,12.15,5.05c3.12,3.12,5.05,7.42,5.05,12.15v38.35c0,4.73-1.93,9.03-5.05,12.15 c-3.12,3.12-7.42,5.05-12.15,5.05H46.92L20.81,95.2c-1.21,1.04-3.04,0.9-4.08-0.32c-0.51-0.6-0.74-1.34-0.69-2.07l1.39-20.07H17.2 c-4.73,0-9.03-1.93-12.15-5.05C1.93,64.58,0,60.28,0,55.55V17.2c0-4.73,1.93-9.03,5.05-12.15C8.16,1.93,12.46,0,17.2,0L17.2,0 L17.2,0z M63.12,29.37c4.48,0,8.11,3.63,8.11,8.11c0,4.48-3.63,8.11-8.11,8.11c-4.48,0-8.11-3.63-8.11-8.11 C55.01,33,58.64,29.37,63.12,29.37L63.12,29.37z M33.69,29.37c4.48,0,8.11,3.63,8.11,8.11c0,4.48-3.63,8.11-8.11,8.11 s-8.11-3.63-8.11-8.11C25.58,33,29.21,29.37,33.69,29.37L33.69,29.37z M106.79,27.98c3.37,0.65,6.39,2.31,8.73,4.65 c3.05,3.05,4.95,7.26,4.95,11.9v38.35c0,4.64-1.89,8.85-4.95,11.9c-3.05,3.05-7.26,4.95-11.9,4.95h-0.61l1.42,20.44l0,0 c0.04,0.64-0.15,1.3-0.6,1.82c-0.91,1.07-2.52,1.19-3.58,0.28l-26.21-23.2H39.49l17.01-17.3h36.04c7.86,0,14.3-6.43,14.3-14.3 V29.11C106.83,28.73,106.82,28.35,106.79,27.98L106.79,27.98L106.79,27.98z M79.48,5.8H17.2c-3.13,0-5.98,1.28-8.05,3.35 C7.08,11.22,5.8,14.06,5.8,17.2v38.35c0,3.13,1.28,5.98,3.35,8.05c2.07,2.07,4.92,3.35,8.05,3.35h3.34v0.01l0.19,0.01 c1.59,0.11,2.8,1.49,2.69,3.08l-1.13,16.26l21.54-18.52c0.52-0.52,1.24-0.84,2.04-0.84h33.61c3.13,0,5.98-1.28,8.05-3.35 c2.07-2.07,3.35-4.92,3.35-8.05V17.2c0-3.13-1.28-5.98-3.35-8.05C85.46,7.08,82.61,5.8,79.48,5.8L79.48,5.8L79.48,5.8z"
                                            />
                                        </g>
                                    </svg>
                                </div>
                                <div className="chat-main__reply-title">
                                    Reply to {replyMessage.userId !== session?.userdata.id && activeChat.userData?.name}
                                </div>
                                <div className="chat-main__reply-message">
                                    {replyMessage?.message}
                                </div>
                                <button
                                    onClick={() => setReplyMessage(null)}
                                    className="chat-main__reply-btn">
                                    <svg
                                        version="1.1"
                                        id="Layer_1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        x="0px"
                                        y="0px"
                                        width="122.878px"
                                        height="122.88px"
                                        viewBox="0 0 122.878 122.88"
                                        enableBackground="new 0 0 122.878 122.88"
                                        xmlSpace="preserve"
                                    >
                                        <g>
                                            <path d="M1.426,8.313c-1.901-1.901-1.901-4.984,0-6.886c1.901-1.902,4.984-1.902,6.886,0l53.127,53.127l53.127-53.127 c1.901-1.902,4.984-1.902,6.887,0c1.901,1.901,1.901,4.985,0,6.886L68.324,61.439l53.128,53.128c1.901,1.901,1.901,4.984,0,6.886 c-1.902,1.902-4.985,1.902-6.887,0L61.438,68.326L8.312,121.453c-1.901,1.902-4.984,1.902-6.886,0 c-1.901-1.901-1.901-4.984,0-6.886l53.127-53.128L1.426,8.313L1.426,8.313z" />
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        }

                        <div className="chat-main__input-box">
                            {/* <button className="input-box__attach-bth">
                                <svg
                                    className="input-box__attach-svg"
                                    id="Layer_1"
                                    data-name="Layer 1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 110.27 122.88"
                                >
                                    <path d="M11.1,67.22a4.09,4.09,0,1,1-5.79-5.79L58,8.75a30.77,30.77,0,0,1,43.28,43.74L38.05,115.74l-.33.3c-4.77,4.21-9.75,6.59-15,6.82s-10.62-1.77-15.89-6.34h0l-.07-.06h0l-.15-.15a23.21,23.21,0,0,1-5.34-8A18.84,18.84,0,0,1,.14,99.16a22.87,22.87,0,0,1,4-10.47,51.46,51.46,0,0,1,6.43-7.35l58.68-58.7a13.05,13.05,0,0,1,18.34-.09l.09.09a13,13,0,0,1,.24,18.15l-.24.27L37.14,91.58a4.09,4.09,0,0,1-5.79-5.79L82,35.12a4.89,4.89,0,0,0-.13-6.67l0,0a4.84,4.84,0,0,0-6.83,0L16.33,87.12a46,46,0,0,0-5.45,6.17,15,15,0,0,0-2.62,6.83,10.92,10.92,0,0,0,.64,5.25,15.28,15.28,0,0,0,3.42,5.07c3.56,3.06,6.91,4.4,10.09,4.26s6.51-1.81,9.88-4.79l63.2-63.2A22.59,22.59,0,0,0,63.75,14.57L11.1,67.22Z" />
                                </svg>

                            </button> */}

                            <div className="input-box__input">
                                <span
                                    className="chat-input__placeholder"
                                    style={{
                                        opacity: inputValue.length === 0 ? 1 : 0
                                    }}

                                >
                                    Write a message...
                                </span>
                                <div
                                    className="chat-input__input"
                                    contentEditable
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const text = e.clipboardData.getData('text/plain');
                                        document.execCommand('insertText', false, text);
                                    }}
                                    onInput={(e) => {
                                        const text = e.currentTarget.innerText.trim();
                                        setInputValue(text || '')
                                    }}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            const formattedString = inputValue.replace(/^\s+/, '')
                                            if (formattedString.length > 0) {
                                                await requestWrapper(
                                                    sendMessage,
                                                    () => {

                                                    },
                                                    () => {

                                                    },
                                                    { userId: activeChat.userData?.userId, message: formattedString, repliedToId: replyMessage?.id })
                                            }
                                            setInputValue('')
                                            if (inputRef.current) {
                                                inputRef.current.innerHTML = ''
                                                inputRef.current.focus()
                                            }
                                            setReplyMessage(null)
                                        }
                                    }}
                                    ref={inputRef}
                                >

                                </div>
                            </div>

                            <button
                                className="input-box__send-btn"
                                onClick={async (e) => {
                                    e.preventDefault()
                                    const formattedString = inputValue.replace(/^\s+/, '')
                                    if (formattedString.length > 0) {
                                        await requestWrapper(
                                            sendMessage,
                                            () => {

                                            },
                                            () => {

                                            },
                                            { userId: activeChat.userData?.userId, message: formattedString, repliedToId: replyMessage?.id })
                                    }
                                    setReplyMessage(null)
                                    setInputValue('')
                                    if (inputRef.current) {
                                        inputRef.current.innerHTML = ''
                                        inputRef.current?.focus()
                                    }
                                }}
                            >
                                <svg
                                    className="chat__send-svg"
                                    version="1.1"
                                    id="Layer_1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    viewBox="0 0 122.88 103.44"
                                    xmlSpace="preserve"
                                >
                                    <g>
                                        <path d="M69.49,102.77L49.8,84.04l-20.23,18.27c-0.45,0.49-1.09,0.79-1.8,0.79c-1.35,0-2.44-1.09-2.44-2.44V60.77L0.76,37.41 c-0.98-0.93-1.01-2.47-0.09-3.45c0.31-0.33,0.7-0.55,1.11-0.67l0,0l118-33.2c1.3-0.36,2.64,0.39,3.01,1.69 c0.19,0.66,0.08,1.34-0.24,1.89l-49.2,98.42c-0.6,1.2-2.06,1.69-3.26,1.09C69.86,103.07,69.66,102.93,69.49,102.77L69.49,102.77 L69.49,102.77z M46.26,80.68L30.21,65.42v29.76L46.26,80.68L46.26,80.68z M28.15,56.73l76.32-47.26L7.22,36.83L28.15,56.73 L28.15,56.73z M114.43,9.03L31.79,60.19l38.67,36.78L114.43,9.03L114.43,9.03z" />
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </div>

            }

        </main >
    );
}


const ChatMessage = ({
    message,
    session,
    chatUserData,
    onVisible,
    setReplyMessage,
    isHighlighted,
    setIsHighlighted,
    chatContainerRef
}: {
    message:
    IMessage,
    session: IAuthInfo | null,
    chatUserData: IUserData | null,
    onVisible: (id: number) => void,
    setReplyMessage: Dispatch<SetStateAction<IMessage | null>>,
    isHighlighted: number,
    setIsHighlighted: Dispatch<SetStateAction<number>>,
    chatContainerRef: RefObject<HTMLDivElement>
}) => {
    const ref = useRef<HTMLDivElement>(null);



    useEffect(() => {
        if (!ref.current || message.userId === session?.userdata.id || message.status !== 'new') return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onVisible(message.id);
                    observer.disconnect();
                }
            },
            {
                threshold: 0
            }
        );

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [onVisible, message]);


    useEffect(() => {
        const timeOut = setTimeout(() => {
            setIsHighlighted(-1)
        }, 1000)
        return () => {
            clearTimeout(timeOut)
        }
    }, [isHighlighted])


    //
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        messageId: number | null;
    }>({ visible: false, x: 0, y: 0, messageId: null });

    useEffect(() => {

        const handleCloseMenu = () => {
            if (contextMenu.visible) setContextMenu(prev => ({ ...prev, visible: false }));
        };

        window.addEventListener('scroll', handleCloseMenu, true);
        window.addEventListener('resize', handleCloseMenu)

        document.addEventListener('click', handleCloseMenu);
        document.addEventListener('contextmenu', handleCloseMenu);

        return () => {
            document.removeEventListener('click', handleCloseMenu);
            document.removeEventListener('contextmenu', handleCloseMenu);
            window.removeEventListener('scroll', handleCloseMenu, true);
            window.removeEventListener('resize', handleCloseMenu);
        };
    }, [contextMenu.visible]);

    const handleContextMenu = (e: React.MouseEvent, messageId: number) => {
        e.preventDefault();

        if (!chatContainerRef?.current) return;
        if (message.messageType !== 'user') return;

        const containerRect = chatContainerRef.current.getBoundingClientRect();
        const menuWidth = 200;
        const maxX = containerRect.right - 250;
        const maxY = containerRect.bottom - 200;

        const isLeftSide = e.clientX < containerRect.left + containerRect.width / 2;

        let x;
        if (isLeftSide) {
            x = Math.min(e.clientX, maxX);
        } else {
            x = Math.max(e.clientX - menuWidth, containerRect.left);
        }

        const y = Math.min(e.clientY, maxY);

        setContextMenu({
            visible: true,
            x,
            y,
            messageId
        });
    };


    const handleMenuAction = (action: string) => {

        setContextMenu(prev => ({ ...prev, visible: false }));
    };
    //
    if (!message) return null

    return (
        <div
            onDoubleClick={(e) => {
                e.preventDefault()
                if (message.messageType === 'user') setReplyMessage(message)
            }}
            onContextMenu={(e) => handleContextMenu(e, message.id)}
            ref={ref}
            key={message.createdAt}
            id={`message-${message?.createdAt}`}
            className={`chat-main__message `
                + `chat-main__message--${message.messageType} `
                + `chat-main__message--${message.messageType === 'user' && message.userId === session?.userdata.id ? 'right' : 'left'} `
                + `chat-main__message--${message.systemType} `
                + `chat-main__message--${message.id === isHighlighted && isHighlighted !== -1 && 'highlighted'} `
                + `chat-main__message--${contextMenu.visible && 'contex-active'} `
                + `chat-main__message--${message.status === 'new' && message.userId !== session?.userdata.id && message.messageType === 'user' && 'user-new'} `
            }>
            {contextMenu.visible && (
                <div
                    className="message__context-menu"
                    style={{
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="context-menu__item"
                        onClick={() => {
                            setReplyMessage(message)
                        }}
                    >
                        <div className="context-menu__icon">
                            <svg
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 120.46 122.88"
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
                                        d="M17.2,0h62.29c4.73,0,9.03,1.93,12.15,5.05c3.12,3.12,5.05,7.42,5.05,12.15v38.35c0,4.73-1.93,9.03-5.05,12.15 c-3.12,3.12-7.42,5.05-12.15,5.05H46.92L20.81,95.2c-1.21,1.04-3.04,0.9-4.08-0.32c-0.51-0.6-0.74-1.34-0.69-2.07l1.39-20.07H17.2 c-4.73,0-9.03-1.93-12.15-5.05C1.93,64.58,0,60.28,0,55.55V17.2c0-4.73,1.93-9.03,5.05-12.15C8.16,1.93,12.46,0,17.2,0L17.2,0 L17.2,0z M63.12,29.37c4.48,0,8.11,3.63,8.11,8.11c0,4.48-3.63,8.11-8.11,8.11c-4.48,0-8.11-3.63-8.11-8.11 C55.01,33,58.64,29.37,63.12,29.37L63.12,29.37z M33.69,29.37c4.48,0,8.11,3.63,8.11,8.11c0,4.48-3.63,8.11-8.11,8.11 s-8.11-3.63-8.11-8.11C25.58,33,29.21,29.37,33.69,29.37L33.69,29.37z M106.79,27.98c3.37,0.65,6.39,2.31,8.73,4.65 c3.05,3.05,4.95,7.26,4.95,11.9v38.35c0,4.64-1.89,8.85-4.95,11.9c-3.05,3.05-7.26,4.95-11.9,4.95h-0.61l1.42,20.44l0,0 c0.04,0.64-0.15,1.3-0.6,1.82c-0.91,1.07-2.52,1.19-3.58,0.28l-26.21-23.2H39.49l17.01-17.3h36.04c7.86,0,14.3-6.43,14.3-14.3 V29.11C106.83,28.73,106.82,28.35,106.79,27.98L106.79,27.98L106.79,27.98z M79.48,5.8H17.2c-3.13,0-5.98,1.28-8.05,3.35 C7.08,11.22,5.8,14.06,5.8,17.2v38.35c0,3.13,1.28,5.98,3.35,8.05c2.07,2.07,4.92,3.35,8.05,3.35h3.34v0.01l0.19,0.01 c1.59,0.11,2.8,1.49,2.69,3.08l-1.13,16.26l21.54-18.52c0.52-0.52,1.24-0.84,2.04-0.84h33.61c3.13,0,5.98-1.28,8.05-3.35 c2.07-2.07,3.35-4.92,3.35-8.05V17.2c0-3.13-1.28-5.98-3.35-8.05C85.46,7.08,82.61,5.8,79.48,5.8L79.48,5.8L79.48,5.8z"
                                    />
                                </g>
                            </svg>
                        </div>
                        Reply
                    </button>
                    <button
                        className="context-menu__item"
                        onClick={() => {
                            navigator.clipboard.writeText(message.message)
                        }}
                    >
                        <div className="context-menu__icon">
                            <svg
                                version="1.1"
                                id="Layer_1"
                                x="0px"
                                y="0px"
                                viewBox="0 0 115.77 122.88"
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
                                        d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"
                                    />
                                </g>
                            </svg>
                        </div>
                        Copy
                    </button>
                    <button
                        className="context-menu__item"
                        onClick={() => handleMenuAction('delete')}
                    >
                        <div className="context-menu__icon">
                            <svg
                                id="Layer_1"
                                data-name="Layer 1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 110.61 122.88"
                            >
                                <title>trash</title>
                                <path d="M39.27,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Zm63.6-19.86L98,103a22.29,22.29,0,0,1-6.33,14.1,19.41,19.41,0,0,1-13.88,5.78h-45a19.4,19.4,0,0,1-13.86-5.78l0,0A22.31,22.31,0,0,1,12.59,103L7.74,38.78H0V25c0-3.32,1.63-4.58,4.84-4.58H27.58V10.79A10.82,10.82,0,0,1,38.37,0H72.24A10.82,10.82,0,0,1,83,10.79v9.62h23.35a6.19,6.19,0,0,1,1,.06A3.86,3.86,0,0,1,110.59,24c0,.2,0,.38,0,.57V38.78Zm-9.5.17H17.24L22,102.3a12.82,12.82,0,0,0,3.57,8.1l0,0a10,10,0,0,0,7.19,3h45a10.06,10.06,0,0,0,7.19-3,12.8,12.8,0,0,0,3.59-8.1L93.37,39ZM71,20.41V12.05H39.64v8.36ZM61.87,58.64a4.74,4.74,0,1,1,9.47,0V93.72a4.74,4.74,0,1,1-9.47,0V58.64Z" />
                            </svg>
                        </div>
                        Delete
                    </button>
                </div>
            )}

            {message.repliedTo &&

                <div
                    onClick={() => {
                        const repliedMessage = document.getElementById(`message-${message.repliedTo?.createdAt}`);
                        if (repliedMessage) repliedMessage.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        setIsHighlighted(message.repliedTo?.id || -1)
                    }}
                    className="message-reply">

                    {message.repliedTo?.message}
                </div>
            }
            {message.messageType === 'system'
                ? message?.message?.replace(`&${session?.userdata.id}&`, `You`).replace(`&${chatUserData?.userId}&`, chatUserData?.name || '')
                : message.message
            }
            {
                <>

                    {message?.systemType !== 'date' &&
                        <span className="chat-main__message-time">

                            {new Date(message?.createdAt).getHours().toString().padStart(2, '0') + ':' + new Date(message?.createdAt).getMinutes().toString().padStart(2, '0')}
                        </span>
                    }

                    <span className="chat-main__message-status">

                        {message.userId === session?.userdata.id &&
                            <svg
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
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
                        }
                        {message.userId === session?.userdata.id && message.status === 'viewed' &&

                            <svg
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
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

                        }
                    </span>


                </>


            }
        </div>
    );
}

export default Chats;