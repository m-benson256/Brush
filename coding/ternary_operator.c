#include<stdio.h>
#include<stdbool.h>
int main(){
    //ternary operator ? >> shorthand for if-else statements
    //(condition)? value_if_true: value_if_false;
   /* int x=5;
    int y=7;
    int max=(x>y)?x:y;
    printf("%d", max);*/


    /*bool isOnline=0;
    printf("%s", (isOnline)? "is online": "is offline");*/

   /* int number=8;
    printf("%d is %s", number, (number%2==0)?"even": "odd");*/

    /*int age =25;
    printf("%s", (age>18)?"is an adult": "is under age");*/

   /* int hours =11;
    int minutes=3;
    printf("%02d : %02d %s ", hours, minutes,(hours<12)? "AM":"PM");*/

   int hours =11;
    int minutes=3;
    char *meridiem=(hours<12)? "AM":"PM";
    printf("%02d : %02d %s ", hours, minutes,meridiem); 

}