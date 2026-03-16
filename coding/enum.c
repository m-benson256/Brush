#include <stdio.h>
/*enum Day{
    SUNDAY=1, MONDAY=2, TUESDAY=3, WEDNESDAY=4, FRIDAY=5, SATURDAY=6
};*/

typedef enum {
    SUNDAY=1, MONDAY=2, TUESDAY=3, WEDNESDAY=4, FRIDAY=5, SATURDAY=6
} Day;


int main (){
    //enum(enumerations)== a user-defined data type that consists of a set of named integer constants.
    //benefits== replaces numbers with readable names
    // sunday= 0;
    //monday= 1;

    //enumDay today= SUNDAY; 
    Day today= SUNDAY;

    printf("%d", today);
}