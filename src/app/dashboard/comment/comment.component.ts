import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommentService } from 'src/app/Service/comment.service';
import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface Comment {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  replyTo?: { id: number; description: string } | null;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit, AfterViewInit {
  comments = new MatTableDataSource<Comment>([]);
  displayedColumns: string[] = [
    'id',
    'name',
    'description',
    'createdAt',
    'actions',
  ];
  pageSize: number = 10;
  totalComments: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments(0, this.pageSize);
  }

  ngAfterViewInit(): void {
    this.comments.paginator = this.paginator;
  }

  loadComments(page: number, size: number): void {
    this.commentService.getComments(page, size).subscribe((response) => {
      this.comments.data = response.result.result as Comment[];
      this.totalComments = response.result.totalElements;
    });
  }
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.comments.data);
    const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create a blob and trigger the download
    const fileName = 'cmt_data.xlsx';
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = fileName;
    link.click();
  }

  onPageChange(event: PageEvent): void {
    this.loadComments(event.pageIndex, event.pageSize);
  }

  applyFilter(filterValue: string): void {
    this.comments.filter = filterValue.trim().toLowerCase();
  }

  clearFilter(searchInput: HTMLInputElement): void {
    searchInput.value = ''; // Clear the input field
    this.comments.filter = ''; // Reset the filter
  }
  deleteComment(commentId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this comment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.commentService.deleteComment(commentId).subscribe(() => {
          this.loadComments(0, this.pageSize);
          Swal.fire('Deleted!', 'The comment has been deleted.', 'success');
        });
      }
    });
  }
}
