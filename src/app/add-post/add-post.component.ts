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
    { value: 'Room', viewValue: 'room' },
    { value: 'House', viewValue: 'house' },
    { value: 'Land', viewValue: 'land' },
  ];

  isLandCategory: boolean = false;
  isHouseOrRoomCategory: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addPostForm = this.fb.group({
      category: ['', Validators.required],
      date: ['', Validators.required],
      title: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', Validators.required],
      landSize: [''],
      width: [''],
      length: [''],
      floor: [''],
      phoneNumber: ['', Validators.required],
      description: [''],
      linkMap: [''],
      photo: [null],
    });
    this.onCategoryChange(this.addPostForm.get('category')?.value);
  }

  onCategoryChange(category: string): void {
    this.isLandCategory = category === 'Land';
    this.isHouseOrRoomCategory = category === 'House' || category === 'Room';
    if (this.isLandCategory) {
      this.addPostForm.get('landSize')?.setValidators([Validators.required]);
      this.clearHouseOrRoomValidators();
    } else if (this.isHouseOrRoomCategory) {
      this.addPostForm.get('width')?.setValidators([Validators.required]);
      this.addPostForm.get('length')?.setValidators([Validators.required]);
      this.addPostForm.get('floor')?.setValidators([Validators.required]);
      this.clearLandValidators();
    }
    this.addPostForm.updateValueAndValidity();
  }

  clearLandValidators(): void {
    this.addPostForm.get('landSize')?.clearValidators();
    this.addPostForm.get('landSize')?.updateValueAndValidity();
  }

  clearHouseOrRoomValidators(): void {
    this.addPostForm.get('width')?.clearValidators();
    this.addPostForm.get('length')?.clearValidators();
    this.addPostForm.get('floor')?.clearValidators();
    this.addPostForm.get('width')?.updateValueAndValidity();
    this.addPostForm.get('length')?.updateValueAndValidity();
    this.addPostForm.get('floor')?.updateValueAndValidity();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      this.addPostForm.patchValue({ photo: file });
    }
  }

  onSubmit(): void {
    if (this.addPostForm.valid) {
      console.log(this.addPostForm.value);
    } else {
      this.addPostForm.markAllAsTouched();
    }
  }
}
