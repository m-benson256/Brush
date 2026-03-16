#include <stdio.h>
#include <string.h>
int main(){
    //char fruits[][10]={"Apple","Banana","Coconut"};
   // int size= sizeof(fruits)/sizeof(fruits[0]);

   // fruits[0][0]='e';
    //fruits[0][4]='A';

    //fruits[1][0]='n';
   // fruits[1][4]='B';

  //  for(int i=0;i<size; i++){
       // printf("%s ", fruits[i]); }

    //EXERCISE
    char names[5][25]={0};
    int rows=sizeof(names)/sizeof(names[0]);
   // printf("enter ur name:");
   // fgets(names[0], sizeof(names[0]), stdin);
   // names[0][strlen(names[0])-1]='\0';

    for(int i=0; i<rows; i++){
        printf("enter ur name:");
    fgets(names[i], sizeof(names[i]), stdin);
    names[i][strlen(names[i])-1]='\0';}

   // printf("%s", names[0]);
    for(int i=0; i<rows; i++){printf("%s\n", names[i]);}
}