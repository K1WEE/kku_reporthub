import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Map } from '../map/map';

@Component({
  selector: 'app-home',
  imports: [RouterLink,Map],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
