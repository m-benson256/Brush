#include<stdio.h>
#include<stdlib.h>
#include<time.h>

int getComputerChoice();
int  getUserChoice();
int checkWinner(int userChoice, int computerChoice);

int main (){
    srand(time(NULL));
    printf("***rock paper scissors**\n");
    int userChoice= getUserChoice();
    int computerChoice= getComputerChoice();
    

switch(userChoice){
    case 1:
    printf("you chose rock.\n");
    break;
    case 2:
    printf("you chose paper.\n");
    break;
    case 3:
    printf("you chose scissors.\n");
    break;
}
switch(computerChoice){
    case 1:
    printf("computer chose rock.\n");
    break;
    case 2:
    printf("computer chose paper.\n");
    break;
    case 3:
    printf("computer chose scissors.\n");
    break;
}
checkWinner(userChoice, computerChoice );
}
int getComputerChoice(){return (rand()%3)+1;}
int  getUserChoice(){
    int choice=0;
    do {
        printf("choose an option\n");
        printf("1. ROCK\n");
         printf("2. PAPER\n");
          printf("3. SCISSORS\n");
          printf("enter your choice: ");
          scanf("%d", &choice);
          return choice;
    }
    while(choice<1 || choice>3);}
int checkWinner(int userChoice, int computerChoice){
    if(userChoice==computerChoice){printf("it's a tie");}
    else if(userChoice==1 && computerChoice==3){printf("you win");}
    else if(userChoice==2 && computerChoice==1){printf("you win");}
    else if(userChoice==3 && computerChoice==2){printf("you win");}
    else{printf("you lose");}
    }