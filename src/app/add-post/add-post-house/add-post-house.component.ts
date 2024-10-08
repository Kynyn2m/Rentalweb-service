import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HouseService } from 'src/app/Service/house.service';
import Swal from 'sweetalert2';

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
    private houseService: HouseService
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
      image: [null, Validators.required]
    });
  }

  // Handle file selection and preview generation
  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);

    // Clear previous selections
    this.selectedFiles = [];
    this.imagePreviews = [];

    files.forEach((file) => {
      if (file && file.type.startsWith('image/')) {
        this.selectedFiles.push(file);  // Store valid image files
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);  // Store image preview
        };
        reader.readAsDataURL(file);
      } else {
        this.imageError = 'Please upload valid image files';
      }
    });

    // Validate image selection
    if (this.selectedFiles.length === 0) {
      this.imageError = 'No valid image files selected';
      this.addPostForm.get('image')?.setErrors({ required: true });
    } else {
      this.imageError = '';
      this.addPostForm.get('image')?.setValue(this.selectedFiles);
      this.addPostForm.get('image')?.updateValueAndValidity();
    }
  }

  // Remove image preview
  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.addPostForm.get('image')?.setErrors({ required: true });
    }
  }

  // Submit the form and post data
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

      // Append selected image files
      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      this.houseService.createPost(formData).subscribe(
        (response) => {
          Swal.fire({
            title: 'Success!',
            text: 'Your post has been successfully created.',
            icon: 'success',
            confirmButtonText: 'Go to House Listings',
            cancelButtonText: 'Close',
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/house']);
            }
          });
        },
        (error) => {
          console.error('Error creating post:', error);
          Swal.fire('Error', 'Failed to create post, please try again later.', 'error');
        }
      );
    } else {
      console.log('Form is invalid, please check inputs.');
      Object.keys(this.addPostForm.controls).forEach(key => {
        const control = this.addPostForm.get(key);
        console.log(key, control?.valid, control?.errors);
      });
    }
  }

  // Navigate back to the previous route
  goBack(): void {
    this.router.navigate(['/add-post']);
  }
}
