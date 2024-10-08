import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="image-dialog-container">
      <img [src]="data.image" class="full-screen-image" />
      <button mat-icon-button class="close-button" (click)="onClose()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .image-dialog-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
    }

    .full-screen-image {
      max-width: 80%;
      max-height: 80%;
    }

    .close-button {
      background: #ffffffa3;
    position: absolute;
    top: 10px;
    right: 10px;
    color: #ff0000;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    }
  `]
})
export class ImageDialogComponent {
 constructor(
    public dialogRef: MatDialogRef<ImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: string }
  ) {}

  onClose(): void {
    this.dialogRef.close(); // Close the dialog
  }
}
