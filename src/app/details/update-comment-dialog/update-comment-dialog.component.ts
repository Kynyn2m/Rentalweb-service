import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface CommentData {
  id: number;
  description: string;
}

@Component({
  selector: 'app-update-comment-dialog',
  templateUrl: './update-comment-dialog.component.html',
  styleUrls: ['./update-comment-dialog.component.css'],
})
export class UpdateCommentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CommentData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data);
  }
}
