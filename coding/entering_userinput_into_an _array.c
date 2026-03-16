#include<stdio.h>
//int main(){
   // int scores[5]={0};
//for(int i=0; i<5; i++){
   // printf("enter a score:");
    //scanf(" %d", &scores[i]);}

    //for(int i=0; i<5; i++){printf("%d ", scores[i]);}
//}
int main (){
    int scores[4] ={0};
    int size= sizeof(scores)/sizeof(scores[0]);
    for(int i=0; i<size; i++){
        printf("enter score: ");
        scanf("\n %d", &scores[i]);}
        
    for(int i=0; i<size; i++){printf("\n %d", scores[i]);}
}