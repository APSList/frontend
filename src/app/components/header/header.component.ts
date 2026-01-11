import { AfterViewInit, Component, ElementRef, ViewChild, ViewChildren, QueryList, OnInit, OnDestroy, inject,  HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AvatarModule } from 'primeng/avatar';
import { SupabaseService } from '../../services/supabase.service';
import {Subscription} from "rxjs";
import {CommonModule} from "@angular/common";

type NavItem = { label: string; route: string };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, AvatarModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  mobileMenuOpen = false;
  public supabase = inject(SupabaseService);
  private authSubscription?: Subscription;

  isLoggedIn = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Bookings', route: '/bookings' },
    { label: 'Properties', route: '/properties' },
    { label: 'Payments', route: '/payments' },
    { label: 'Customers', route: '/customers' },
    { label: 'Users', route: '/users' },
    //{ label: 'Dashboard customer', route: '/dashboard-customer' }
  ];

  activeIndex = 0;

  @ViewChild('indicator', { static: false }) indicator?: ElementRef<HTMLElement>;
  @ViewChild('navBar', { static: false }) navBar?: ElementRef<HTMLElement>;
  @ViewChildren('navBtn') navButtons?: QueryList<ElementRef<HTMLButtonElement>>;

  constructor(private router: Router) {}

  ngOnInit() {
    // Subscribe to user changes
    this.authSubscription = this.supabase.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;

      // If user logs in/out, we need to refresh the indicator position
      if (this.isLoggedIn) {
        queueMicrotask(() => this.updateIndicator());
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    this.authSubscription?.unsubscribe();
  }

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

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }

  // 1. Check the role from the service/token
  get userRole(): string {
    return this.supabase.user()?.user_metadata['role'] || 'MEMBER';
  }


  get userFullName(): string {
    return this.supabase.user()?.user_metadata['full_name'] || '';
  }

  // 2. Create a filtered list of navigation items
  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item => {
      // Hide 'Users' if the user is not an OWNER
      if (item.label === 'Users' && this.userRole !== 'OWNER') {
        return false;
      }
      if (item.label === 'Payments' && this.userRole !== 'OWNER') {
        return false;
      }
      return true;
    });
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
