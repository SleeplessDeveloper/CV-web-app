import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [{
    path:'',
    loadChildren: () => import('./layout/layout.module').then((m) => m.LayoutModule), 
}];
@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})
export class AppRoutingModule{

}