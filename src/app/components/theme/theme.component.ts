import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { NavComponent } from 'src/app/nav/nav.component';


@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.css']
})
export class ThemeComponent {
  // @Output() onEditTheme: EventEmitter<any> = new EventEmitter();
  theme: string = 'default'
  themes: Theme[] = themeList;
  fontSize: string = 'medium'
  fontSizes: Font[] = sizeList;
  constructor(
    private router: Router,
    private navComponent: NavComponent,

  ) {
    var istheme = localStorage.getItem('theme')
    if (istheme) {
      this.theme = istheme;
      this.onTheme(istheme)
    }
    var isFontSize = localStorage.getItem('font-size')
    if (isFontSize) {
      this.fontSize = isFontSize;
      this.onFontSize(isFontSize)
    }
  }

  onSetTheme(theme: string) {
    localStorage.setItem('theme', theme)
    this.navComponent._theme = theme
  }

  onSetFontSize(fs: string) {
    localStorage.setItem('font-size', fs)
    this.navComponent._fontSize = fs
  }

  onFontSize(fs: string) {
    if (fs === this.fontSize) return true
    else return false
  }

  onTheme(theme: string) {
    if (theme === this.theme) return true
    else return false
  }

}

class Theme {
  theme!: string
  name!: string
}

const themeList: Array<Theme> = [
  {
    theme: 'default',
    name: 'Default'
  },
  {
    theme: 'gary',
    name: 'Gary'
  },
  {
    theme: 'pink',
    name: 'Rosegold'
  },
  {
    theme: 'blue',
    name: 'Sky'
  },
  {
    theme: 'green',
    name: 'Grass'
  },
  {
    theme: 'dark',
    name: 'Darkgreen'
  },
  {
    theme: 'darkgold',
    name: 'Mix'
  },
]

class Font {
  size!: string
  name!: string
}

const sizeList: Array<Font> = [
  {
    size: 'small',
    name: 'Small'
  },
  {
    size: 'medium',
    name: 'Default'
  },
  {
    size: 'large',
    name: 'Large'
  }
]
