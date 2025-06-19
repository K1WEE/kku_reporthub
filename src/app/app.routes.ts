import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Map } from './features/map/map';
import { Report } from './features/report/report';
import { Register } from './features/register/register';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },{
        path: 'login',
        component: Login
    },{
        path: 'map',
        component: Map
    },{
        path: 'report',
        component: Report,
        canActivate: [authGuard]
    },{
        path: 'register',
        component: Register
    }
];
