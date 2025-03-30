import { Routes } from '@angular/router';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ProyectsComponent } from './pages/proyects/proyects.component';
import { ThesisComponent } from './pages/thesis/thesis.component';
import { LayoutComponent } from './pages/layout/layout.component';

export const routes: Routes = [
    {
        path: 'sign-in',
        component: SignInComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
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
                component: ArticlesComponent,
            },
            {
                path: 'proyects',
                component: ProyectsComponent,
            },
            {
                path: 'thesis',
                component: ThesisComponent,
            }
        ]
    },
    {
        path:'**',
        component: SignUpComponent
    }
];
