import { NgModule } from "@angular/core";
import { declarations, LayoutRoutingModule } from "./layout-routing.module";
import { MaterialModule } from "../shared";
import { MatIcon } from "@angular/material/icon";

@NgModule({
  declarations: [...declarations],
  imports: [LayoutRoutingModule, MaterialModule, MatIcon],
  exports: [],
})
export class LayoutModule {}
