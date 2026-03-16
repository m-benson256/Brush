#include<stdio.h>
int main(){
    //an array is a collection of elments of the same datatype
    int numbers[]={10, 20, 30, 40, 50, 60};
    //for(int i=0; i<5; i++){printf("%d ", numbers[i]);}
    int size=sizeof(numbers)/sizeof(numbers[0]);
    for(int i=0; i<size; i++){printf("%d ", numbers[i]);}
}