import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { Confirm } from './confirm';
import { ConfirmComponent } from './confirm.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  constructor(private dialog: MatDialog) { }
  dialogRef!: MatDialogRef<ConfirmComponent>;

  public open(options: Confirm) {
    this.dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: options.title,
        message: options.message,
        cancelText: options.cancelText,
        confirmText: options.confirmText,
      },
    });
  }

  public confirmed(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      map((res) => {
        return res;
      })
    );
  }
}
