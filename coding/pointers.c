#include<stdio.h>
void birthday (int *age);
int main(){
    //pointer== a variable that stores the memory address of another variable
    //they help to avoid wasting memoery by allowing you to pass the
    // address of a large data structure instead of copying the entire data

    int age=28;
    int *pAge =&age;
   // printf("%p", &age);
    printf("\n");
   // printf("%p", pAge);

    birthday(pAge);

    printf("\nyou are %d years old");
}
void birthday (int *age){
    //pass by reference so that when the age is incremented, the printed age also increases
    
    (*age)++;
//you have to put the asterisk on age also to de-reference
}