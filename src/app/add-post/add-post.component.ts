import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { AuthenticationService } from '../authentication/authentication.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css'],
})
export class AddPostComponent implements OnInit {
  category: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {}

  ngOnInit(): void {
    // Listen for category changes from the route parameters
    this.route.params.subscribe((params) => {
      this.category = params['category'];
      this.onCategoryChange(this.category); // Handle category change logic
    });
  }

  // Method to handle Add Post House button click
  onAddPostHouseClick(): void {
    this.handleNavigation('House');
  }

  // Method that handles navigation based on category and login status
  handleNavigation(category: string): void {
    if (this.authenticationService.isLoggedIn()) {
      if (category === 'House') {
        this.router.navigate(['/add-post-house']);
      } else if (category === 'Room') {
        this.router.navigate(['/add-post-room']);
      } else if (category === 'Land') {
        this.router.navigate(['/add-post-land']);
      }
    } else {
      // Show SweetAlert instead of Snackbar
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: ' ្នកត្រូវតែចូលដើម្បីបន្ថែមការផុស។ You need to login to add a post',
        confirmButtonText: 'Go to Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']); // Redirect to login if the user clicks "Go to Login"
        }
      });
    }
  }

  // Handle category changes if needed (currently just logging)
  onCategoryChange(category: string): void {
    console.log(`Category changed to: ${category}`);
    // You can add additional logic here based on the category if needed
  }

  // General method to navigate to the post page based on category
  navigateToPost(category: string): void {
    this.handleNavigation(category);
  }
}
