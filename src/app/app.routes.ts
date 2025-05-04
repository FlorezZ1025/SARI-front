import { Routes } from '@angular/router';
import { SignInComponent } from '@auth/sign-in/sign-in.component';
import { HomeComponent } from '@home/home-page/home.component';
import { authGuard } from '@core/guards/auth.guard';
import { LayoutComponent } from '@layout/layout.component';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('@auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        canActivate: [authGuard],
        component: HomeComponent,
      },
      {
        path: 'articles',
        loadComponent: () =>
          import('@articles/articles-page/articles.component').then(
            m => m.ArticlesComponent
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('@project/projects-page/projects.component').then(
            m => m.ProjectsComponent
          ),
      },
      {
        path: 'thesis',
        loadComponent: () =>
          import('./domains/thesis/pages/thesis-page/thesis.component').then(
            m => m.ThesisComponent
          ),
      },
    ],
  },
  {
    path: '**',
    component: SignInComponent,
  },
];
