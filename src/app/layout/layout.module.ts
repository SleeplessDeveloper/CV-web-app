import { NgModule } from "@angular/core";
import { declarations, LayoutRoutingModule } from "./layout-routing.module";

@NgModule({
  declarations: [...declarations],
  imports: [LayoutRoutingModule],
  exports: [],
})
export class LayoutModule {}
