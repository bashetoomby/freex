
export interface IAuthInfo {
    isAuth: boolean
    token: string
    userdata: {
        nickname: string
        id: number
        fullfield: boolean | null
    }
}

export interface IUserAuthInfo {
    nickname: string
    id: number
}


export interface ISearchParams {
    gender: string | null
    distance: number | null
    minAge: number | null
    maxAge: number | null
    fullfield?:boolean
}

export interface IUserCredentials {
    nickname: string
    password: string
}




export interface IVotedDate {
    vote: boolean,
    userId: number,
    votedUserId: number
}

export interface IChat {
    chatId: string
    chatType: string
    createdAt: string
    id: number
    messages: IMessage[]
    updatedAt: string
    userData?: IUserData
    userId1: number
    userId2: number
    event?: string
}

export interface IMessage {
    chatId: string
    createdAt: string
    id: number
    message: string
    messageType: string
    status: string
    systemType: string
    updatedAt: string
    userId: number | null,
    repliedTo: IMessage | null
    recipientId?: number
}
export interface IUserData {
    age: number
    chatId: string
    city: string
    createdAt: string
    description: string
    gender: string
    images: IImages[]
    name: string
    userId: number
    id: number
    nickname: string
}

export interface IUserDataDto {
    age: number | null,
    city: string | null,
    location: string | null,
    description: string | null,
    gender: string | null,
    name: string | null,
    images: { fileName: string }[],
    userId: number
}


export interface IImages {
    fileName: string
}


export interface Notification {
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    
}