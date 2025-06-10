import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Map } from './features/map/map';

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
    }
];
