#include <stdio.h>

struct car {
char model[25];
int year;
int price;
};

int main(){
    // array of structs ==is an array where each element contains a struct{}
    //helps to organise and gruop related data together

struct car cars[]={{"mercedes", 2025, 1000000},
                   {"jeep", 2025, 4000000}};


//struct car car1;
//struct car car2;

int number =sizeof(cars)/sizeof(cars[0]);

for(int i=0; i<number; i++){printf("%s\n %d\n %d\n  ", cars[i].model, cars[i].year, cars[i].price);}

}