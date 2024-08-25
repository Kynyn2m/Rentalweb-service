import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css'],
})
export class AddPostComponent implements OnInit {
  addPostForm!: FormGroup;
  categories = [
    { value: 'rent', viewValue: 'Rent' },
    { value: 'sale', viewValue: 'Sale' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addPostForm = this.fb.group({
      category: ['', Validators.required],
      postId: ['', Validators.required],
      date: ['', Validators.required],
      userId: ['', Validators.required],
      title: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', Validators.required],
      width: ['', Validators.required],
      length: ['', Validators.required],
      floor: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      description: ['', Validators.required],
      bathroom: ['', Validators.required],
      bedroom: ['', Validators.required],
      linkMap: ['', Validators.required],
      photo: [null, Validators.required],
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
