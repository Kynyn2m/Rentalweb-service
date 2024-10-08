import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HouseService } from 'src/app/Service/house.service';

@Component({
  selector: 'app-house-update-dialog',
  templateUrl: './house-update-dialog.component.html',
  styleUrls: ['./house-update-dialog.component.css']
})
export class HouseUpdateDialogComponent implements OnInit {
  houseForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  existingImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private houseService: HouseService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<HouseUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize the form with the passed-in house data
    this.houseForm = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '', Validators.required],
      location: [data.location || '', Validators.required],
      price: [data.price || '', Validators.required],
      landSize: [data.landSize || '', Validators.required],
      phoneNumber: [data.phoneNumber || '', Validators.required],
      linkMap: [data.linkMap || '', Validators.required],
      floor: [data.floor || '', Validators.required],
      width: [data.width || '', Validators.required],
      height: [data.height || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.houseForm = this.fb.group({
      title: [this.data.title || '', Validators.required],
      description: [this.data.description || '', Validators.required],
      location: [this.data.location || '', Validators.required],
      price: [this.data.price || '', Validators.required],
      landSize: [this.data.landSize || ''],  // Remove Validators.required
      phoneNumber: [this.data.phoneNumber || '', Validators.required],
      linkMap: [this.data.linkMap || '', Validators.required],
      floor: [this.data.floor || '', Validators.required],
      width: [this.data.width || '', Validators.required],
      height: [this.data.height || '', Validators.required],
    });
  }



  // Handle file selection
   onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create a preview URL using FileReader for the newly selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Set the new image preview
      };
      reader.readAsDataURL(file); // Read the file as data URL for preview
    }
  }

  // Cancel image selection and revert to the existing image
  onCancelImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.houseForm.invalid) {
      console.log('Form is invalid, here are the errors:');

      // Log the specific control errors
      Object.keys(this.houseForm.controls).forEach(key => {
        const controlErrors = this.houseForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Control: ${key}, Errors:`, controlErrors);
        }
      });

      return;
    }

    console.log('Form is valid, making API call...');

    const formData = new FormData();
    Object.keys(this.houseForm.controls).forEach(key => {
      const value = this.houseForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.houseService.updateHouse(this.data.id, formData).subscribe(
      (response) => {
        console.log('House updated successfully', response);
        this.dialogRef.close(true);
        this.snackBar.open('House updated successfully', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error updating house:', error);
      }
    );
  }


  // Close the dialog without changes
  onCancel(): void {
    this.dialogRef.close(false);  // Pass `false` to indicate no changes were made
  }
  }