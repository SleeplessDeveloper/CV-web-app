import { NgModule } from "@angular/core";
import { declarations, LayoutRoutingModule } from "./layout-routing.module";
import { MaterialModule } from "../shared";
import { MatIcon } from "@angular/material/icon";
import { HomeComponent } from "../features/home/home.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [...declarations],
  imports: [CommonModule, LayoutRoutingModule, MaterialModule, MatIcon, HomeComponent],
  exports: [],
})
export class LayoutModule {}
