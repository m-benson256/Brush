#include <stdio.h>
#include <math.h>
int factorial(int n){
    if(n==0)
    return 1;
    else 
    return n*factorial(n-1);
}
int main(){
    int x=0;
    int g=0;
    printf("\nenter the  number:",x);
    scanf("%d", &x);
  
    printf("\n%d",factorial(x) );
}