import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LandService } from 'src/app/add-post/add-post-land/land.service';

@Component({
  selector: 'app-land-form',
  templateUrl: './land-form.component.html',
  styleUrls: ['./land-form.component.css'],
})
export class LandFormComponent {
  landForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  existingImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private landService: LandService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<LandFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize the form with the passed-in land data
    this.landForm = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || '', Validators.required],
      location: [data.location || '', Validators.required],
      price: [data.price || '', Validators.required],
      landSize: [data.landSize || '', Validators.required],
      phoneNumber: [data.phoneNumber || '', Validators.required],
      linkMap: [data.linkMap || '', Validators.required],
    });
  }

  ngOnInit(): void {
    this.landForm = this.fb.group({
      title: [this.data.title || '', Validators.required],
      description: [this.data.description || '', Validators.required],
      location: [this.data.location || '', Validators.required],
      price: [this.data.price || '', Validators.required],
      landSize: [this.data.landSize || ''], // Remove Validators.required
      phoneNumber: [this.data.phoneNumber || '', Validators.required],
      linkMap: [this.data.linkMap || '', Validators.required],
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
    if (this.landForm.invalid) {
      console.log('Form is invalid, here are the errors:');

      // Log the specific control errors
      Object.keys(this.landForm.controls).forEach((key) => {
        const controlErrors = this.landForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Control: ${key}, Errors:`, controlErrors);
        }
      });

      return;
    }

    console.log('Form is valid, making API call...');

    const formData = new FormData();
    Object.keys(this.landForm.controls).forEach((key) => {
      const value = this.landForm.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.landService.updateLand(this.data.id, formData).subscribe(
      (response) => {
        console.log('Room updated successfully', response);
        this.dialogRef.close(true);
        this.snackBar.open('Room updated successfully', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error updating land:', error);
      }
    );
  }

  // Close the dialog without changes
  onCancel(): void {
    this.dialogRef.close(false); // Pass `false` to indicate no changes were made
  }
}
