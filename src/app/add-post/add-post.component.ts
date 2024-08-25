import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css'],
})
export class AddPostComponent {
  addPostForm: FormGroup;
  categories = [
    { value: 'rent', viewValue: 'Rent' },
    { value: 'sale', viewValue: 'Sale' },
    // Add more categories as needed
  ];

  constructor(private fb: FormBuilder) {
    this.addPostForm = this.fb.group({
      category: [''],
      postId: [''],
      date: [''],
      userId: [''],
      title: [''],
      location: [''],
      price: [''],
      width: [''],
      length: [''],
      floor: [''],
      phoneNumber: [''],
      description: [''],
      bathroom: [''],
      bedroom: [''],
      linkMap: [''],
      photo: [null],
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.addPostForm.patchValue({ photo: file });
    }
  }

  onSubmit(): void {
    if (this.addPostForm.valid) {
      console.log(this.addPostForm.value);
      // Handle form submission logic here
    }
  }
}
