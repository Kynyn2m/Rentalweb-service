import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, VERSION } from '@angular/core';
import { Route, Router } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-land',
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.css'],
})
export class LandComponent {
  // LandModalComponent= new LandModalComponent
  gridCols = 2; // Set to 4 columns for a 4x5 grid
  // banners!: string;
  banners: string[] = [
    '../../assets/img/pp1.jpg',
    'https://via.placeholder.com/600x200.png?text=ads+2',
  ];
  // onClick(event: { target: any; srcElement: any; currentTarget: any; }){
  //   const imgElem = event.target;
  //   var target = event.target || event.srcElement || event.currentTarget;
  //   var srcAttr = target.attributes.src;
  //   this.LandModalComponent = srcAttr.nodeValue;
  //   console.log("jdsifsuid=========")
  // }
  // land data
  land = [
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L1.jpg', '../../../assets/land/L2.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L2.jpg', '../../../assets/land/L1.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L3.jpg', '../../../assets/land/L1.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L4.jpg', '../../../assets/land/L2.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L2.jpg', '../../../assets/land/L1.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L3.jpg', '../../../assets/land/L4.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L1.jpg', '../../../assets/land/L2.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L2.jpg', '../../../assets/land/L2.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L5.jpg', '../../../assets/land/L6.jpeg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L7.jpeg', '../../../assets/land/L4.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L8.jpeg', '../../../assets/land/L1.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L10.jpeg', '../../../assets/land/L2.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L11.jpg', '../../../assets/land/L3.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L12.jpeg', '../../../assets/land/L5.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L13.jpeg', '../../../assets/land/L6.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L14.jpeg', '../../../assets/land/L7.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L15.jpg', '../../../assets/land/L4.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L16.jpg', '../../../assets/land/L9.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L17.jpg', '../../../assets/land/L10.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../../assets/land/L3.jpg', '../../../assets/land/L1.jpg'],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    {
      title: 'land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=land+1',
        'https://via.placeholder.com/300x200.png?text=land+1+Alt',
      ],
      currentImageIndex: 0,
      bedland: 3,
      bathland: 2,
      floor: 1,
    },
    // Additional land objects...
  ];

  // Pagination properties
  currentPage = 0;
  itemsPerPage = 20; // 4 columns * 5 rows = 20 land per page

  constructor(private breakpointObserver: BreakpointObserver,private router: Router) {
    this.initializeGridCols();
  }

  // Get the paginated land for the current page
  get paginatedland() {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.land.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calculate the total number of pages
  get totalPages() {
    return Math.ceil(this.land.length / this.itemsPerPage);
  }

  // Navigate to the next image in a card
  nextImage(item: any): void {
    item.currentImageIndex = (item.currentImageIndex + 1) % item.images.length;
  }

  // Navigate to the previous image in a card
  prevImage(item: any): void {
    item.currentImageIndex =
      (item.currentImageIndex - 1 + item.images.length) % item.images.length;
  }

  changePage(page: number) {
    this.currentPage = page;
    AOS.refresh(); // Refresh AOS to trigger animations on new content
  }

  // Navigate to the next page
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  // Navigate to the previous page
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  ngOnInit() {
    AOS.init({
      duration: 1200, // Duration of the animation in milliseconds
      once: true, // Whether animation should happen only once - while scrolling down
      mirror: false, // Whether elements should animate out while scrolling past them
    });
  }

  // Get the pages to display with "..." if there are many pages
  get pagesToShow(): number[] {
    const totalVisiblePages = 5; // Number of page numbers to show at a time
    const half = Math.floor(totalVisiblePages / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages, this.currentPage + half + 1);

    if (start === 0) {
      end = Math.min(totalVisiblePages, this.totalPages);
    }
    if (end === this.totalPages) {
      start = Math.max(0, this.totalPages - totalVisiblePages);
    }

    const pages: number[] = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    if (start > 0) {
      pages.unshift(-1); // Indicate "..." before the start
    }
    if (end < this.totalPages) {
      pages.push(-1); // Indicate "..." after the end
    }

    return pages;
  }

  // Initialize the grid columns based on the screen size
  private initializeGridCols(): void {
    const breakpoints = [
      { query: Breakpoints.HandsetPortrait, cols: 1 },
      { query: Breakpoints.HandsetLandscape, cols: 2 },
      { query: Breakpoints.TabletPortrait, cols: 2 },
      { query: Breakpoints.TabletLandscape, cols: 3 },
      { query: Breakpoints.WebPortrait, cols: 4 },
      { query: Breakpoints.WebLandscape, cols: 5 },
    ];

    this.breakpointObserver
      .observe(breakpoints.map((bp) => bp.query))
      .subscribe((result) => {
        for (let bp of breakpoints) {
          if (result.breakpoints[bp.query]) {
            this.gridCols = bp.cols;
            break;
          }
        }
      });
  }
  goToDetails(type: string): void {
    this.router.navigate(['/details'], { queryParams: { type } });
  }
}
