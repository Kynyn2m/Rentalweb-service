import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authEmitter: EventEmitter<boolean>;
  constructor() {
    this.authEmitter = new EventEmitter<boolean>(true);
  }
}
