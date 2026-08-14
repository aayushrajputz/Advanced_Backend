

export interface User {
    id: string,
    name: string,
    email: string,
    password: string,
}

const users: User[] = [];

export const createUser = (user: User): User => {
    users.push(user);
    return user;
}

export const findById = (id: string): User | undefined => {
    return users.find(u => u.id === id)
}

export const findByEmail = (email: string): User | undefined => {
    return users.find(u => u.email === email)
}


