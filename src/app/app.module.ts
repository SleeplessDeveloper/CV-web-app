import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { routes } from "./app-routing.module";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
    declarations:[AppComponent],
    imports:[
        RouterModule.forRoot(routes), 
        AppRoutingModule,
        BrowserModule],
    bootstrap:[AppComponent]
})

export class AppModule{

}