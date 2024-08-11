import { Component, OnInit } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { DashboardList, DashboardResponse, } from './data';
import { DashboardService } from './dashboard.service';
import { ResponseModel } from '../../_helpers/response-model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  filterForm: FormGroup;
  dashboardData = DashboardList;
  breakpoint: number | undefined;
  constructor(
    private dashboardService: DashboardService,
  ) {
    this.filterForm = new FormGroup({
      startDate: new FormControl(),
      endDate: new FormControl()
    });
  }


  ngOnInit(): void {
    this.updateGridSize();
  }

  getAll() {
    this.dashboardService.getDashboardCounts().subscribe({
      next: (response) => {
        this.dashboardData = response.data;
      },
    });
  }

  onResize(event: any) {
    this.updateGridSize();
  }

  updateGridSize(): void {
    this.breakpoint = window.innerWidth <= 600 ? 1 : 3;
  }

}
