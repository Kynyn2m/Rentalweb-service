import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Comment {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  replyTo?: { id: number; description: string } | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getComments(
    page: number,
    size: number
  ): Observable<{ result: { result: Comment[]; totalElements: number } }> {
    return this.http.get<{
      result: { result: Comment[]; totalElements: number };
    }>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}/admin`);
  }
}
