#include<string.h>
#include<stdio.h>
int main(){
    int age=0;
    char name[60];
    printf("enter your age: ");
    scanf(" %d", &age);

    while(getchar()!='\n');
    printf("enter your name: \n");
    fgets(name, sizeof(name), stdin);
    name[strlen(name)-1]='\0';
    if(strlen(name)==0){printf("iwe kyana we");}
    else{printf("welcome %s, your age is %d", name, age);}
}