import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../_helpers/response-model';
import { Docs } from './utility';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private uri = '/library-management/v1';

  constructor(
    private http: HttpClient,
  ) {
  }

  getsFile(id: number): Observable<ResponseModel> {
    let url = `${environment.apiUrl}${this.uri}/file/${id}`
    return this.http.get<ResponseModel>(url);
  }

  getBase64Data(url:string):Observable<ResponseModel>{
    return this.http.get<ResponseModel>(`${environment.apiUrl}/${url}`);
  }

  postBase64Data(url:string, docs: Docs):Observable<ResponseModel>{
    return this.http.post<ResponseModel>(`${environment.apiUrl}/${url}`,docs);
  }

}
