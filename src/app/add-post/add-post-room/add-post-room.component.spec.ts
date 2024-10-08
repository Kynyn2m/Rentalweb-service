import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostRoomComponent } from './add-post-room.component';

describe('AddPostRoomComponent', () => {
  let component: AddPostRoomComponent;
  let fixture: ComponentFixture<AddPostRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPostRoomComponent]
    });
    fixture = TestBed.createComponent(AddPostRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
