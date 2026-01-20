import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, CreateUserDto, UpdateUserDto, Role } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:5000/api/users';


    constructor(private http: HttpClient) { }

    getAll(): Observable<UserDto[]> {
        return this.http.get<UserDto[]>(this.apiUrl);
    }

    getById(id: number): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
    }

    create(user: CreateUserDto): Observable<UserDto> {
        return this.http.post<UserDto>(this.apiUrl, user);
    }

    update(id: number, user: UpdateUserDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, user);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(`${this.apiUrl}/roles`);
    }
}
