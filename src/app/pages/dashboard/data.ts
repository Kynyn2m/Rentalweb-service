
export class DashboardResponse {
  updateBy!: string | null;
  updateAt!: string | null;
  totalEvents!: number;
  totalUsers!: number;
  totalAttendees!: number;
}

export const DashboardList = [
  {
    label: 'request',
    total: 168,
    icon: ''
  },
  {
    label: 'approved',
    total: 121,
    icon: ''
  },
  {
    label: 'rejected',
    total: 11,
    icon: ''
  }, {
    label: 'draft',
    total: 255,
    icon: ''
  },
]
