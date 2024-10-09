import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; confirmText: string; cancelText: string }
  ) {}

  confirm(): void {
    this.loading = true; // Optionally show loading if needed
    this.dialogRef.close(true); // Close dialog and return true
  }

  cancel(): void {
    this.dialogRef.close(false); // Close dialog and return false
  }
}
