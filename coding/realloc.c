#include<stdio.h>
#include<stdlib.h>
int main(){

    //realloc(reallocation)== resize prevoisly allocated memory

int number=0;
printf("enter the number of prices: ");
scanf("%d", &number);


float *prices= malloc(number* sizeof(float));

if(prices==NULL){printf("memory allocation failed");
return 1;}

for(int i=0; i<number; i++)
{printf("enter the price%d:", i+1 );
scanf("%f",& prices[i]);}

int newNumber=0;
printf("enter new number");
scanf("%d", &newNumber);


float *temp=realloc(prices, newNumber*sizeof(float));

if(temp== NULL){printf("memory reallocation failed");}
else{prices=temp;}

for(int i=0; i<number; i++){printf("Ugx %.2f", prices[i]);}

free(prices);
prices=NULL;
}