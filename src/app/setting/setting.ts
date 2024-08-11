export class Element_SETTING {
  id!: number
  transloco!: string
  routerLink!: string
  icon!: string
}

export const MENU_SETTING: Element_SETTING[] = [
  {
    id: 1, transloco: "user",
    routerLink: '/user', icon: 'person'
  }, {
    id: 2, transloco: "role",
    routerLink: '/role', icon: 'home'
  }, {
    id: 3, transloco: "attender-category",
    routerLink: '/attender-category', icon: 'perm_data_setting'
  },{
    id: 5, transloco: "profile",
    routerLink: '/profile', icon: 'person_add'
  },
];
