import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-post-house',
  templateUrl: './add-post-house.component.html',
  styleUrls: ['./add-post-house.component.css']
})
export class AddPostHouseComponent implements OnInit {
  addPostForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  imageError: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.addPostForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      linkMap: ['', Validators.required],
      floor: ['', Validators.required],
      width: ['', Validators.required],
      height: ['', Validators.required],
      photo: [null, Validators.required],
    });
  }

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files); // Convert FileList to Array

    // Clear previous selections
    this.selectedFiles = [];
    this.imagePreviews = [];

    files.forEach((file) => {
      if (file && file.type.startsWith('image/')) {
        this.selectedFiles.push(file); // Store file in array
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string); // Store image preview
        };
        reader.readAsDataURL(file);
      } else {
        this.imageError = 'Please upload valid image files';
      }
    });

    if (this.selectedFiles.length === 0) {
      this.imageError = 'No valid image files selected';
    } else {
      this.imageError = ''; // Clear error if valid images are selected
    }
  }

  // Remove a specific image preview
  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  // Submit the form with multiple images
  onSubmit(): void {
    if (this.addPostForm.valid) {
      const formData = new FormData();
      formData.append('title', this.addPostForm.get('title')?.value);
      formData.append('description', this.addPostForm.get('description')?.value);
      formData.append('location', this.addPostForm.get('location')?.value);
      formData.append('price', this.addPostForm.get('price')?.value);
      formData.append('phoneNumber', this.addPostForm.get('phoneNumber')?.value);
      formData.append('linkMap', this.addPostForm.get('linkMap')?.value);
      formData.append('floor', this.addPostForm.get('floor')?.value);
      formData.append('width', this.addPostForm.get('width')?.value);
      formData.append('height', this.addPostForm.get('height')?.value);

      this.selectedFiles.forEach((file, index) => {
        formData.append(`photo_${index}`, file); // Append each file to form data
      });

      // Replace with your API endpoint URL
      const apiUrl = 'https://example.com/api/upload-house-post';
      this.http.post(apiUrl, formData).subscribe(
        (response) => {
          console.log('Post created successfully:', response);
          // Redirect or display success message after successful post
          this.router.navigate(['/some-success-page']);
        },
        (error) => {
          console.error('Error creating post:', error);
        }
      );
    } else {
      this.addPostForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/add-post']);
  }
}
