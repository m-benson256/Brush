#include<stdio.h>
int main(){
    FILE *pFile = fopen("C:\\Users\\ADMIN\\Desktop output.txt", "w");

    char text[] ="I've gat peace in chaos\n i have unspoken joy";

if(pFile== NULL){printf("error opening file");
                   return 1;}

        fprintf(pFile, "%s", text);
        
        printf("file has been created successfully");
    fclose(pFile);

   


}