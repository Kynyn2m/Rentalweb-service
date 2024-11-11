import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-share-overlay',
  templateUrl: './share-overlay.component.html',
  styleUrls: ['./share-overlay.component.css']
})
export class ShareOverlayComponent {

  currentUrl: string;

  constructor(
    private dialogRef: MatDialogRef<ShareOverlayComponent>,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.currentUrl = this.document.location.href; // Get current page URL
  }

  shareOnFacebook(): void {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.currentUrl)}`;
    window.open(url, '_blank');
  }

  shareOnTwitter(): void {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.currentUrl)}`;
    window.open(url, '_blank');
  }

  shareOnLinkedIn(): void {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.currentUrl)}`;
    window.open(url, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      alert('Link copied to clipboard!');
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
