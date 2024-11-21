export const environment = {
  production: false,
  roleAdmin: 'ADMIN',
  apiUrl: 'http://172.20.10.2:8080',
  // apiUrl: 'http://localhost:8080',
  // apiUrl: 'https://rantel-backed.onrender.com',
  pageSize: 5,
  sizeZero: 0,
  currentPage: 0,
  pageSizeOptions: [5, 10, 25, 50, 100],
  du: 1000,
  durationInSeconds: 5,
  profileDuration: 10,
  intervalTime: 3500,
  acceptType:
    'application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.slideshow, application/vnd.openxmlformats-officedocument.presentationml.presentation, .doc, .docx, text/plain, application/vnd.ms-powerpoint, application/msword, application/pdf,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, image/png, image/gif, image/jpeg',
  acceptExcel:
    '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,',
  viewAbleExtension: [
    'pdf',
    'PDF',
    'xlsx',
    'XLSX',
    'jpg',
    'JPG',
    'jpeg',
    'JPEG',
    'png',
    'PNG',
    'gif',
    'GIF',
    'docx',
    'DOCX',
  ],
  imgExtension: ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'],
  pdfExtension: ['pdf', 'PDF'],
  excelExtension: ['xlsx', 'XLSX'],
  wordExtension: ['docx', 'DOCX'],
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
