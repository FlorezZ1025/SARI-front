import { Routes } from '@angular/router';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { ThesisComponent } from './pages/thesis/thesis.component';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./pages/auth/sign-up/sign-up.component').then(m => m.SignUpComponent),
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
                loadComponent: () => import('./pages/articles/articles.component').then(m => m.ArticlesComponent),
            },
            {
                path: 'projects',
                loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
            },
            {
                path: 'thesis',
                loadComponent: () => import('./pages/thesis/thesis.component').then(m => m.ThesisComponent),
            }
        ]
    },
    { 
        path:'**',
        component: SignInComponent
    }
];
