export interface Role {
    id: number;
    name: string;
}

export interface UserDto {
    id: number;
    username: string;
    fullName: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    branchId: number;
    branchName: string;
    roles: string[];
}

export interface CreateUserDto {
    username: string;
    password?: string;
    fullName: string;
    email?: string;
    phone?: string;
    branchId: number;
    roleIds: number[];
}

export interface UpdateUserDto {
    fullName: string;
    email?: string;
    phone?: string;
    branchId: number;
    isActive: boolean;
    roleIds: number[];
}
