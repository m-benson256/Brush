#include <stdio.h>
typedef int Number;
int main (){
    //typedef== a reserved keyword that gives an existing datatype a "nickname"
    // helps simplify complex types and improves code readability
    Number x=3;
    Number y=5;
    Number t=9;
    printf("%d %d %d", x,y, t);
}