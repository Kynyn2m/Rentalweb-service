import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ad-dialog',
  templateUrl: './ad-dialog.component.html',
  styleUrls: ['./ad-dialog.component.css'],
  animations: [
    trigger('dialogAnimation', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'scale(1)',
        })
      ),
      state(
        'close',
        style({
          opacity: 0,
          transform: 'scale(0.8)',
        })
      ),
      transition('open => close', [animate('200ms ease-in')]),
      transition('close => open', [animate('300ms ease-out')]),
    ]),
  ],
})
export class AdDialogComponent implements OnInit {
  dialogState: 'open' | 'close' = 'open';
  remainingTime: number = 7;

  constructor(public dialogRef: MatDialogRef<AdDialogComponent>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.remainingTime--; // Update the bound property directly
      if (this.remainingTime <= 0) {
        clearInterval(interval); // Stop the timer
        this.closeDialog(); // Close the dialog when the countdown ends
      }
    }, 1000); // Decrease the time every second
  }
  navigateToLogin(): void {
    this.dialogRef.close(); // Close the dialog
    this.router.navigate(['/reginster']); // Navigate to the login page
  }

  closeDialog(): void {
    this.dialogState = 'close'; // Trigger the close animation
    setTimeout(() => {
      this.dialogRef.close(); // Close the dialog after the animation finishes
    }, 300); // Match the animation duration
  }
}
