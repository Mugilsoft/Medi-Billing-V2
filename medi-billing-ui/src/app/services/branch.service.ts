import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../models/branch.model';

@Injectable({
    providedIn: 'root'
})
export class BranchService {
    private apiUrl = 'http://localhost:5000/api/branches';


    constructor(private http: HttpClient) { }

    getAll(): Observable<Branch[]> {
        return this.http.get<Branch[]>(this.apiUrl);
    }

    getById(id: number): Observable<Branch> {
        return this.http.get<Branch>(`${this.apiUrl}/${id}`);
    }

    create(branch: Partial<Branch>): Observable<Branch> {
        return this.http.post<Branch>(this.apiUrl, branch);
    }

    update(id: number, branch: Branch): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, branch);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
