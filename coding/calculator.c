#include <stdio.h>
#include <math.h>
int main(){
    int num1=0;
    int num2=0;
    char operater='\0';
    int result=0;
    printf("enter num1:");
    scanf("%d", &num1);
    printf("enter  num2:");
    scanf("%d", & num2);
 printf("enter your operator\n 1. +\n 2. -\n 3. /\n 4. *\n");
scanf("%c", & operater);
switch(operater){
    case '+': result= num1+num2;
              printf("%d +%d= %d", num1, num2, result);
               break;
    case '-':  result= num1-num2;
              printf("%d -%d= %d", num1, num2, result);
    break;
    case '/': 
    if(num2==0){ printf("u cannot divide by zero");}
    else{int result= num1/num2;
              printf("%d /%d= %d", num1, num2, result);}
    break;
    case '*':  result= num1*num2;
              printf("%d *%d= %d", num1, num2, result);
    break;
    default: printf("please enter +,-,/,*");
}
return 0;
}