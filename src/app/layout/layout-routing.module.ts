import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NavbarComponent } from "./navbar";
import { FooterComponent } from "./footer";
import { LayoutComponent } from "./layout.component";
import { HomeComponent } from "../features/home/home.component";

export const routes: Routes = [
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent }
    ]
  }
];

export const declarations = [
  NavbarComponent,
  FooterComponent,
  LayoutComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}