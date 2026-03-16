#include<stdio.h>
int main(){

FILE *pFile = fopen("input.txt", "r");

if(pFile== NULL){printf("coul not open the file");
return 1;}


fclose(pFile);


return 0;
}