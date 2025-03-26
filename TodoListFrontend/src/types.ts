export interface ITask {
    id?: string,
    text: string,
    ischecked: boolean,
}

export interface IUser {
    id: number,
    username: string,
    email: string,
    password: string
}