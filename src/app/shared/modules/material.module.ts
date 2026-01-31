
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatToolbar} from '@angular/material/toolbar';
import { NgModule } from "@angular/core";
import { MatIcon} from '@angular/material/icon';


@NgModule({
    imports:[MatToolbar],
    exports:[
        MatButtonModule,
        MatCardModule,
        MatToolbar]
})
export class MaterialModule{

}