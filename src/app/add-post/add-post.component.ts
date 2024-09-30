import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css'],
})
export class AddPostComponent  {
  category: string = '';

  constructor(private route: ActivatedRoute,private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.category = params['category'];
      this.onCategoryChange(this.category);
    });
  }

  onCategoryChange(category: string): void {
    // Implement your logic here
    console.log(`Category changed to: ${category}`);
  }
  navigateToPost(category: string): void {
    if (category === 'House') {
      this.router.navigate(['/add-post/house']);  // Navigates to add-post-house
    } else if (category === 'Room') {
      this.router.navigate(['/add-post/room']);
    } else if (category === 'Land') {
      this.router.navigate(['/add-post/land']);
    }
  }
}
