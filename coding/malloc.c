#include <stdio.h>
#include<stdlib.h>

int main (){

    //malloc(memory allocation)== is a function in C that dynamically allocates 
    // a specified number of bytes in memory.
    //used when u have an array but u dont wat its size is going to be

int number=0;
printf("please enter the number of grades: ");
scanf("%d", &number);

char *grades= malloc(number* sizeof(char));

if(grades==NULL){printf("memory allocation failed\n");
return 1;}

for(int i=0; i<number; i++){
    printf("enter grade%d: ", i+1);
    scanf(" %c", &grades[i]);
}

for(int i=0; i<number; i++){
    printf("%c ", grades[i]);
}


free(grades);//returning the rented space back to the operating system
grades = NULL;// avoids dangling pointers








}