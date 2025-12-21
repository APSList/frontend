import { AfterViewInit, Component, ElementRef, ViewChild, ViewChildren, QueryList, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AvatarModule } from 'primeng/avatar';

type NavItem = { label: string; route: string };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, AvatarModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {
  mobileMenuOpen = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Bookings', route: '/bookings' },
    { label: 'Properties', route: '/properties' },
    { label: 'Payments', route: '/payments' },
    { label: 'Customers', route: '/customers' },
    { label: 'Users', route: '/users' }
  ];

  activeIndex = 0;

  @ViewChild('indicator', { static: false }) indicator?: ElementRef<HTMLElement>;
  @ViewChild('navBar', { static: false }) navBar?: ElementRef<HTMLElement>;
  @ViewChildren('navBtn') navButtons?: QueryList<ElementRef<HTMLButtonElement>>;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.syncActiveFromUrl();
    queueMicrotask(() => this.updateIndicator());

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncActiveFromUrl();
        queueMicrotask(() => this.updateIndicator());
      });
  }

  go(route: string) {
    this.router.navigateByUrl(route);
  }

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // če user spremeni širino okna, naj underline ostane poravnan
  @HostListener('window:resize')
  onResize() {
    this.updateIndicator();
  }

  private syncActiveFromUrl() {
    const url = this.router.url.split('?')[0].split('#')[0];

    // najde “najboljši match” (npr. /customers/123 -> /customers)
    const idx = this.navItems.findIndex(i => url === i.route || url.startsWith(i.route + '/'));
    this.activeIndex = idx >= 0 ? idx : 0;
  }

  private updateIndicator() {
    const indicatorEl = this.indicator?.nativeElement;
    const navEl = this.navBar?.nativeElement;
    const btns = this.navButtons?.toArray();

    if (!indicatorEl || !navEl || !btns?.length) return;

    const activeBtn = btns[this.activeIndex]?.nativeElement;
    if (!activeBtn) return;

    indicatorEl.style.width = `${activeBtn.offsetWidth}px`;
    indicatorEl.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }
}
