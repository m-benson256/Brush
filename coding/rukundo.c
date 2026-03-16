#include <stdio.h>

int add(int x){ return x+5;}
int main(){
    int num=0;
    int result=0;
    //printf("rukundo is a butface");
    printf("please enter ur number :");
    scanf("%d",&num);

  result= add(num);

  printf("%d is ur answer", result);

}