#include <stdio.h>
int sum(int a){
    if(a!=0){
        return a+ sum(a-1);
    }
    else return a;
}
int main(){
    int number=0;
    printf("enter a positive number :");
    scanf("%d", &number);
    
    printf("the sum is %d", sum(number));
}