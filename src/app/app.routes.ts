import { Routes } from '@angular/router';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { HomeComponent } from './pages/home/home.component';
//import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: SignInComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    },
    {
        path: 'home',
        //canActivate: [authGuard],
        component: HomeComponent
    },
    {
        path:'**',
        component: SignInComponent
    }
];
