#include<stdio.h>
#include<stdlib.h>
#include<time.h>
int main (){
    srand(time(NULL));
    int guess=0;
    int tries=0;
    int min=1;
    int max=100;
    int answer= (rand()%(max-min+1))+min;

printf("*****welcome*****\n");
do{printf("\nguess a number between %d and %d: ", min, max);
    scanf("%d", &guess);
    tries++;

    if(guess<answer){printf("\ntoo low");}
    else if(guess>answer){printf("\ntoo high");}
    else {printf("correct");}

}while(guess!=answer);

printf("the answer is %d\n", answer);
printf("you took %d tries\n", tries);


}