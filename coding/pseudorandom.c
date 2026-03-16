#include<stdio.h>
#include<stdlib.h>
#include<time.h>

int main (){
    srand(time(NULL));
    int min=1;
    int max=100;
    int random_number= (rand()%(max-min+1))+min;     

printf("%d", random_number);

}