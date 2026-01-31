import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { routes } from "./app-routing.module";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from "./app-routing.module";
import { MaterialModule } from "./shared";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from "@angular/platform-browser";
@NgModule({
    declarations:[AppComponent],
    imports:[
        RouterModule.forRoot(routes),
        AppRoutingModule,
        MaterialModule,
        BrowserAnimationsModule,
        BrowserModule,
        ],
    bootstrap:[AppComponent],
    providers: [
      provideAnimationsAsync()
    ]
})

export class AppModule{

}