#include<stdio.h>
#include<stdlib.h>
int main(){


    //calloc(contigous allocation)===allocates memeory dynamically and sets all allocated bytes to zero


    int number =0;

    printf("enter the number of players: ");
     scanf("%d",&number);

     int *scores= calloc(number, sizeof(int));

if(scores==NULL){
    printf("memory allocation failed");
    return 1;
}
 
for(int i=0; i<number; i++){ printf("enter ur number %d ", i+1);
                              scanf("%d",&scores[i]);}

for(int i=0; i<number; i++){ printf("%d ", scores[i]);}

     free(scores);
     scores = NULL;

}